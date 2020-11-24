open Belt;
open ReactNavigation;

let navigatorEmitter = EventEmitter.make();

{
  open ReactNativePushNotification;
  configure(
    configureOptions(
      ~requestPermissions=false,
      ~popInitialNotification=true,
      ~onNotification=
        notification => {
          Js.log(("NOTIFICATION", notification));
          switch (notification.id) {
          | Some(id) when id == Notifications.Ids.reminderDailyCheck =>
            navigatorEmitter->EventEmitter.emit("navigate", "GoalsScreen")
          | _ => ()
          };
          notification.finish(
            ReactNativePushNotificationIOS.FetchResult.noData,
          );
        },
      (),
    ),
  );
  createChannel(
    channel(
      ~channelId="reminders",
      ~channelName="Reminders",
      ~channelDescription="Reminders for your goals",
      (),
    ),
  );
};

type navigationState;
let navigationStateStorageKey = "react-navigation:state:2";
// remove old entries
ReactNativeAsyncStorage.removeItem("react-navigation:state");

[@react.component]
let app = () => {
  let navigationRef = React.useRef(None);
  let rec navigateToIfPossible = navigateTo => {
    switch (navigationRef.current) {
    | Some(navigation) when navigateTo == "GoalsScreen" =>
      navigation->Navigators.RootStack.Navigation.navigateWithParams(
        "GoalsStack",
        Navigators.RootStack.M.params(~screen="GoalsScreen", ()),
      )
    | _ =>
      Js.Global.setTimeout(() => navigateToIfPossible(navigateTo), 250)
      ->ignore
    };
  };
  React.useEffect1(
    () => {
      navigatorEmitter->EventEmitter.on("navigate", navigateTo => {
        navigateToIfPossible(navigateTo)
      });
      None;
    },
    [||],
  );

  let (initialStateContainer, setInitialState) = React.useState(() => None);

  React.useEffect1(
    () => {
      if (initialStateContainer->Option.isNone) {
        ReactNativeAsyncStorage.getItem(navigationStateStorageKey)
        ->FutureJs.fromPromise(error => {
            // @todo error
            Js.log2("Restoring Navigation State: ", error);
            error;
          })
        ->Future.tap(res =>
            switch (res) {
            | Result.Ok(jsonState) =>
              switch (jsonState->Js.Null.toOption) {
              | Some(jsonState) =>
                switch (Js.Json.parseExn(jsonState)) {
                | state => setInitialState(_ => Some(Some(state)))
                | exception _ =>
                  Js.log2(
                    "Restoring Navigation State: unable to decode valid json",
                    jsonState,
                  );
                  setInitialState(_ => Some(None));
                }
              | None => setInitialState(_ => Some(None))
              }
            | Result.Error(e) =>
              Js.log2(
                "Restoring Navigation State: unable to get json state",
                e,
              );
              setInitialState(_ => Some(None));
            }
          )
        ->ignore;
      };
      None;
    },
    [|initialStateContainer|],
  );

  let calendarsContextValue = Calendars.useEvents();
  let isReady = initialStateContainer->Option.isSome;

  // let (initialized, initialized_set) = React.useState(() => false);
  let (optionalSettings, optionalSettings_set) = React.useState(() => None);
  React.useEffect1(
    () => {
      AppSettings.getSettings()
      ->Future.tap(settings => {optionalSettings_set(_ => Some(settings))})
      ->ignore;
      None;
    },
    [||],
  );

  let settings_set = settingsCallback => {
    optionalSettings_set(settings =>
      settings
      ->Option.map(settings => {
          let newSettings = settingsCallback(settings);
          AppSettings.setSettings(newSettings);
          Some(newSettings);
        })
      ->Option.getWithDefault(settings)
    );
  };

  optionalSettings
  ->Option.map(settings => {
      <ReactNativeDarkMode.DarkModeProvider>
        <AppSettings.ContextProvider value=(settings, settings_set)>
          <Calendars.ContextProvider value=calendarsContextValue>
            {initialStateContainer
             ->Option.map(initialState =>
                 <Native.NavigationContainer
                   ref={navigationRef->Obj.magic}
                   ?initialState
                   onStateChange={state => {
                     let maybeJsonState = Js.Json.stringifyAny(state);
                     switch (maybeJsonState) {
                     | Some(jsonState) =>
                       ReactNativeAsyncStorage.setItem(
                         navigationStateStorageKey,
                         jsonState,
                       )
                       ->ignore
                     | None => Js.log("Unable to stringify navigation state")
                     };
                   }}>
                   <Nav.RootNavigator />
                 </Native.NavigationContainer>
               )
             ->Option.getWithDefault(React.null)}
            <Bootsplash isReady />
            <NotificationsRegisterer />
          </Calendars.ContextProvider>
        </AppSettings.ContextProvider>
      </ReactNativeDarkMode.DarkModeProvider>
    })
  ->Option.getWithDefault(React.null);
};
