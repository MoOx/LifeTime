open Belt;
open ReactNative;
open ReactMultiversal;
open ReactNavigation;

if (Global.__DEV__) {
  Global.unstable_enableLogBox();
};

let navigatorEmitter = EventEmitter.make();

ReactNativePushNotification.(
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
  )
);

let styles =
  Style.{"container": viewStyle(~flexGrow=1., ~backgroundColor="#fff", ())}
  ->StyleSheet.create;

module StatsStackScreen = {
  open Navigators;

  [@react.component]
  let make = (~navigation as _, ~route as _) => {
    let theme = Theme.useTheme(AppSettings.useTheme());
    <StatsStack.Navigator
      screenOptions={_ => Stack.TransitionPresets.slideFromRightIOS}>
      <StatsStack.Screen
        name="HomeScreen"
        component=HomeScreen.make
        options={_ => StatsStack.options(~headerShown=false, ())}
      />
      <StatsStack.Screen
        name="ActivityOptionsScreen"
        component=ActivityOptionsScreen.make
        options={screenOptions =>
          StatsStack.options(
            ~title=
              screenOptions.route.params
              ->Option.flatMap(params => params.currentActivityTitle)
              ->Option.getWithDefault("Activity"),
            ~headerBackTitle="Back",
            ~headerTitleContainerStyle=
              Style.(
                viewStyle(~paddingHorizontal=(Spacer.space *. 3.)->dp, ())
              ),
            ~headerTintColor=theme.colors.blue,
            ~headerTitleStyle=theme.styles##textOnBackground,
            ~headerStyle=theme.styles##stackHeader,
            (),
          )
        }
      />
    </StatsStack.Navigator>;
  };
};

module GoalsStackScreen = {
  open Navigators;

  [@react.component]
  let make = (~navigation as _, ~route as _) => {
    <GoalsStack.Navigator
      screenOptions={_ => Stack.TransitionPresets.slideFromRightIOS}>
      <GoalsStack.Screen
        name="GoalsScreen"
        component=GoalsScreen.make
        options={_ => GoalsStack.options(~headerShown=false, ())}
      />
    </GoalsStack.Navigator>;
  };
};

module SettingsStackScreen = {
  open Navigators;

  [@react.component]
  let make = (~navigation as _, ~route as _) => {
    let theme = Theme.useTheme(AppSettings.useTheme());
    <SettingsStack.Navigator
      screenOptions={_ => Stack.TransitionPresets.slideFromRightIOS}>
      <SettingsStack.Screen
        name="SettingsScreen"
        component=SettingsScreen.make
        options={_ =>
          StatsStack.options(
            ~headerShown=false,
            ~title=SettingsScreen.title,
            (),
          )
        }
      />
      <SettingsStack.Screen
        name="SettingsDangerZoneScreen"
        component=SettingsDangerZoneScreen.make
        options={_ =>
          StatsStack.options(~title=SettingsDangerZoneScreen.title, ())
        }
      />
      <SettingsStack.Screen
        name="SettingsNotificationsScreen"
        component=SettingsNotificationsScreen.make
        options={_ =>
          StatsStack.(
            options(
              ~title=SettingsNotificationsScreen.title,
              ~headerTintColor=theme.colors.blue,
              ~headerTitleStyle=theme.styles##textOnBackground,
              ~headerStyle=theme.styles##stackHeader,
              (),
            )
          )
        }
      />
    </SettingsStack.Navigator>;
  };
};

module TabsScreen = {
  open Navigators;

  [@react.component]
  let make = (~navigation as _, ~route as _) => {
    let theme = Theme.useTheme(AppSettings.useTheme());
    <Tabs.Navigator
      initialRouteName="StatsStack"
      tabBarOptions={Tabs.bottomTabBarOptions(
        ~activeTintColor=theme.colors.blue,
        ~inactiveTintColor=theme.colors.gray,
        ~style=
          Style.(
            array([|
              theme.styles##background,
              viewStyle(~borderTopColor=theme.colors.gray4, ()),
            |])
          ),
        (),
      )}>
      <Tabs.Screen
        name="StatsStack"
        component=StatsStackScreen.make
        options={_props =>
          Tabs.options(
            ~title="Summary",
            ~tabBarIcon=
              tabBarIconProps =>
                <SVGTimeline
                  width={tabBarIconProps.size->Style.dp}
                  height={tabBarIconProps.size->Style.dp}
                  fill={tabBarIconProps.color}
                />,
            (),
          )
        }
      />
      <Tabs.Screen
        name="GoalsStack"
        component=GoalsStackScreen.make
        options={_props =>
          Tabs.options(
            ~title="Goals",
            ~tabBarIcon=
              tabBarIconProps =>
                <SVGPennant
                  width={tabBarIconProps.size->Style.dp}
                  height={tabBarIconProps.size->Style.dp}
                  fill={tabBarIconProps.color}
                />,
            (),
          )
        }
      />
      <Tabs.Screen
        name="SettingsStack"
        component=SettingsStackScreen.make
        options={_props =>
          Tabs.options(
            ~title=SettingsScreen.title,
            ~tabBarIcon=
              tabBarIconProps =>
                <SVGSettings
                  width={tabBarIconProps.size->Style.dp}
                  height={tabBarIconProps.size->Style.dp}
                  fill={tabBarIconProps.color}
                />,
            (),
          )
        }
      />
    </Tabs.Navigator>;
  };
};

