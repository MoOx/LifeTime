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
        allowFontScaling=false
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
      left={<SVGAppBadge width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      <ListItemText> {SettingsNotificationsScreen.title->React.string} </ListItemText>
    </ListItem>
    <ListSeparator />
    <Spacer />
    <ListHeader text="Theme" />
    <ListSeparator />
    <ListItem
      separator=true
      onPress={_ =>
        setSettings(settings => {...settings, lastUpdated: Js.Date.now(), theme: "light"})}
      left={<SVGSunoutline width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}
      right={switch themeKey {
      | #light =>
        <SVGCheckmark width={22.->Style.dp} height={22.->Style.dp} fill=theme.colors.blue />
      | _ => React.null
      }}>
      <ListItemText> {"Light"->React.string} </ListItemText>
    </ListItem>
    <ListItem
      separator=true
      onPress={_ =>
        setSettings(settings => {...settings, lastUpdated: Js.Date.now(), theme: "dark"})}
      left={<SVGMoonsymbol width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.indigo />}
      right={switch themeKey {
      | #dark =>
        <SVGCheckmark width={22.->Style.dp} height={22.->Style.dp} fill=theme.colors.blue />
      | _ => React.null
      }}>
      <ListItemText> {"Dark"->React.string} </ListItemText>
    </ListItem>
    <ListItem
      onPress={_ =>
        setSettings(settings => {...settings, lastUpdated: Js.Date.now(), theme: "auto"})}
      left={<SVGMoonshine width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.purple />}
      right={switch themeKey {
      | #auto =>
        <SVGCheckmark width={22.->Style.dp} height={22.->Style.dp} fill=theme.colors.blue />
      | _ => React.null
      }}>
      <ListItemText> {"Auto"->React.string} </ListItemText>
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
      left={<SVGInfo width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      <ListItemText> {"Help"->React.string} </ListItemText>
    </ListItem>
    <ListItem
      separator=true
      onPress={_ => navigation->Navigators.RootStack.Navigation.navigate("WelcomeModalScreen")}
      left={<SVGPlaycircle width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      <ListItemText> {"Welcome Screen"->React.string} </ListItemText>
    </ListItem>
    <ListItem
      separator=true
      onPress={_ => Calendars.openCalendarApp()}
      left={<SVGCalendar width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      <ListItemText> {"Calendar App"->React.string} </ListItemText>
    </ListItem>
    <ListItem
      onPress={_ => ReactNativePermissions.openSettings()->ignore}
      left={<SVGSettings width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      <ListItemText> {"App System Settings"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator />
    <Spacer size=L />
    <ListSeparator />
    <ListItem
      onPress={_ =>
        navigation->Navigators.RootStack.Navigation.navigate("SettingsDangerZoneScreen")}
      right={<ListItemChevron />}>
      <ListItemText> {SettingsDangerZoneScreen.title->React.string} </ListItemText>
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
            separator={true}>
            <ListItemText color={theme.colors.blue}>
              {"Inject Demo Data"->React.string}
            </ListItemText>
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
              )}>
            <ListItemText color={theme.colors.red}>
              {"Remove Demo Data"->React.string}
            </ListItemText>
          </ListItem>
          <ListSeparator />
        </>
      : React.null}
    <Spacer size=L />
  </>
}
