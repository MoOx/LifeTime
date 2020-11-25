open Belt
open ReactNative
open ReactMultiversal

let title = "Settings"

@react.component
let make = () => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let handleImport = React.useCallback1(() => Clipboard.getString()->FutureJs.fromPromise(error => {
      // @todo error!
      Js.log2("LifeTime: import: ", error)
      "Unable to read from clipboard"
    })->Future.get(x =>
      switch x {
      | Error(e) => Alert.alert(~title=e, ())
      | Ok(clip) when clip === "" => Alert.alert(~title="No data in your clipboard", ())
      | Ok(clip) =>
        let rawJson = try Some(clip->Json.parseOrRaise) catch {
        | Json.ParseError(_) =>
          Alert.alert(~title="Data don't seem to be a valid Export Backup", ())
          None
        }
        rawJson->Option.map(rawJson => rawJson->AppSettings.decodeJsonSettings->Future.get(x =>
            switch x {
            | Error(e) => Alert.alert(~title=e, ())
            | Ok(settings) => setSettings(_ => settings)
            }
          ))->ignore
      }
    ), [setSettings])

  <>
    <Spacer size=L />
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <TouchableWithoutFeedback
        onPress={_ => {
          Clipboard.setString(
            settings->Js.Json.stringifyAny->Option.getWithDefault("LifeTime export: error"),
          )
          Alert.alert(
            ~title="Export Finished",
            ~message="Data are in you clipboard. Be sure to paste that in a safe place.",
            ~buttons=[Alert.button(~text="Ok", ~style=#default, ())],
            (),
          )
        }}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGExport width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />
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
                    {"Export Backup"->React.string}
                  </Text>
                </View>
                <Spacer size=S />
              </View>
            </SpacedView>
            <Separator style={theme.styles["separatorOnBackground"]} />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={_ =>
          Alert.alert(
            ~title="Import Data from Clipboard?",
            ~message="This is a destructive command, all settings will be overwritten by the content of the clipboard (assuming that's a valid Export Backup).",
            ~buttons=[
              Alert.button(~text="Cancel", ~style=#default, ()),
              Alert.button(~text="Import", ~style=#destructive, ~onPress=() => handleImport(), ()),
            ],
            (),
          )}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGImport width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />
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
                    {"Import Backup"->React.string}
                  </Text>
                </View>
                <Spacer size=S />
              </View>
            </SpacedView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <BlockFootnote>
      {"Export is placing data into your clipboard. Import assume that you have your export in the clipboard."->React.string}
    </BlockFootnote>
    <Spacer size=L />
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <TouchableWithoutFeedback
        onPress={_ =>
          Alert.alert(
            ~title="Reset Settings & Erase All Data?",
            ~message="This is a destructive operation and will wipe all settings & data. It cannot be undone unless you use an Export.",
            ~buttons=[
              Alert.button(~text="Cancel", ~style=#default, ()),
              Alert.button(
                ~text="Reset",
                ~style=#destructive,
                ~onPress=() => setSettings(_ => AppSettings.defaultSettings),
                (),
              ),
            ],
            (),
          )}>
        <View>
          <SpacedView vertical=XS horizontal=XS style={Predefined.styles["rowCenter"]}>
            <Text
              style={
                open Style
                array([Theme.text["body"], textStyle(~color=theme.colors.red, ())])
              }>
              {"Reset Settings & Erase All Data"->React.string}
            </Text>
          </SpacedView>
        </View>
      </TouchableWithoutFeedback>
    </View>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <BlockFootnote>
      {"This is a destructive operation and will delete all application data. All your calendars and events are safe and untouched."->React.string}
    </BlockFootnote>
    <Spacer />
  </>
}