module RootNavigator = {
  open Navigators;

  [@react.component]
  let make = () => {
    <RootStack.Navigator
      initialRouteName="Tabs"
      mode=`modal
      headerMode=`none
      screenOptions={_ =>
        RootStack.options(~gestureEnabled=true, ~cardOverlayEnabled=true, ())
        ->Stack.mergeOptions(Stack.TransitionPresets.modalPresentationIOS)
      }>
      <RootStack.Screen name="Tabs" component=TabsScreen.make />
      <RootStack.Screen
        name="WelcomeModalScreen"
        component=WelcomeScreen.make
        // disable gesture cause we don't allow people to bypass this screen
        options={_ => RootStack.options(~gestureEnabled=false, ())}
      />
      <RootStack.Screen
        name="PrivacyModalScreen"
        component=PrivacyModalScreen.make
      />
      <RootStack.Screen
        name="FiltersModalScreen"
        component=FiltersModalScreen.make
      />
      <RootStack.Screen
        name="GoalNewModalScreen"
        component=GoalNewModalScreen.make
      />
      <RootStack.Screen
        name="GoalEditModalScreen"
        component=GoalEditModalScreen.make
      />
      <RootStack.Screen
        name="HelpModalScreen"
        component=HelpModalScreen.make
      />
    </RootStack.Navigator>;
  };
};
type navigationState;
let navigationStateStorageKey = "react-navigation:state";

[@react.component]
let app = () => {
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

  let appSettingsContextValue = AppSettings.useSettings();
  let (settings, _setSettings) = appSettingsContextValue;

  // clean badges when app is active
  let appState = ReactNativeHooks.useAppState();
  React.useEffect1(
    () => {
      if (appState === AppState.active) {
        ReactNativePushNotification.setApplicationIconBadgeNumber(0);
      };
      None;
    },
    [|appState|],
  );

  // update daily notification when opening the app
  let (notificationStatus, _requestNotificationPermission) =
    Notifications.useNotificationStatus();
  React.useEffect1(
    () => {
      if (notificationStatus === Some(ReactNativePermissions.granted)) {
        ReactNativePushNotification.cancelLocalNotifications({
          "id": Notifications.Ids.reminderDailyCheck,
        });

        if (settings.notificationsDailyRemindersState) {
          open Js.Date;
          let minutesGapToAvoidTooCloseNotif = 30.;
          let appropriateHour = 9.;
          let todayOrTomorrowAppropriateTime = date => {
            // date + 1j if...
            let adjustedDate =
              if (date->getHours >= appropriateHour
                  // you open the app 30min before the notification
                  // (weg: you open at 8:30+ => delay to avoid a notification poping at 9:00)
                  || date->getHours == appropriateHour
                  -. 1.
                  && date->getMinutes > minutesGapToAvoidTooCloseNotif) {
                // you open the app after the notification hour
                (date->Js.Date.getTime +. 1000. *. 60. *. 60. *. 24.)
                ->Js.Date.fromFloat;
                // if we open the app after midnight, we still want notif in the morning
              } else {
                // date+0j
                date;
              };
            makeWithYMDHMS(
              ~year=adjustedDate->getFullYear,
              ~month=adjustedDate->getMonth,
              ~date=adjustedDate->getDate,
              ~hours=appropriateHour,
              ~minutes=0.,
              ~seconds=0.,
              (),
            );
          };
          ReactNativePushNotification.(
            localNotificationScheduleOptions(
              ~id=Notifications.Ids.reminderDailyCheck,
              ~userInfo={"id": Notifications.Ids.reminderDailyCheck},
              ~date=
                Js.Date.now()
                ->Js.Date.fromFloat
                ->todayOrTomorrowAppropriateTime,
              ~message="Check at your goals progress",
              ~repeatType=`day,
              ~number=1,
              ~priority=`low,
              ~importance=`default,
              ~ignoreInForeground=true,
              (),
            )
            ->localNotificationSchedule
          );
        };
      };
      None;
    },
    [|notificationStatus|],
  );

  let navigationRef = React.useRef(None);
  React.useEffect1(
    () => {
      navigatorEmitter->EventEmitter.on("navigate", navigateTo => {
        switch (navigationRef.current) {
        | Some(navigation) when navigateTo == "GoalsScreen" =>
          navigation->Navigators.RootStack.Navigation.navigateWithParams(
            "GoalsStack",
            Navigators.RootStack.M.params(~screen="GoalsScreen", ()),
          )

        | _ => ()
        }
      });
      None;
    },
    [||],
  );

  let calendarsContextValue = Calendars.useEvents();
  let isReady = initialStateContainer->Option.isSome;

  <ReactNativeDarkMode.DarkModeProvider>
    <AppSettings.ContextProvider value=appSettingsContextValue>
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
               <RootNavigator />
             </Native.NavigationContainer>
           )
         ->Option.getWithDefault(React.null)}
        <Bootsplash isReady />
      </Calendars.ContextProvider>
    </AppSettings.ContextProvider>
  </ReactNativeDarkMode.DarkModeProvider>;
};
