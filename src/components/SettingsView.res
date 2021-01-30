open ReactNative
open ReactMultiversal

let title = "Settings"

@react.component
let make = (~navigation) => {
  let (_settings, setSettings) = React.useContext(AppSettings.context)
  let themeKey = AppSettings.useTheme()
  let theme = Theme.useTheme(AppSettings.useTheme())

  <>
    <SpacedView>
      <TitlePre> {" "->React.string} </TitlePre>
      <Text
        style={Style.array([
          Theme.text["largeTitle"],
          Theme.text["weight700"],
          theme.styles["text"],
        ])}>
        {title->React.string}
      </Text>
    </SpacedView>
    <ListSeparator />
    <ListItem
      onPress={_ =>
        navigation->Navigators.RootStack.Navigation.navigate("SettingsNotificationsScreen")}
      icon={<SVGAppBadge width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      {SettingsNotificationsScreen.title->React.string}
    </ListItem>
    <ListSeparator />
    <Spacer />
    <ListHeader text="Theme" />
    <ListSeparator />
    <ListItem
      separator=true
      onPress={_ =>
        setSettings(settings => {...settings, lastUpdated: Js.Date.now(), theme: "light"})}
      icon={<SVGSunoutline width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}
      right={switch themeKey {
      | #light =>
        <SVGCheckmark width={22.->Style.dp} height={22.->Style.dp} fill=theme.colors.blue />
      | _ => React.null
      }}>
      {"Light"->React.string}
    </ListItem>
    <ListItem
      separator=true
      onPress={_ =>
        setSettings(settings => {...settings, lastUpdated: Js.Date.now(), theme: "dark"})}
      icon={<SVGMoonsymbol width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.indigo />}
      right={switch themeKey {
      | #dark =>
        <SVGCheckmark width={22.->Style.dp} height={22.->Style.dp} fill=theme.colors.blue />
      | _ => React.null
      }}>
      {"Dark"->React.string}
    </ListItem>
    <ListItem
      separator=true
      onPress={_ =>
        setSettings(settings => {...settings, lastUpdated: Js.Date.now(), theme: "auto"})}
      icon={<SVGMoonshine width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.purple />}
      right={switch themeKey {
      | #auto =>
        <SVGCheckmark width={22.->Style.dp} height={22.->Style.dp} fill=theme.colors.blue />
      | _ => React.null
      }}>
      {"Auto"->React.string}
    </ListItem>
    <ListSeparator />
    <BlockFootnote>
      {"Auto theme will switch between Light & Dark automatically to match your system settings."->React.string}
    </BlockFootnote>
    <Spacer />
    <ListHeader text="More" />
    <ListSeparator />
    <ListItem
      separator=true
      onPress={_ => navigation->Navigators.RootStack.Navigation.navigate("HelpModalScreen")}
      icon={<SVGInfo width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      {"Help"->React.string}
    </ListItem>
    <ListItem
      separator=true
      onPress={_ => navigation->Navigators.RootStack.Navigation.navigate("WelcomeModalScreen")}
      icon={<SVGPlaycircle width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      {"Welcome Screen"->React.string}
    </ListItem>
    <ListItem
      separator=true
      onPress={_ => Calendars.openCalendarApp()}
      icon={<SVGCalendar width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      {"Calendar App"->React.string}
    </ListItem>
    <ListItem
      onPress={_ => ReactNativePermissions.openSettings()->ignore}
      icon={<SVGSettings width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      {"App System Settings"->React.string}
    </ListItem>
    <ListSeparator />
    <Spacer size=L />
    <ListSeparator />
    <ListItem
      onPress={_ =>
        navigation->Navigators.RootStack.Navigation.navigate("SettingsDangerZoneScreen")}
      right={<ListItemChevron />}>
      {SettingsDangerZoneScreen.title->React.string}
    </ListItem>
    <ListSeparator />
    {Global.__DEV__ == true
      ? <>
          <Spacer size=S />
          <ListHeader text="__DEV__ Demo Data" />
          <ListSeparator />
          <ListItem
            onPress={_ =>
              Alert.alert(
                ~title="Inject Demo Data",
                ~message="This will create a specific calendar called '" ++
                Demo.calendarDemoTitle ++ "' and will inject some data.",
                ~buttons=[
                  Alert.button(~text="Cancel", ~style=#default, ()),
                  Alert.button(~text="Inject", ~onPress=() => Demo.injectFreshData(), ()),
                ],
                (),
              )}
            color={theme.colors.blue}
            separator={true}>
            {"Inject Demo Data"->React.string}
          </ListItem>
          <ListItem
            onPress={_ =>
              Alert.alert(
                ~title="Remove Demo Data",
                ~message="This will remove the calendar called '" ++
                Demo.calendarDemoTitle ++ "' and all the data in it.",
                ~buttons=[
                  Alert.button(~text="Keep", ~style=#default, ()),
                  Alert.button(
                    ~text="Remove",
                    ~style=#destructive,
                    ~onPress=() => Demo.removeData(),
                    (),
                  ),
                ],
                (),
              )}
            color={theme.colors.red}>
            {"Remove Demo Data"->React.string}
          </ListItem>
          <ListSeparator />
        </>
      : React.null}
    <Spacer size=L />
  </>
}
