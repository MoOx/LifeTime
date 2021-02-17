open Belt
open ReactNative
open ReactMultiversal

let title = "Settings"

@react.component
let make = () => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let (
    notificationStatus,
    requestNotificationPermission,
  ) = NotificationsHooks.useNotificationStatus()
  let notificationsGranted = notificationStatus === Some(ReactNativePermissions.granted)

  let (newReminderDate, newReminderDate_set) = React.useState(() =>
    Js.Date.make()
    ->Js.Date.setHours(12.)
    ->Js.Date.fromFloat
    ->Js.Date.setMinutes(0.)
    ->Js.Date.fromFloat
  )
  let (showDatetimepicker, showDatetimepicker_set) = React.useState(() => false)
  let allowReminderEditing = settings.notificationsRecurrentRemindersOn && notificationsGranted
  <>
    <Spacer size=L />
    <ListSeparator />
    <ListItem
      right={<Switch
        value=notificationsGranted
        onValueChange={value =>
          if value {
            requestNotificationPermission()
          } else {
            ReactNativePermissions.openSettings()->ignore
          }}
      />}>
      <ListItemText> {"Allow Notifications"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator />
    <Spacer size=L />
    <ListSeparator />
    <ListItem
      separator=true
      right={<Switch
        disabled={!notificationsGranted}
        value=settings.notificationsRecurrentRemindersOn
        onValueChange={notificationsRecurrentRemindersOn => {
          setSettings(settings => {
            ...settings,
            lastUpdated: Js.Date.now(),
            notificationsRecurrentRemindersOn: notificationsRecurrentRemindersOn,
          })
          if !notificationsRecurrentRemindersOn {
            ReactNativePushNotification.cancelLocalNotifications({
              "id": Notifications.Ids.reminderDailyCheck,
            })
          }
        }}
      />}>
      <ListItemText>
        {
          let text = "Daily Reminders"->React.string
          !allowReminderEditing ? <Text style={theme.styles["textLight2"]}> {text} </Text> : text
        }
      </ListItemText>
    </ListItem>
    {settings.notificationsRecurrentReminders
    ->SortArray.stableSortBy((a, b) => {
      a[1]
      ->Option.flatMap(v => v)
      ->Option.map(v =>
        b[1]->Option.flatMap(v2 => v2)->Option.map(v2 => v2 > v ? -1 : 1)->Option.getWithDefault(0)
      )
      ->Option.getWithDefault(0)
    })
    ->Array.mapWithIndex((index, notifTime) => {
      let datetime = Notifications.appropriateTimeForNextNotification(Js.Date.now(), notifTime)
      <ListItem
        separator={allowReminderEditing
          ? true
          : index != settings.notificationsRecurrentReminders->Array.length - 1}
        key={datetime->Js.Date.toISOString}>
        <ListItemText>
          {
            let time =
              datetime
              ->DateFns.format(ReactNativeLocalize.uses24HourClock() ? "HH:mm" : "h:mm aa")
              ->React.string
            !allowReminderEditing ? <Text style={theme.styles["textLight2"]}> {time} </Text> : time
          }
        </ListItemText>
      </ListItem>
    })
    ->React.array}
    {allowReminderEditing && showDatetimepicker
      ? <>
          <View style={theme.styles["background"]}>
            <ReactNativeDateTimePicker
              testID="dateTimePicker"
              value={newReminderDate}
              mode={#time}
              is24Hour={ReactNativeLocalize.uses24HourClock()}
              display=#inline
              minuteInterval=#_15
              onChange={(_, date) => {
                newReminderDate_set(_ => date)
              }}
            />
          </View>
          <ListItemContainer
            left={<TouchableOpacity
              onPress={_ => {
                showDatetimepicker_set(_ => false)
              }}>
              <Text style={Style.array([Theme.text["body"], theme.styles["textBlue"]])}>
                {"Cancel"->React.string}
              </Text>
            </TouchableOpacity>}
            leftSpace=M
            right={<TouchableOpacity
              onPress={_ => {
                let minutes = newReminderDate->Js.Date.getMinutes->Belt.Float.toInt
                let hours = newReminderDate->Js.Date.getHours->Belt.Float.toInt
                let newReminder = [Some(minutes), Some(hours)]
                if (
                  settings.notificationsRecurrentReminders
                  ->Array.keep(r => {
                    r[0]
                    ->Option.flatMap(v => v)
                    ->Option.map(v => v === minutes)
                    ->Option.getWithDefault(false) &&
                      r[1]
                      ->Option.flatMap(v => v)
                      ->Option.map(v => v === hours)
                      ->Option.getWithDefault(false)
                  })
                  ->Array.length > 0
                ) {
                  Alert.alert(
                    ~title="Duplicate Reminder",
                    ~message="You already have a identical reminder. It's not necessary to have it twice.",
                    (),
                  )
                } else {
                  setSettings(settings => {
                    ...settings,
                    lastUpdated: Js.Date.now(),
                    notificationsRecurrentReminders: settings.notificationsRecurrentReminders->Array.concat([
                      newReminder,
                    ]),
                  })
                  showDatetimepicker_set(_ => false)
                }
              }}>
              <ListItemText color=theme.colors.blue> {"Add"->React.string} </ListItemText>
            </TouchableOpacity>}
            rightSpace=M
          />
        </>
      : React.null}
    {allowReminderEditing && !showDatetimepicker
      ? <ListItem
          onPress={_ => {
            showDatetimepicker_set(_ => true)
          }}>
          <ListItemText color=theme.colors.blue>
            {"Add a New Reminder"->React.string}
          </ListItemText>
        </ListItem>
      : React.null}
    <ListSeparator />
    <Spacer />
  </>
}
