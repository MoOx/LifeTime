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
    let themeStyle = Theme.useStyles();
    let themeColors = Theme.useColors();
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
              screenOptions##route##params
              ->Option.flatMap(params => params##currentActivity)
              ->Option.getWithDefault("Activity"),
            ~headerBackTitle="Back",
            ~headerTitleContainerStyle=
              Style.(
                viewStyle(~paddingHorizontal=(Spacer.space *. 3.)->dp, ())
              ),
            ~headerStyle=themeStyle##stackHeader,
            ~headerTitleStyle=themeStyle##textOnBackground,
            ~headerTintColor=themeColors.blue,
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
    let themeStyle = Theme.useStyles();
    let themeColors = Theme.useColors();
    <Tabs.Navigator
      initialRouteName="StatsStack"
      tabBarOptions={Tabs.bottomTabBarOptions(
        ~activeTintColor=themeColors.blue,
        ~inactiveTintColor=themeColors.gray,
        ~style=
          Style.(
            list([
              themeStyle##background,
              viewStyle(~borderTopColor=themeColors.gray4, ()),
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
                <SVGtimeline
                  width={tabBarIconProps##size->ReactFromSvg.Size.dp}
                  height={tabBarIconProps##size->ReactFromSvg.Size.dp}
                  fill=tabBarIconProps##color
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
                <SVGpennant
                  width={tabBarIconProps##size->ReactFromSvg.Size.dp}
                  height={tabBarIconProps##size->ReactFromSvg.Size.dp}
                  fill=tabBarIconProps##color
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
                <SVGsettings
                  width={tabBarIconProps##size->ReactFromSvg.Size.dp}
                  height={tabBarIconProps##size->ReactFromSvg.Size.dp}
                  fill=tabBarIconProps##color
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

  let (settings, setSettings) = AppSettings.useSettings();
  let isReady = initialStateContainer->Option.isSome;
  <ReactNativeDarkMode.DarkModeProvider>
    <AppSettings.ContextProvider value=(settings, setSettings)>
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
    </AppSettings.ContextProvider>
  </ReactNativeDarkMode.DarkModeProvider>;
};
