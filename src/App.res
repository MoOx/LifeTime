open Belt
open ReactNative
open ReactNavigation

NativeStack.enableScreens()

let navigatorEmitter = EventEmitter.make()

{
  open ReactNativePushNotification
  configure(
    configureOptions(
      ~requestPermissions=false,
      ~popInitialNotification=true,
      ~onNotification=notification => {
        Log.info(("App: onNotification ", notification))
        // switch notification.id {
        // | Some(id) when id == Notifications.Ids.reminderDailyCheck =>
        //   navigatorEmitter->EventEmitter.emit("navigate", "GoalsScreen")
        // | _ => ()
        // }
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
  | Some(navigation) if navigateTo == "GoalsScreen" =>
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
    Log.info("App: navigatorEmitter on(navigate) ")
    navigatorEmitter->EventEmitter.on("navigate", navigateTo =>
      navigateToIfPossible(navigationRef.current, navigateTo)
    )
    None
  }, [])

  let (initialStateContainer, setInitialState) = React.useState(() => None)

  React.useEffect2(() => {
    if initialStateContainer->Option.isNone {
      Log.info("App: Restoring Navigation initialStateContainer is empty")
      ReactNativeAsyncStorage.getItem(navigationStateStorageKey)
      ->FuturePromise.fromPromise
      ->Future.mapError(error => {
        // @todo error
        Log.info(("App: Restoring Navigation State: ", error))
        error
      })
      ->Future.tap(res => {
        Log.info("App: Restoring Navigation State")
        switch res {
        | Result.Ok(jsonState) =>
          switch jsonState->Js.Null.toOption {
          | Some(jsonState) =>
            switch Js.Json.parseExn(jsonState) {
            | state => setInitialState(_ => Some(Some(state)))
            | exception _ =>
              Log.info(("App: Restoring Navigation State: unable to decode valid json", jsonState))
              setInitialState(_ => Some(None))
            }
          | None => setInitialState(_ => Some(None))
          }
        | Result.Error(e) =>
          Log.info(("App: Restoring Navigation State: unable to get json state", e))
          setInitialState(_ => Some(None))
        }
      })
      ->ignore
    }
    None
  }, (initialStateContainer, setInitialState))

  let onStateChange = React.useCallback0(state => {
    let maybeJsonState = Js.Json.stringifyAny(state)
    switch maybeJsonState {
    | Some(jsonState) =>
      ReactNativeAsyncStorage.setItem(navigationStateStorageKey, jsonState)->ignore
    | None =>
      Log.info(
        "App: <Native.NavigationContainer> onStateChange: Unable to stringify navigation state",
      )
    }
  })

  let calendarsContextValue = Calendars.useEventsContext()
  let onReady = React.useCallback0(() => {
    ReactNativeBootsplash.hide({fade: true})->Js.Promise.then_(() => {
      Log.info("BootSplash: fading is over")
      Js.Promise.resolve()
    }, _)->Js.Promise.catch(error => {
      Log.info(("BootSplash: cannot hide splash", error))
      Js.Promise.resolve()
    }, _)->ignore
    ()
  })

  // let (initialized, initialized_set) = React.useState(() => false);
  let (optionalSettings, optionalSettings_set) = React.useState(() => None)
  React.useEffect1(() => {
    AppSettings.getSettings()
    ->Future.tap(settings => optionalSettings_set(_ => Some(settings)))
    ->ignore
    None
  }, [optionalSettings_set])

  let settings_set = settingsCallback => {
    Log.info("App: Updating settings")
    InteractionManager.runAfterInteractions(() => {
      Js.Global.setTimeout(() => {
        optionalSettings_set(settings =>
          settings
          ->Option.map(settings => {
            let newSettings = settingsCallback(settings)
            InteractionManager.runAfterInteractions(() => {
              Js.Global.setTimeout(() => {
                AppSettings.setSettings(newSettings)
              }, 0)->ignore
            })->ignore
            Some(newSettings)
          })
          ->Option.getWithDefault(settings)
        )
      }, 0)->ignore
    })->ignore
  }

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
              ?initialState
              onStateChange
              onReady>
              <Nav.RootNavigator />
            </Native.NavigationContainer>
          )
          ->Option.getWithDefault(React.null)}
          <NotificationsRegisterer
            notificationsRecurrentRemindersOn=settings.notificationsRecurrentRemindersOn
            notificationsRecurrentReminders=settings.notificationsRecurrentReminders
          />
        </Calendars.ContextProvider>
      </AppSettings.ContextProvider>
    </ReactNativeSafeAreaContext.SafeAreaProvider>
  )
  ->Option.getWithDefault(React.null)
}
