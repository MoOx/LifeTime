open Belt;
open ReactNative;
open ReactMultiversal;

[@react.component]
let make = () => {
  let (_settings, setSettings) = React.useContext(AppSettings.context);
  let theme = Theme.useTheme(AppSettings.useTheme());

  let (notificationStatus, requestNotificationPermission) =
    NotificationsHooks.useNotificationStatus();

  let (onNotificationPopinHeight, setOnNotificationPopinHeight) =
    React.useState(() => None);
  let onNotificationPopinLayout =
    React.useCallback0((layoutEvent: Event.layoutEvent) => {
      let height = layoutEvent.nativeEvent.layout.height;
      setOnNotificationPopinHeight(_ => Some(height));
    });
  let animatedBottomTranslateY = React.useRef(Animated.Value.create(1000.));
  React.useEffect1(
    () => {
      onNotificationPopinHeight
      ->Option.map(_height => {
          Animated.(
            spring(
              animatedBottomTranslateY.current,
              Value.Spring.config(
                ~useNativeDriver=true,
                ~toValue=0.->Value.Spring.fromRawValue,
                ~tension=1.,
                ~delay=250.,
                (),
              ),
            )
            ->Animation.start()
          )
        })
      ->ignore;
      None;
    },
    [|onNotificationPopinHeight|],
  );

  notificationStatus
  ->Option.map(status =>
      status == ReactNativePermissions.granted
      || status == ReactNativePermissions.unavailable
        ? React.null
        : <Animated.View
            onLayout=onNotificationPopinLayout
            style=Style.(
              style(
                // this is what allow to compute height
                // we put this container in absolute + opacity 0
                // then we get height via onLayout, then we switch this to relative
                // and animate the rest
                ~position=`absolute,
                ~bottom=0.->dp,
                ~left=0.->dp,
                ~right=0.->dp,
                ~zIndex=1,
                ~transform=[|
                  translateY(
                    ~translateY=
                      animatedBottomTranslateY.current
                      ->Animated.StyleProp.float,
                  ),
                |],
                (),
              )
            )>
            <SpacedView vertical=S horizontal=S>
              <View
                style=Style.(
                  viewStyle(
                    ~shadowColor="#000",
                    ~shadowOffset=offset(~height=3., ~width=1.),
                    ~shadowOpacity=0.25,
                    ~shadowRadius=6.,
                    (),
                  )
                )>
                <SpacedView
                  horizontal=M
                  vertical=XS
                  style=Style.(
                    array([|
                      theme.styles##background,
                      viewStyle(~borderRadius=Theme.Radius.card, ()),
                    |])
                  )>
                  <TouchableOpacity
                    style=Style.(
                      viewStyle(
                        ~position=`absolute,
                        ~top=(Spacer.space /. 1.5)->dp,
                        ~right=(Spacer.space /. 1.5)->dp,
                        ~zIndex=1,
                        (),
                      )
                    )
                    hitSlop={View.edgeInsets(
                      ~top=10.,
                      ~bottom=10.,
                      ~left=10.,
                      ~right=10.,
                      (),
                    )}
                    onPress={_ => {
                      setSettings(settings =>
                        {
                          ...settings,
                          lastUpdated: Js.Date.now(),
                          notificationsPermissionsDismissed: Js.Date.now(),
                        }
                      )
                    }}>
                    <SVGXmarkSemibold
                      width={14.->Style.dp}
                      height={14.->Style.dp}
                      fill={theme.colors.gray}
                    />
                  </TouchableOpacity>
                  <View style=Style.(viewStyle(~alignItems=`center, ()))>
                    <SpacedView
                      style=Style.(
                        array([|
                          switch (theme.mode) {
                          | `light => theme.styles##backgroundGray6
                          | `dark => theme.styles##backgroundGray5
                          },
                          viewStyle(~borderRadius=1000., ()),
                        |])
                      )>
                      <SVGBellFill
                        fill={theme.colors.blue}
                        width={48.->Style.dp}
                        height={48.->Style.dp}
                      />
                      <View
                        style=Style.(
                          viewStyle(
                            ~position=`absolute,
                            ~top=20.->dp,
                            ~right=20.->dp,
                            ~width=17.->dp,
                            ~height=17.->dp,
                            ~borderRadius=17.,
                            ~zIndex=1,
                            ~backgroundColor=theme.colors.red,
                            (),
                          )
                        )
                      />
                    </SpacedView>
                  </View>
                  <Spacer size=S />
                  <Text
                    style=Style.(
                      array([|
                        Theme.text##title2,
                        Theme.text##bold,
                        theme.styles##textOnBackground,
                      |])
                    )>
                    "Set Up Reminders"->React.string
                  </Text>
                  <Spacer size=XS />
                  <Text
                    style=Style.(
                      array([|
                        Theme.text##body,
                        theme.styles##textOnBackground,
                      |])
                    )>
                    {(
                       "Enabling notifications can help you to stay motivated by giving you quick recap of your progress goals when necessary. "
                       ++ "\n"
                       ++ "Notifications are generated on device."
                     )
                     ->React.string}
                  </Text>
                  <Spacer size=M />
                  <TouchableButton
                    text="Allow Notifications"
                    onPress={_ => requestNotificationPermission()}
                    styleBackground=Style.(
                      viewStyle(~backgroundColor=theme.colors.blue, ())
                    )
                  />
                  <Spacer size=XS />
                </SpacedView>
              </View>
            </SpacedView>
          </Animated.View>
    )
  ->Option.getWithDefault(React.null);
};
