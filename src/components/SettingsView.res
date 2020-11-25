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
      <Title style={theme.styles["textOnBackground"]}> {title->React.string} </Title>
    </SpacedView>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <TouchableWithoutFeedback
        onPress={_ =>
          navigation->Navigators.RootStack.Navigation.navigate("SettingsNotificationsScreen")}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGAppBadge width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />
          </SpacedView>
          <Spacer size=XS />
          <View style={Predefined.styles["flex"]}>
            <SpacedView vertical=XS horizontal=None style={Predefined.styles["rowSpaceBetween"]}>
              <Text
                style={
                  open Style
                  array([
                    Predefined.styles["flex"],
                    Theme.text["body"],
                    theme.styles["textOnBackground"],
                  ])
                }>
                {SettingsNotificationsScreen.title->React.string}
              </Text>
              <SVGChevronright
                width={14.->Style.dp} height={14.->Style.dp} fill=Predefined.Colors.Ios.light.gray4
              />
              <Spacer size=S />
            </SpacedView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="Theme" /> </Row>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <TouchableWithoutFeedback
        onPress={_ =>
          setSettings(settings => {...settings, lastUpdated: Js.Date.now(), theme: "light"})}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGSunoutline width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />
          </SpacedView>
          <Spacer size=XS />
          <View style={Predefined.styles["flex"]}>
            <SpacedView vertical=XS horizontal=None>
              <View style={Predefined.styles["row"]}>
                <View
                  style={
                    open Style
                    array([Predefined.styles["flex"], Predefined.styles["justifyCenter"]])
                  }>
                  <Text style={Style.array([Theme.text["body"], theme.styles["textOnBackground"]])}>
                    {"Light"->React.string}
                  </Text>
                </View>
                {switch themeKey {
                | #light =>
                  <SVGCheckmark
                    width={24.->Style.dp} height={24.->Style.dp} fill=theme.colors.blue
                  />
                | _ => React.null
                }}
                <Spacer size=S />
              </View>
            </SpacedView>
            <Separator style={theme.styles["separatorOnBackground"]} />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={_ =>
          setSettings(settings => {...settings, lastUpdated: Js.Date.now(), theme: "dark"})}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGMoonsymbol width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.indigo />
          </SpacedView>
          <Spacer size=XS />
          <View style={Predefined.styles["flex"]}>
            <SpacedView vertical=XS horizontal=None>
              <View style={Predefined.styles["row"]}>
                <View
                  style={
                    open Style
                    array([Predefined.styles["flex"], Predefined.styles["justifyCenter"]])
                  }>
                  <Text style={Style.array([Theme.text["body"], theme.styles["textOnBackground"]])}>
                    {"Dark"->React.string}
                  </Text>
                </View>
                {switch themeKey {
                | #dark =>
                  <SVGCheckmark
                    width={24.->Style.dp} height={24.->Style.dp} fill=theme.colors.blue
                  />
                | _ => React.null
                }}
                <Spacer size=S />
              </View>
            </SpacedView>
            <Separator style={theme.styles["separatorOnBackground"]} />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={_ =>
          setSettings(settings => {...settings, lastUpdated: Js.Date.now(), theme: "auto"})}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGMoonshine width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.purple />
          </SpacedView>
          <Spacer size=XS />
          <View style={Predefined.styles["flex"]}>
            <SpacedView vertical=XS horizontal=None>
              <View style={Predefined.styles["row"]}>
                <View
                  style={
                    open Style
                    array([Predefined.styles["flex"], Predefined.styles["justifyCenter"]])
                  }>
                  <Text style={Style.array([Theme.text["body"], theme.styles["textOnBackground"]])}>
                    {"Auto"->React.string}
                  </Text>
                </View>
                {switch themeKey {
                | #auto =>
                  <SVGCheckmark
                    width={24.->Style.dp} height={24.->Style.dp} fill=theme.colors.blue
                  />
                | _ => React.null
                }}
                <Spacer size=S />
              </View>
            </SpacedView>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Separator style={theme.styles["separatorOnBackground"]} />
    </View>
    <BlockFootnote>
      {"Auto theme will switch between Light & Dark automatically to match your system settings."->React.string}
    </BlockFootnote>
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="More" /> </Row>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <TouchableWithoutFeedback
        onPress={_ => navigation->Navigators.RootStack.Navigation.navigate("HelpModalScreen")}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGInfo width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />
          </SpacedView>
          <Spacer size=XS />
          <View style={Predefined.styles["flex"]}>
            <SpacedView vertical=XS horizontal=None style={Predefined.styles["rowSpaceBetween"]}>
              <Text
                style={
                  open Style
                  array([
                    Predefined.styles["flex"],
                    Theme.text["body"],
                    theme.styles["textOnBackground"],
                  ])
                }>
                {"Help"->React.string}
              </Text>
              <SVGChevronright
                width={14.->Style.dp} height={14.->Style.dp} fill=Predefined.Colors.Ios.light.gray4
              />
              <Spacer size=S />
            </SpacedView>
            <Separator style={theme.styles["separatorOnBackground"]} />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={_ => navigation->Navigators.RootStack.Navigation.navigate("WelcomeModalScreen")}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGPlaycircle width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />
          </SpacedView>
          <Spacer size=XS />
          <View style={Predefined.styles["flex"]}>
            <SpacedView vertical=XS horizontal=None style={Predefined.styles["rowSpaceBetween"]}>
              <Text
                style={
                  open Style
                  array([
                    Predefined.styles["flex"],
                    Theme.text["body"],
                    theme.styles["textOnBackground"],
                  ])
                }>
                {"Welcome Screen"->React.string}
              </Text>
              <SVGChevronright
                width={14.->Style.dp} height={14.->Style.dp} fill=Predefined.Colors.Ios.light.gray4
              />
              <Spacer size=S />
            </SpacedView>
            <Separator style={theme.styles["separatorOnBackground"]} />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={_ => Calendars.openCalendarApp()}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGCalendar width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />
          </SpacedView>
          <Spacer size=XS />
          <View style={Predefined.styles["flex"]}>
            <SpacedView vertical=XS horizontal=None style={Predefined.styles["rowSpaceBetween"]}>
              <Text
                style={
                  open Style
                  array([
                    Predefined.styles["flex"],
                    Theme.text["body"],
                    theme.styles["textOnBackground"],
                  ])
                }>
                {"Calendar App"->React.string}
              </Text>
              <SVGChevronright
                width={14.->Style.dp} height={14.->Style.dp} fill=Predefined.Colors.Ios.light.gray4
              />
              <Spacer size=S />
            </SpacedView>
            <Separator style={theme.styles["separatorOnBackground"]} />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={_ => ReactNativePermissions.openSettings()->ignore}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGSettings width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />
          </SpacedView>
          <Spacer size=XS />
          <View style={Predefined.styles["flex"]}>
            <SpacedView vertical=XS horizontal=None style={Predefined.styles["rowSpaceBetween"]}>
              <Text
                style={
                  open Style
                  array([
                    Predefined.styles["flex"],
                    Theme.text["body"],
                    theme.styles["textOnBackground"],
                  ])
                }>
                {"App System Settings"->React.string}
              </Text>
              <SVGChevronright
                width={14.->Style.dp} height={14.->Style.dp} fill=Predefined.Colors.Ios.light.gray4
              />
              <Spacer size=S />
            </SpacedView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
    // <Separator style=theme.styles##separatorOnBackground />
    <Separator style={theme.styles["separatorOnBackground"]} />
    <Spacer size=L />
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <TouchableWithoutFeedback
        onPress={_ =>
          navigation->Navigators.RootStack.Navigation.navigate("SettingsDangerZoneScreen")}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <View style={Predefined.styles["flex"]}>
            <SpacedView vertical=XS horizontal=None style={Predefined.styles["rowSpaceBetween"]}>
              <Text
                style={
                  open Style
                  array([
                    Predefined.styles["flex"],
                    Theme.text["body"],
                    theme.styles["textOnBackground"],
                  ])
                }>
                {SettingsDangerZoneScreen.title->React.string}
              </Text>
              <SVGChevronright
                width={14.->Style.dp} height={14.->Style.dp} fill=Predefined.Colors.Ios.light.gray4
              />
              <Spacer size=S />
            </SpacedView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
    // <Separator style=theme.styles##separatorOnBackground />
    <Separator style={theme.styles["separatorOnBackground"]} />
    <Spacer size=L />
  </>
}
