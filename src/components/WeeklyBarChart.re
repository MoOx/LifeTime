open Belt;
open ReactNative;
open ReactMultiversal;

[@react.component]
let make =
    (
      ~today,
      ~todayFirst,
      ~previousFirst,
      ~startDate,
      ~supposedEndDate,
      // ~isVisible,
      ~style,
    ) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context);
  let (getEvents, _updatedAt, _requestUpdate) =
    React.useContext(Calendars.context);
  let theme = Theme.useTheme(AppSettings.useTheme());

  let endDate = supposedEndDate->Date.min(today->React.Ref.current);
  let events = getEvents(startDate, endDate, false);
  let mapTitleDuration =
    events->Option.map(es =>
      es->Calendars.filterEvents(settings)->Calendars.mapTitleDuration
    );
  let mapCategoryDuration =
    events->Option.map(es =>
      es
      ->Calendars.filterEvents(settings)
      ->Calendars.mapCategoryDuration(settings)
    );
  <View style>
    <Spacer />
    <SpacedView vertical=None>
      <Text style=theme.styles##textVeryLightOnBackground>
        (
          if (todayFirst == startDate) {
            "Daily Average";
          } else if (previousFirst == startDate) {
            "Last Week's Average";
          } else {
            startDate->Js.Date.getDate->Js.Float.toString
            ++ " - "
            ++ endDate->Js.Date.getDate->Js.Float.toString
            ++ " "
            ++ endDate->Date.monthShortString
            ++ " Average";
          }
        )
        ->React.string
      </Text>
    </SpacedView>
    <Spacer size=S />
    <SpacedView vertical=None>
      <WeeklyGraph
        events
        mapCategoryDuration
        mapTitleDuration
        startDate
        supposedEndDate
      />
    </SpacedView>
    <Spacer size=S />
    <View style=Predefined.styles##row>
      <Spacer size=S />
      <View style=Predefined.styles##flexGrow>
        <Separator style=theme.styles##separatorOnBackground />
        <SpacedView horizontal=None vertical=S style=Predefined.styles##row>
          <View style=Predefined.styles##flexGrow>
            <Text
              style=Style.(
                list([Theme.text##callout, theme.styles##textOnBackground])
              )>
              "Total Logged Time"->React.string
            </Text>
          </View>
          <Text>
            <Text
              style=Style.(
                list([
                  Theme.text##callout,
                  theme.styles##textLightOnBackground,
                ])
              )>
              {mapTitleDuration
               ->Option.map(mapTitleDuration =>
                   mapTitleDuration->Array.reduce(
                     0., (total, (_title, duration)) =>
                     total +. duration
                   )
                 )
               ->Option.getWithDefault(0.)
               ->Date.minToString
               ->React.string}
            </Text>
          </Text>
          <Spacer size=S />
        </SpacedView>
      </View>
    </View>
  </View>;
};
