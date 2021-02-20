open Belt
open ReactNavigation

ReactNativeScreens.enableScreens()

let navigatorEmitter = EventEmitter.make()

{
  open ReactNativePushNotification
  configure(
    configureOptions(
      ~requestPermissions=false,
      ~popInitialNotification=true,
      ~onNotification=notification => {
        Js.log(("[LifeTime] App: onNotification ", notification))
        switch notification.id {
        | Some(id) when id == Notifications.Ids.reminderDailyCheck =>
          navigatorEmitter->EventEmitter.emit("navigate", "GoalsScreen")
        | _ => ()
        }
        notification.finish(ReactNativePushNotificationIOS.FetchResult.noData)
      },
      (),
    ),
  )
  createChannel(
    channel(
      ~channelId="reminders",
      ~channelName="Reminders",
      ~channelDescription="Reminders for your goals",
      (),
    ),
  )
}

type navigationState
let navigationStateStorageKey = "react-navigation:state:2"
// remove old entries
ReactNativeAsyncStorage.removeItem("react-navigation:state")->ignore

let rec navigateToIfPossible = (navigation, navigateTo) =>
  switch navigation {
  | Some(navigation) when navigateTo == "GoalsScreen" =>
    navigation->Navigators.RootStack.Navigation.navigateWithParams(
      "GoalsStack",
      Navigators.RootStack.M.params(~screen="GoalsScreen", ()),
    )
  | _ => Js.Global.setTimeout(() => navigateToIfPossible(navigation, navigateTo), 250)->ignore
  }

@react.component
let app = () => {
  let navigationRef = React.useRef(None)
  React.useEffect1(() => {
    Js.log("[LifeTime] App: navigatorEmitter on(navigate) ")
    navigatorEmitter->EventEmitter.on("navigate", navigateTo =>
      navigateToIfPossible(navigationRef.current, navigateTo)
    )
    None
  }, [])

  let (initialStateContainer, setInitialState) = React.useState(() => None)

  React.useEffect2(() => {
    if initialStateContainer->Option.isNone {
      Js.log("[LifeTime] App: Restoring Navigation initialStateContainer is empty")
      ReactNativeAsyncStorage.getItem(navigationStateStorageKey)
      ->FutureJs.fromPromise(error => {
        // @todo error
        Js.log(("[LifeTime] App: Restoring Navigation State: ", error))
        error
      })
      ->Future.tap(res => {
        Js.log("[LifeTime] App: Restoring Navigation State")
        switch res {
        | Result.Ok(jsonState) =>
          switch jsonState->Js.Null.toOption {
          | Some(jsonState) =>
            switch Js.Json.parseExn(jsonState) {
            | state => setInitialState(_ => Some(Some(state)))
            | exception _ =>
              Js.log((
                "[LifeTime] App: Restoring Navigation State: unable to decode valid json",
                jsonState,
              ))
              setInitialState(_ => Some(None))
            }
          | None => setInitialState(_ => Some(None))
          }
        | Result.Error(e) =>
          Js.log(("[LifeTime] App: Restoring Navigation State: unable to get json state", e))
          setInitialState(_ => Some(None))
        }
      })
      ->ignore
    }
    None
  }, (initialStateContainer, setInitialState))

  let calendarsContextValue = Calendars.useEventsContext()
  let isReady = initialStateContainer->Option.isSome

  // let (initialized, initialized_set) = React.useState(() => false);
  let (optionalSettings, optionalSettings_set) = React.useState(() => None)
  React.useEffect1(() => {
    AppSettings.getSettings()
    ->Future.tap(settings => optionalSettings_set(_ => Some(settings)))
    ->ignore
    None
  }, [optionalSettings_set])

  let settings_set = settingsCallback =>
    optionalSettings_set(settings =>
      settings
      ->Option.map(settings => {
        let newSettings = settingsCallback(settings)
        AppSettings.setSettings(newSettings)
        Some(newSettings)
      })
      ->Option.getWithDefault(settings)
    )

  optionalSettings
  ->Option.map(settings =>
    <ReactNativeSafeAreaContext.SafeAreaProvider>
      <AppSettings.ContextProvider value=(settings, settings_set)>
        <Calendars.ContextProvider value=calendarsContextValue>
          {initialStateContainer
          ->Option.map(initialState =>
            <Native.NavigationContainer
              ref={navigationRef->Obj.magic}
              // doesn't work properly with native-stack
              // ?initialState
              onStateChange={state => {
                let maybeJsonState = Js.Json.stringifyAny(state)
                switch maybeJsonState {
                | Some(jsonState) =>
                  ReactNativeAsyncStorage.setItem(navigationStateStorageKey, jsonState)->ignore
                | None =>
                  Js.log(
                    "[LifeTime] App: <Native.NavigationContainer> onStateChange: Unable to stringify navigation state",
                  )
                }
              }}>
              <Nav.RootNavigator />
            </Native.NavigationContainer>
          )
          ->Option.getWithDefault(React.null)}
          <Bootsplash isReady />
          <NotificationsRegisterer />
        </Calendars.ContextProvider>
      </AppSettings.ContextProvider>
    </ReactNativeSafeAreaContext.SafeAreaProvider>
  )
  ->Option.getWithDefault(React.null)
}
