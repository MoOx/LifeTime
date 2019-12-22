open ReactNative;

[@react.component]
let make = (~navigation, ~route) => {
  <>
    <StatusBar barStyle=`darkContent />
    <Welcome
      onAboutPrivacyPress={_ =>
        navigation->Navigators.RootStackNavigator.Navigation.navigate(
          "PrivacyModalScreen",
        )
      }
      onContinuePress={_ => {
        ReactNativeCalendarEvents.authorizeEventStore()
        ->FutureJs.fromPromise(error => {
            // @todo ?
            Js.log(error);
            error;
          })
        ->Future.tapOk(status =>
            switch (status) {
            | "authorized" =>
              navigation->Navigators.RootStackNavigator.Navigation.navigate(
                "HomeScreen",
              )
            | "denied"
            | "restricted"
            | "undetermined"
            | _ =>
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
  </>;
};
