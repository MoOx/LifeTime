open Belt;
open ReactNative;
open ReactMultiversal;

let title = "Settings";

[@react.component]
let make = (~navigation) => {
  let (settings, setSettings) = React.useContext(AppSettings.context);
  let themeKey = AppSettings.useTheme();
  let theme = Theme.useTheme(AppSettings.useTheme());

  let handleImport =
    React.useCallback1(
      () =>
        Clipboard.getString()
        ->FutureJs.fromPromise(error => {
            // @todo ?
            Js.log2("LifeTime: import: ", error);
            "Unable to read from clipboard";
          })
        ->Future.get(
            fun
            | Error(e) => Alert.alert(~title=e, ())
            | Ok(clip) when clip === "" =>
              Alert.alert(~title="No data in your clipboard", ())
            | Ok(clip) => {
                let rawJson =
                  try(Some(clip->Json.parseOrRaise)) {
                  | Json.ParseError(_) =>
                    Alert.alert(
                      ~title="Data don't seem to be a valid Export Backup",
                      (),
                    );
                    None;
                  };
                rawJson
                ->Option.map(rawJson => {
                    rawJson
                    ->AppSettings.decodeJsonSettings
                    ->Future.get(
                        fun
                        | Error(e) => Alert.alert(~title=e, ())
                        | Ok(settings) => setSettings(_ => settings),
                      )
                  })
                ->ignore;
              },
          ),
      [|setSettings|],
    );

  <>
    <SpacedView>
      <TitlePre> " "->React.string </TitlePre>
      <Title style=theme.styles##textOnBackground> title->React.string </Title>
    </SpacedView>
    <Row> <Spacer size=XS /> <BlockHeading text="Theme" /> </Row>
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
      <TouchableWithoutFeedback
        onPress={_ =>
          setSettings(settings =>
            {...settings, lastUpdated: Js.Date.now(), theme: "light"}
          )
        }>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGsunoutline
              width={28.->ReactFromSvg.Size.dp}
              height={28.->ReactFromSvg.Size.dp}
              fill={theme.colors.blue}
            />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flex>
            <SpacedView vertical=XS horizontal=None>
              <View style=Predefined.styles##row>
                <View
                  style=Style.(
                    list([
                      Predefined.styles##flex,
                      Predefined.styles##justifyCenter,
                    ])
                  )>
                  <Text
                    style={Style.list([
                      Theme.text##body,
                      theme.styles##textOnBackground,
                    ])}>
                    "Light"->React.string
                  </Text>
                </View>
                {switch (themeKey) {
                 | `light =>
                   <SVGcheckmark
                     width={24.->ReactFromSvg.Size.dp}
                     height={24.->ReactFromSvg.Size.dp}
                     fill={theme.colors.blue}
                   />
                 | _ => React.null
                 }}
                <Spacer size=S />
              </View>
            </SpacedView>
            <Separator style=theme.styles##separatorOnBackground />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={_ =>
          setSettings(settings =>
            {...settings, lastUpdated: Js.Date.now(), theme: "dark"}
          )
        }>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGmoonsymbol
              width={28.->ReactFromSvg.Size.dp}
              height={28.->ReactFromSvg.Size.dp}
              fill={theme.colors.indigo}
            />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flex>
            <SpacedView vertical=XS horizontal=None>
              <View style=Predefined.styles##row>
                <View
                  style=Style.(
                    list([
                      Predefined.styles##flex,
                      Predefined.styles##justifyCenter,
                    ])
                  )>
                  <Text
                    style={Style.list([
                      Theme.text##body,
                      theme.styles##textOnBackground,
                    ])}>
                    "Dark"->React.string
                  </Text>
                </View>
                {switch (themeKey) {
                 | `dark =>
                   <SVGcheckmark
                     width={24.->ReactFromSvg.Size.dp}
                     height={24.->ReactFromSvg.Size.dp}
                     fill={theme.colors.blue}
                   />
                 | _ => React.null
                 }}
                <Spacer size=S />
              </View>
            </SpacedView>
            <Separator style=theme.styles##separatorOnBackground />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={_ =>
          setSettings(settings =>
            {...settings, lastUpdated: Js.Date.now(), theme: "auto"}
          )
        }>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGmoonshine
              width={28.->ReactFromSvg.Size.dp}
              height={28.->ReactFromSvg.Size.dp}
              fill={theme.colors.purple}
            />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flex>
            <SpacedView vertical=XS horizontal=None>
              <View style=Predefined.styles##row>
                <View
                  style=Style.(
                    list([
                      Predefined.styles##flex,
                      Predefined.styles##justifyCenter,
                    ])
                  )>
                  <Text
                    style={Style.list([
                      Theme.text##body,
                      theme.styles##textOnBackground,
                    ])}>
                    "Auto"->React.string
                  </Text>
                </View>
                {switch (themeKey) {
                 | `auto =>
                   <SVGcheckmark
                     width={24.->ReactFromSvg.Size.dp}
                     height={24.->ReactFromSvg.Size.dp}
                     fill={theme.colors.blue}
                   />
                 | _ => React.null
                 }}
                <Spacer size=S />
              </View>
            </SpacedView>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Separator style=theme.styles##separatorOnBackground />
    </View>
    <BlockFootnote>
      "Auto theme will switch between Light & Dark automatically to match your system settings."
      ->React.string
    </BlockFootnote>
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="More" /> </Row>
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
      <TouchableWithoutFeedback
        onPress={_ =>
          navigation->Navigators.RootStack.Navigation.navigate(
            "HelpModalScreen",
          )
        }>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGinfo
              width={28.->ReactFromSvg.Size.dp}
              height={28.->ReactFromSvg.Size.dp}
              fill={theme.colors.blue}
            />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flex>
            <SpacedView
              vertical=XS
              horizontal=None
              style=Predefined.styles##rowSpaceBetween>
              <Text
                style=Style.(
                  list([
                    Predefined.styles##flex,
                    Theme.text##body,
                    theme.styles##textOnBackground,
                  ])
                )>
                "Help"->React.string
              </Text>
              <SVGchevronright
                width={14.->ReactFromSvg.Size.dp}
                height={14.->ReactFromSvg.Size.dp}
                fill={Predefined.Colors.Ios.light.gray4}
              />
              <Spacer size=S />
            </SpacedView>
            <Separator style=theme.styles##separatorOnBackground />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={_ =>
          navigation->Navigators.RootStack.Navigation.navigate(
            "WelcomeModalScreen",
          )
        }>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGplaycircle
              width={28.->ReactFromSvg.Size.dp}
              height={28.->ReactFromSvg.Size.dp}
              fill={theme.colors.blue}
            />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flex>
            <SpacedView
              vertical=XS
              horizontal=None
              style=Predefined.styles##rowSpaceBetween>
              <Text
                style=Style.(
                  list([
                    Predefined.styles##flex,
                    Theme.text##body,
                    theme.styles##textOnBackground,
                  ])
                )>
                "Welcome Screen"->React.string
              </Text>
              <SVGchevronright
                width={14.->ReactFromSvg.Size.dp}
                height={14.->ReactFromSvg.Size.dp}
                fill={Predefined.Colors.Ios.light.gray4}
              />
              <Spacer size=S />
            </SpacedView>
            <Separator style=theme.styles##separatorOnBackground />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={_ => Calendars.openCalendarApp()}>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGcalendar
              width={28.->ReactFromSvg.Size.dp}
              height={28.->ReactFromSvg.Size.dp}
              fill={theme.colors.blue}
            />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flex>
            <SpacedView
              vertical=XS
              horizontal=None
              style=Predefined.styles##rowSpaceBetween>
              <Text
                style=Style.(
                  list([
                    Predefined.styles##flex,
                    Theme.text##body,
                    theme.styles##textOnBackground,
                  ])
                )>
                "Calendar App"->React.string
              </Text>
              <SVGchevronright
                width={14.->ReactFromSvg.Size.dp}
                height={14.->ReactFromSvg.Size.dp}
                fill={Predefined.Colors.Ios.light.gray4}
              />
              <Spacer size=S />
            </SpacedView>
            <Separator style=theme.styles##separatorOnBackground />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={_ => ReactNativePermissions.openSettings()->ignore}>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGsettings
              width={28.->ReactFromSvg.Size.dp}
              height={28.->ReactFromSvg.Size.dp}
              fill={theme.colors.blue}
            />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flex>
            <SpacedView
              vertical=XS
              horizontal=None
              style=Predefined.styles##rowSpaceBetween>
              <Text
                style=Style.(
                  list([
                    Predefined.styles##flex,
                    Theme.text##body,
                    theme.styles##textOnBackground,
                  ])
                )>
                "App System Settings"->React.string
              </Text>
              <SVGchevronright
                width={14.->ReactFromSvg.Size.dp}
                height={14.->ReactFromSvg.Size.dp}
                fill={Predefined.Colors.Ios.light.gray4}
              />
              <Spacer size=S />
            </SpacedView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
    // <Separator style=theme.styles##separatorOnBackground />
    <Separator style=theme.styles##separatorOnBackground />
    <Spacer size=L />
    <Row> <Spacer size=XS /> <BlockHeading text="Danger Zone" /> </Row>
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
      <TouchableWithoutFeedback
        onPress={_ => {
          Clipboard.setString(
            settings
            ->Js.Json.stringifyAny
            ->Option.getWithDefault("LifeTime export: error"),
          );
          Alert.alert(
            ~title="Export Finished",
            ~message=
              "Data are in you clipboard. Be sure to paste that in a safe place.",
            ~buttons=[|Alert.button(~text="Ok", ~style=`default, ())|],
            (),
          );
        }}>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGexport
              width={28.->ReactFromSvg.Size.dp}
              height={28.->ReactFromSvg.Size.dp}
              fill={theme.colors.blue}
            />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flex>
            <SpacedView vertical=XS horizontal=None>
              <View style=Predefined.styles##row>
                <View
                  style=Style.(
                    list([
                      Predefined.styles##flex,
                      Predefined.styles##justifyCenter,
                    ])
                  )>
                  <Text
                    style={Style.list([
                      Theme.text##body,
                      theme.styles##textOnBackground,
                    ])}>
                    "Export Backup"->React.string
                  </Text>
                </View>
                <Spacer size=S />
              </View>
            </SpacedView>
            <Separator style=theme.styles##separatorOnBackground />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={_ =>
          Alert.alert(
            ~title="Import Data from Clipboard?",
            ~message=
              "This is a destructive command, all settings will be overwritten by the content of the clipboard (assuming that's a valid Export Backup).",
            ~buttons=[|
              Alert.button(~text="Cancel", ~style=`default, ()),
              Alert.button(
                ~text="Import",
                ~style=`destructive,
                ~onPress=() => handleImport(),
                (),
              ),
            |],
            (),
          )
        }>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGimport
              width={28.->ReactFromSvg.Size.dp}
              height={28.->ReactFromSvg.Size.dp}
              fill={theme.colors.blue}
            />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flex>
            <SpacedView vertical=XS horizontal=None>
              <View style=Predefined.styles##row>
                <View
                  style=Style.(
                    list([
                      Predefined.styles##flex,
                      Predefined.styles##justifyCenter,
                    ])
                  )>
                  <Text
                    style={Style.list([
                      Theme.text##body,
                      theme.styles##textOnBackground,
                    ])}>
                    "Import Backup"->React.string
                  </Text>
                </View>
                <Spacer size=S />
              </View>
            </SpacedView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
    <Separator style=theme.styles##separatorOnBackground />
    <BlockFootnote>
      "Export is placing data into your clipboard. Import assume that you have your export in the clipboard."
      ->React.string
    </BlockFootnote>
    <Spacer size=L />
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
      <TouchableWithoutFeedback
        onPress={_ =>
          Alert.alert(
            ~title="Reset Settings & Erase All Data?",
            ~message=
              "This is a destructive operation and will wipe all settings & data. It cannot be undone unless you use an Export.",
            ~buttons=[|
              Alert.button(~text="Cancel", ~style=`default, ()),
              Alert.button(
                ~text="Reset",
                ~style=`destructive,
                ~onPress=() => setSettings(_ => AppSettings.defaultSettings),
                (),
              ),
            |],
            (),
          )
        }>
        <View>
          <SpacedView
            vertical=XS horizontal=XS style=Predefined.styles##rowCenter>
            <Text
              style=Style.(
                list([
                  Theme.text##body,
                  textStyle(~color=theme.colors.red, ()),
                ])
              )>
              "Reset Settings & Erase All Data"->React.string
            </Text>
          </SpacedView>
        </View>
      </TouchableWithoutFeedback>
    </View>
    <Separator style=theme.styles##separatorOnBackground />
    <BlockFootnote>
      "This is a destructive operation and will delete all application data. All your calendars and events are safe and untouched."
      ->React.string
    </BlockFootnote>
    <Spacer />
  </>;
};
