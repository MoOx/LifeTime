open Belt
open ReactNative
open ReactMultiversal

let title = "Settings"

@react.component
let make = () => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let handleImport = React.useCallback1(() =>
    Clipboard.getString()
    ->FutureJs.fromPromise(error => {
      // @todo error!
      Js.log(("[LifeTime] SettingsDangerZone: import", error))
      "Unable to read from clipboard"
    })
    ->Future.get(x =>
      switch x {
      | Error(e) => Alert.alert(~title=e, ())
      | Ok(clip) when clip === "" => Alert.alert(~title="No data in your clipboard", ())
      | Ok(clip) =>
        let rawJson = try Some(clip->Json.parseOrRaise) catch {
        | Json.ParseError(_) =>
          Alert.alert(~title="Data don't seem to be a valid Export Backup", ())
          None
        }
        rawJson
        ->Option.map(rawJson =>
          rawJson
          ->AppSettings.decodeJsonSettings
          ->Future.get(x =>
            switch x {
            | Error(e) => Alert.alert(~title=e, ())
            | Ok(settings) => setSettings(_ => settings)
            }
          )
        )
        ->ignore
      }
    )
  , [setSettings])

  <>
    <Spacer />
    <ListSeparator />
    <ListItem
      separator=true
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
      }}
      left={<SVGExport width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}>
      <ListItemText color={theme.colors.blue}> {"Export Backup"->React.string} </ListItemText>
    </ListItem>
    <ListItem
      onPress={_ =>
        Alert.alert(
          ~title="Import Data from Clipboard?",
          ~message="This is a destructive command, all settings will be overwritten by the content of the clipboard (assuming that's a valid Export Backup).",
          ~buttons=[
            Alert.button(~text="Cancel", ~style=#default, ()),
            Alert.button(~text="Import", ~style=#destructive, ~onPress=() => handleImport(), ()),
          ],
          (),
        )}
      left={<SVGImport width={28.->Style.dp} height={28.->Style.dp} fill=theme.colors.blue />}>
      <ListItemText color={theme.colors.blue}> {"Import Backup"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator />
    <BlockFootnote>
      {"Export is placing data into your clipboard. Import assume that you have your export in the clipboard."->React.string}
    </BlockFootnote>
    <Spacer size=L />
    <ListSeparator />
    <ListItem
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
      <ListItemText color={theme.colors.red} center=true>
        {"Reset Settings & Erase All Data"->React.string}
      </ListItemText>
    </ListItem>
    <ListSeparator />
    <BlockFootnote>
      {"This is a destructive operation and will delete all application data. All your calendars and events are safe and untouched."->React.string}
    </BlockFootnote>
  </>
}
