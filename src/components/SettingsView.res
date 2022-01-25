open ReactNative.Style
open ReactNative
open ReactMultiversal

let title = "Settings"
let iconSize = 28.
let spaceStart = Spacer.size(S) *. 2. +. iconSize

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
        style={array([Theme.text["largeTitle"], Theme.text["weight700"], theme.styles["text"]])}>
        {title->React.string}
      </Text>
    </SpacedView>
    <ListSeparator />
    <ListItem
      onPress={_ =>
        navigation->Navigators.RootStack.Navigation.navigate("SettingsNotificationsScreen")}
      left={<SVGAppBadge width={iconSize->dp} height={iconSize->dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      <ListItemText> {SettingsNotificationsScreen.title->React.string} </ListItemText>
    </ListItem>
    <ListSeparator />
    <Spacer />
    <ListHeader text="Theme" />
    <ListSeparator />
    <ListItem
      onPress={_ =>
        setSettings(settings => {...settings, lastUpdated: Js.Date.now(), theme: "light"})}
      left={<SVGSunoutline width={iconSize->dp} height={iconSize->dp} fill=theme.colors.blue />}
      right={switch themeKey {
      | #light => <SVGCheckmark width={22.->dp} height={22.->dp} fill=theme.colors.blue />
      | _ => React.null
      }}>
      <ListItemText> {"Light"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator spaceStart />
    <ListItem
      onPress={_ =>
        setSettings(settings => {...settings, lastUpdated: Js.Date.now(), theme: "dark"})}
      left={<SVGMoonsymbol width={iconSize->dp} height={iconSize->dp} fill=theme.colors.indigo />}
      right={switch themeKey {
      | #dark => <SVGCheckmark width={22.->dp} height={22.->dp} fill=theme.colors.blue />
      | _ => React.null
      }}>
      <ListItemText> {"Dark"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator spaceStart />
    <ListItem
      onPress={_ =>
        setSettings(settings => {...settings, lastUpdated: Js.Date.now(), theme: "auto"})}
      left={<SVGMoonshine width={iconSize->dp} height={iconSize->dp} fill=theme.colors.purple />}
      right={switch themeKey {
      | #auto => <SVGCheckmark width={22.->dp} height={22.->dp} fill=theme.colors.blue />
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
      onPress={_ => navigation->Navigators.RootStack.Navigation.navigate("HelpModalScreen")}
      left={<SVGInfo width={iconSize->dp} height={iconSize->dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      <ListItemText> {"Help"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator spaceStart />
    <ListItem
      onPress={_ => navigation->Navigators.RootStack.Navigation.navigate("WelcomeModalScreen")}
      left={<SVGPlaycircle width={iconSize->dp} height={iconSize->dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      <ListItemText> {"Welcome Screen"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator spaceStart />
    <ListItem
      onPress={_ => Calendars.openCalendarApp()}
      left={<SVGCalendar width={iconSize->dp} height={iconSize->dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      <ListItemText> {"Calendar App"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator spaceStart />
    <ListItem
      onPress={_ => ReactNativePermissions.openSettings()->ignore}
      left={<SVGSettings width={iconSize->dp} height={iconSize->dp} fill=theme.colors.blue />}
      right={<ListItemChevron />}>
      <ListItemText> {"App System Settings"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator />
    <Spacer size=L />
    <ListSeparator />
    <ListItem
      testID="Settings_To_SettingsDangerZoneScreen"
      onPress={_ =>
        navigation->Navigators.RootStack.Navigation.navigate("SettingsDangerZoneScreen")}
      right={<ListItemChevron />}>
      <ListItemText> {SettingsDangerZoneScreen.title->React.string} </ListItemText>
    </ListItem>
    <ListSeparator />
    <Spacer size=L />
  </>
}
