open Belt
open ReactNative
open ReactMultiversal

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
    {ActivityCategories.defaults
    ->List.mapWithIndex((index, (id, name, colorName, iconName)) => {
      let color = colorName->ActivityCategories.getColor(theme.mode)
      <ListItem
        key=id
        separator={index !== ActivityCategories.defaults->List.length - 1}
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
        }}
        left={<NamedIcon name=iconName fill=color />}
        right={id != activityTitle->Calendars.categoryIdFromActivityTitle(settings.activities)
          ? <SVGCircle width={26.->Style.dp} height={26.->Style.dp} fill=color />
          : <SVGCheckmarkcircle width={26.->Style.dp} height={26.->Style.dp} fill=color />}>
        <ListItemText> {name->React.string} </ListItemText>
      </ListItem>
    })
    ->List.toArray
    ->React.array}
    <ListSeparator />
    <Spacer size=L />
    <ListSeparator />
    <ListItem
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
                  !Activities.isSimilar(alreadySkipped, activityTitle)
                ),
          }
        })
        onSkipActivity()
      }}>
      <ListItemText color=theme.colors.red center=true>
        {(!isSkipped ? "Hide Activity" : "Reveal Activity")->React.string}
      </ListItemText>
    </ListItem>
    <ListSeparator />
    <BlockFootnote>
      {(
        !isSkipped
          ? "This will hide similar activities from all reports."
          : "This will reveal similar activities in all reports."
      )->React.string}
    </BlockFootnote>
  </SpacedView>
}
