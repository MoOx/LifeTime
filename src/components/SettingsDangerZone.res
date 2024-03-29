open Belt
open ReactNative
open ReactNative.Style
open ReactMultiversal

let title = "Settings"

@react.component
let make = () => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let handleImport = React.useCallback1(() =>
    Clipboard.getString()
    ->FuturePromise.fromPromise
    ->Future.mapError(error => {
      // @todo error!
      Log.info(("SettingsDangerZone: import", error))
      "Unable to read from clipboard"
    })
    ->Future.get(x =>
      switch x {
      | Error(e) => Alert.alert(~title=e, ())
      | Ok(clip) if clip === "" => Alert.alert(~title="No data in your clipboard", ())
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
    <ListHeader text="Metadata" />
    <ListSeparator />
    <ListItem
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
      left={<SVGExport
        width={NamedIcon.size->dp} height={NamedIcon.size->dp} fill=theme.colors.blue
      />}>
      <ListItemText color={theme.colors.blue}> {"Export Backup"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator spaceStart={Spacer.size(S) *. 2. +. NamedIcon.size} />
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
      left={<SVGImport
        width={NamedIcon.size->dp} height={NamedIcon.size->dp} fill=theme.colors.blue
      />}>
      <ListItemText color={theme.colors.blue}> {"Import Backup"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator />
    <BlockFootnote>
      {"Export contains events metadata including categories & goals that are not stored into your calendars. "->React.string}
      {"Export copy raw metadata into your clipboard. Import assume that you have your export in your clipboard, ready to be injected."->React.string}
    </BlockFootnote>
    <Spacer size=M />
    <ListHeader text="Demo Calendar" />
    <ListSeparator />
    <ListItem
      testID="SettingsDangerZone_CalendarInject"
      onPress={_ =>
        Alert.alert(
          ~title="Inject Demo Calendar",
          ~message="This will create a specific calendar called '" ++
          Demo.calendarDemoTitle ++ "' and will inject some data.",
          ~buttons=[
            Alert.button(~text="Cancel", ~style=#default, ()),
            Alert.button(~text="Inject", ~onPress=() => Demo.fullRefresh()->ignore, ()),
          ],
          (),
        )}>
      <ListItemText color={theme.colors.blue}>
        {"Create Demo Calendar"->React.string}
      </ListItemText>
    </ListItem>
    <ListSeparator spaceStart={Spacer.size(S)} />
    <ListItem
      testID="SettingsDangerZone_CalendarRemove"
      onPress={_ =>
        Alert.alert(
          ~title="Remove Demo Calendar",
          ~message="This will remove the calendar called '" ++
          Demo.calendarDemoTitle ++ "' and all the data in it.",
          ~buttons=[
            Alert.button(~text="Keep", ~style=#default, ()),
            Alert.button(
              ~text="Remove",
              ~style=#destructive,
              ~onPress=() => Demo.removeData()->ignore,
              (),
            ),
          ],
          (),
        )}>
      <ListItemText color={theme.colors.red}> {"Remove Demo Calendar"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator />
    <BlockFootnote>
      {"Demo data allows you to quickly test the app if you have currently not enough data in your actual calendars. It can be safely removed without affecting your personal calendars."->React.string}
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
        {"Reset Settings & Erase All Metadata"->React.string}
      </ListItemText>
    </ListItem>
    <ListSeparator />
    <BlockFootnote>
      {"This is a destructive operation and will delete all application metadata. Note: All your calendars and events are safe and are not affected by this operation."->React.string}
    </BlockFootnote>
  </>
}
