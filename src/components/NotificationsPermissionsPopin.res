open Belt
open ReactNative
open ReactNative.Style
open ReactMultiversal

@react.component
let make = () => {
  let (_settings, setSettings) = React.useContext(AppSettings.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let (
    notificationStatus,
    requestNotificationPermission,
  ) = NotificationsHooks.useNotificationStatus()

  let (onNotificationPopinHeight, setOnNotificationPopinHeight) = React.useState(() => None)
  let onNotificationPopinLayout = React.useCallback1((layoutEvent: Event.layoutEvent) => {
    let height = layoutEvent.nativeEvent.layout.height
    setOnNotificationPopinHeight(_ => Some(height))
  }, [setOnNotificationPopinHeight])
  let animatedBottomTranslateY = React.useRef(Animated.Value.create(1000.))
  React.useEffect1(() => {
    onNotificationPopinHeight
    ->Option.map(_height => {
      open Animated
      spring(
        animatedBottomTranslateY.current,
        Value.Spring.config(
          ~useNativeDriver=true,
          ~toValue=0.->Value.Spring.fromRawValue,
          ~tension=1.,
          ~delay=250.,
          (),
        ),
      )->Animation.start()
    })
    ->ignore
    None
  }, [onNotificationPopinHeight])

  notificationStatus
  ->Option.map(status =>
    status == ReactNativePermissions.granted || status == ReactNativePermissions.unavailable
      ? React.null
      : <Animated.View
          onLayout=onNotificationPopinLayout
          style={style(
            // this is what allow to compute height
            // we put this container in absolute + opacity 0
            // then we get height via onLayout, then we switch this to relative
            // and animate the rest
            ~position=#absolute,
            ~bottom=0.->dp,
            ~left=0.->dp,
            ~right=0.->dp,
            ~zIndex=1,
            ~transform=[
              translateY(~translateY=animatedBottomTranslateY.current->Animated.StyleProp.float),
            ],
            (),
          )}>
          <SpacedView vertical=S horizontal=S>
            <View
              style={viewStyle(
                ~shadowColor="#000",
                ~shadowOffset=offset(~height=3., ~width=1.),
                ~shadowOpacity=0.25,
                ~shadowRadius=6.,
                (),
              )}>
              <SpacedView
                horizontal=M
                vertical=XS
                style={array([
                  theme.styles["background"],
                  viewStyle(~borderRadius=Theme.Radius.card, ()),
                ])}>
                <TouchableOpacity
                  style={viewStyle(
                    ~position=#absolute,
                    ~top=(Spacer.space /. 1.5)->dp,
                    ~right=(Spacer.space /. 1.5)->dp,
                    ~zIndex=1,
                    (),
                  )}
                  hitSlop=HitSlops.m
                  onPress={_ =>
                    setSettings(settings => {
                      ...settings,
                      lastUpdated: Js.Date.now(),
                      notificationsPermissionsDismissed: Js.Date.now(),
                    })}>
                  <SVGXmarkSemibold width={14.->dp} height={14.->dp} fill=theme.colors.gray />
                </TouchableOpacity>
                <View style={viewStyle(~alignItems=#center, ())}>
                  <SpacedView
                    style={array([
                      switch theme.mode {
                      | #light => theme.styles["backgroundGray6"]
                      | #dark => theme.styles["backgroundGray5"]
                      },
                      viewStyle(~borderRadius=1000., ()),
                    ])}>
                    <SVGBellFill fill=theme.colors.blue width={48.->dp} height={48.->dp} />
                    <View
                      style={viewStyle(
                        ~position=#absolute,
                        ~top=20.->dp,
                        ~right=20.->dp,
                        ~width=17.->dp,
                        ~height=17.->dp,
                        ~borderRadius=17.,
                        ~zIndex=1,
                        ~backgroundColor=theme.colors.red,
                        (),
                      )}
                    />
                  </SpacedView>
                </View>
                <Spacer size=S />
                <Text
                  style={array([
                    Theme.text["title2"],
                    Theme.text["weight700"],
                    theme.styles["text"],
                  ])}>
                  {"Set Up Reminders"->React.string}
                </Text>
                <Spacer size=XS />
                <Text style={array([Theme.text["body"], theme.styles["text"]])}>
                  {("Enabling notifications can help you to stay motivated by giving you quick recap of your progress goals when necessary. " ++
                  ("\n" ++
                  "Notifications are generated on device."))->React.string}
                </Text>
                <Spacer size=M />
                <TouchableButton
                  testID="NotificationsPermissionsPopin_Button_request"
                  text="Continue"
                  onPress={_ => requestNotificationPermission()}
                  styleBackground={viewStyle(~backgroundColor=theme.colors.blue, ())}
                />
                <Spacer size=XS />
              </SpacedView>
            </View>
          </SpacedView>
        </Animated.View>
  )
  ->Option.getWithDefault(React.null)
}
