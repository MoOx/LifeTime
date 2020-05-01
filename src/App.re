open Belt;
open ReactNative;
open ReactMultiversal;
open ReactNavigation;

let styles =
  Style.{"container": viewStyle(~flexGrow=1., ~backgroundColor="#fff", ())}
  ->StyleSheet.create;

module StatsStackScreen = {
  open Navigators;

  [@react.component]
  let make = (~navigation as _) => {
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
            ~headerStyle=theme.styles##stackHeader,
            ~headerTitleStyle=theme.styles##textOnBackground,
            ~headerTintColor=theme.colors.blue,
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
  let make = (~navigation as _) => {
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
  let make = (~navigation as _) => {
    <SettingsStack.Navigator
      screenOptions={_ => Stack.TransitionPresets.slideFromRightIOS}>
      <SettingsStack.Screen
        name="SettingsScreen"
        component=SettingsScreen.make
        options={_ => StatsStack.options(~headerShown=false, ())}
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
            list([
              theme.styles##background,
              viewStyle(~borderTopColor=theme.colors.gray4, ()),
            ])
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
            ~title="Settings",
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
            // @todo ?
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
  let calendarsContextValue = Calendars.useEvents();

  let isReady = initialStateContainer->Option.isSome;
  <ReactNativeDarkMode.DarkModeProvider>
    <AppSettings.ContextProvider value=appSettingsContextValue>
      <Calendars.ContextProvider value=calendarsContextValue>
        {initialStateContainer
         ->Option.map(initialState =>
             <Native.NavigationNativeContainer
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
             </Native.NavigationNativeContainer>
           )
         ->Option.getWithDefault(React.null)}
        <Bootsplash isReady />
      </Calendars.ContextProvider>
    </AppSettings.ContextProvider>
  </ReactNativeDarkMode.DarkModeProvider>;
};
