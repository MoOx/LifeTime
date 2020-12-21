open Belt
open ReactNative
open ReactMultiversal

let styles = {
  open Style
  {"text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ())}
}->StyleSheet.create

@react.component
let make = (~activityTitle, ~onSkipActivity) => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let themeModeKey = AppSettings.useTheme()
  let theme = Theme.useTheme(themeModeKey)
  let isSkipped =
    settings.activitiesSkipped->Array.some(skipped => Activities.isSimilar(skipped, activityTitle))
  <SpacedView horizontal=None>
    <Row> <Spacer size=XS /> <BlockHeading text="Category" /> </Row>
    <ListSeparator />
    <View style={theme.styles["background"]}>
      {ActivityCategories.defaults
      ->List.mapWithIndex((index, (id, name, colorName, iconName)) => {
        let color = colorName->ActivityCategories.getColor(theme.mode)
        <TouchableOpacity
          key=id
          onPress={_ => {
            let createdAt = Js.Date.now()
            setSettings(settings => {
              ...settings,
              lastUpdated: Js.Date.now(),
              activities: settings.activities
              ->Array.keep(acti => !Activities.isSimilar(acti.title, activityTitle))
              ->Array.concat([
                {
                  id: Utils.makeId(activityTitle, createdAt),
                  title: activityTitle,
                  createdAt: createdAt,
                  categoryId: id,
                },
              ]),
            })
          }}>
          <View style={Predefined.styles["rowCenter"]}>
            <Spacer size=S />
            <SpacedView vertical=XS horizontal=None>
              <NamedIcon name=iconName fill=color />
            </SpacedView>
            <Spacer size=XS />
            <View style={Predefined.styles["flexGrow"]}>
              <SpacedView vertical=XS horizontal=None>
                <View style={Predefined.styles["row"]}>
                  <View style={Predefined.styles["flexGrow"]}>
                    <Text style={Style.array([styles["text"], theme.styles["text"]])}>
                      {name->React.string}
                    </Text>
                  </View>
                  {if id != settings->Calendars.categoryIdFromActivityTitle(activityTitle) {
                    <SVGCircle width={26.->Style.dp} height={26.->Style.dp} fill=color />
                  } else {
                    <SVGCheckmarkcircle width={26.->Style.dp} height={26.->Style.dp} fill=color />
                  }}
                  <Spacer size=S />
                </View>
              </SpacedView>
              {index !== ActivityCategories.defaults->List.length - 1
                ? <ListSeparator />
                : React.null}
            </View>
          </View>
        </TouchableOpacity>
      })
      //  <View> <Spacer /> </View>
      ->List.toArray
      ->React.array}
      <ListSeparator />
    </View>
    <Spacer size=L />
    <TouchableOpacity
      onPress={_ => {
        setSettings(settings => {
          let isSkipped =
            settings.activitiesSkipped->Array.some(skipped =>
              Activities.isSimilar(skipped, activityTitle)
            )
          {
            ...settings,
            lastUpdated: Js.Date.now(),
            activitiesSkipped: !isSkipped
              ? settings.activitiesSkipped->Array.concat([activityTitle])
              : settings.activitiesSkipped->Array.keep(alreadySkipped =>
                  Activities.isSimilar(alreadySkipped, activityTitle)
                ),
          }
        })
        onSkipActivity()
      }}>
      <ListSeparator />
      <SpacedView vertical=XS style={theme.styles["background"]}>
        <Center>
          <Text
            style={
              open Style
              textStyle(~color=theme.colors.red, ())
            }>
            {(!isSkipped ? "Hide Activity" : "Reveal Activity")->React.string}
          </Text>
        </Center>
      </SpacedView>
      <ListSeparator />
    </TouchableOpacity>
    <BlockFootnote>
      {(
        !isSkipped
          ? "This will hide similar activities from all reports."
          : "This will reveal similar activities in all reports."
      )->React.string}
    </BlockFootnote>
  </SpacedView>
}
