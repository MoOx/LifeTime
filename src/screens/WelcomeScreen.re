open ReactNative;
open ReactMultiversal;

[@react.component]
let make = (~navigation, ~route as _) => {
  let theme = Theme.useTheme(AppSettings.useTheme());
  <>
    <StatusBar barStyle={Theme.statusBarStyle(theme.mode, `darkContent)} />
    <ScrollView
      style=theme.styles##background
      contentContainerStyle=Predefined.styles##flexGrow>
      <ReactNativeSafeAreaContext.SafeAreaView
        style=Predefined.styles##flexGrow>
        <Welcome
          onAboutPrivacyPress={_ =>
            navigation->Navigators.RootStack.Navigation.navigate(
              "PrivacyModalScreen",
            )
          }
          onContinuePress={_ => {
            ReactNativeCalendarEvents.authorizeEventStore()
            ->FutureJs.fromPromise(error => {
                // @todo error!
                Js.log(error);
                error;
              })
            ->Future.tapOk(status =>
                switch (
                  status->ReactNativeCalendarEvents.authorizationStatusFromJs
                ) {
                | `authorized =>
                  navigation->Navigators.RootStack.Navigation.goBack()
                | `denied
                | `restricted
                | `undetermined =>
                  Alert.alert(
                    ~title=
                      "You need to grant LifeTime access to your calendar in order to work",
                    ~message=
                      "Please edit LifeTime app Settings & grant the access to your calendars, otherwise LifeTime cannot work properly.",
                    ~buttons=[|
                      Alert.button(~text="Cancel", ~style=`destructive, ()),
                      Alert.button(
                        ~text="Settings",
                        ~style=`default,
                        ~onPress=
                          () => ReactNativePermissions.openSettings()->ignore,
                        (),
                      ),
                    |],
                    (),
                  )
                }
              )
            ->Future.tapError(_err =>
                Alert.alert(
                  ~title="Ooops, something bad happened",
                  ~message=
                    "Please report us this error with informations about your device so we can improve LifeTime.",
                  (),
                )
              )
            ->ignore;
            ();
          }}
        />
      </ReactNativeSafeAreaContext.SafeAreaView>
    </ScrollView>
  </>;
};
