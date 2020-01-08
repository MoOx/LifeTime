open Belt;
open ReactNative;
open ReactMultiversal;

Settings.get;

let styles =
  Style.(
    StyleSheet.create({
      "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
    })
  );

[@react.component]
let make = () => {
  let (settings, setSettings) = React.useContext(AppSettings.context);
  let themeKey = settings##theme->AppSettings.themeStringToTheme;
  let themeStyles = Theme.useStyles();
  let themeColors = Theme.useColors();
  <SpacedView horizontal=None>
    <Row> <Spacer size=XS /> <BlockHeading text="Theme" /> </Row>
    <Separator style=themeStyles##separatorOnBackground />
    <View style=themeStyles##background>
      <TouchableOpacity
        onPress={_ =>
          setSettings(settings =>
            {
              "lastUpdated": Js.Date.now(),
              "theme": "light",
              "calendarsIdsSkipped": settings##calendarsIdsSkipped,
              "eventsSkippedOn": settings##eventsSkippedOn,
              "eventsSkipped": settings##eventsSkipped,
              "eventsCategories": settings##eventsCategories,
            }
          )
        }>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGsunoutline
              width={28.->ReactFromSvg.Size.dp}
              height={28.->ReactFromSvg.Size.dp}
              fill={themeColors.blue}
            />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flexGrow>
            <SpacedView vertical=XS horizontal=None>
              <View style=Predefined.styles##row>
                <View
                  style=Style.(
                    list([
                      Predefined.styles##flexGrow,
                      viewStyle(~justifyContent=`center, ()),
                    ])
                  )>
                  <Text
                    style={Style.list([
                      styles##text,
                      themeStyles##textOnBackground,
                    ])}>
                    "Light"->React.string
                  </Text>
                </View>
                {switch (themeKey) {
                 | `light =>
                   <SVGcheckmark
                     width={24.->ReactFromSvg.Size.dp}
                     height={24.->ReactFromSvg.Size.dp}
                     fill={themeColors.blue}
                   />
                 | _ => React.null
                 }}
                <Spacer size=S />
              </View>
            </SpacedView>
            <Separator style=themeStyles##separatorOnBackground />
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={_ =>
          setSettings(settings =>
            {
              "lastUpdated": Js.Date.now(),
              "theme": "dark",
              "calendarsIdsSkipped": settings##calendarsIdsSkipped,
              "eventsSkippedOn": settings##eventsSkippedOn,
              "eventsSkipped": settings##eventsSkipped,
              "eventsCategories": settings##eventsCategories,
            }
          )
        }>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGmoonsymbol
              width={28.->ReactFromSvg.Size.dp}
              height={28.->ReactFromSvg.Size.dp}
              fill={themeColors.indigo}
            />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flexGrow>
            <SpacedView vertical=XS horizontal=None>
              <View style=Predefined.styles##row>
                <View
                  style=Style.(
                    list([
                      Predefined.styles##flexGrow,
                      viewStyle(~justifyContent=`center, ()),
                    ])
                  )>
                  <Text
                    style={Style.list([
                      styles##text,
                      themeStyles##textOnBackground,
                    ])}>
                    "Dark"->React.string
                  </Text>
                </View>
                {switch (themeKey) {
                 | `dark =>
                   <SVGcheckmark
                     width={24.->ReactFromSvg.Size.dp}
                     height={24.->ReactFromSvg.Size.dp}
                     fill={themeColors.blue}
                   />
                 | _ => React.null
                 }}
                <Spacer size=S />
              </View>
            </SpacedView>
            <Separator style=themeStyles##separatorOnBackground />
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={_ =>
          setSettings(settings =>
            {
              "lastUpdated": Js.Date.now(),
              "theme": "auto",
              "calendarsIdsSkipped": settings##calendarsIdsSkipped,
              "eventsSkippedOn": settings##eventsSkippedOn,
              "eventsSkipped": settings##eventsSkipped,
              "eventsCategories": settings##eventsCategories,
            }
          )
        }>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <SVGmoonshine
              width={28.->ReactFromSvg.Size.dp}
              height={28.->ReactFromSvg.Size.dp}
              fill={themeColors.purple}
            />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flexGrow>
            <SpacedView vertical=XS horizontal=None>
              <View style=Predefined.styles##row>
                <View
                  style=Style.(
                    list([
                      Predefined.styles##flexGrow,
                      viewStyle(~justifyContent=`center, ()),
                    ])
                  )>
                  <Text
                    style={Style.list([
                      styles##text,
                      themeStyles##textOnBackground,
                    ])}>
                    "Auto"->React.string
                  </Text>
                </View>
                {switch (themeKey) {
                 | `auto =>
                   <SVGcheckmark
                     width={24.->ReactFromSvg.Size.dp}
                     height={24.->ReactFromSvg.Size.dp}
                     fill={themeColors.blue}
                   />
                 | _ => React.null
                 }}
                <Spacer size=S />
              </View>
            </SpacedView>
          </View>
        </View>
      </TouchableOpacity>
      // <Separator style=themeStyles##separatorOnBackground />
      <Separator style=themeStyles##separatorOnBackground />
    </View>
    <SpacedView horizontal=S vertical=XXS>
      <Text
        style=Style.(
          list([
            themeStyles##textLightOnBackgroundDark,
            textStyle(~fontSize=12., ()),
          ])
        )>
        "Auto theme will switch between Light & Dark automatically to match your system settings."
        ->React.string
      </Text>
    </SpacedView>
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="More" /> </Row>
    <Separator style=themeStyles##separatorOnBackground />
    <View style=themeStyles##background>
      <TouchableOpacity
        onPress={_ => ReactNativePermissions.openSettings()->ignore}>
        <SpacedView horizontal=S vertical=XS>
          <View style=Predefined.styles##rowSpaceBetween>
            <Text
              style={Style.list([
                styles##text,
                themeStyles##textOnBackground,
              ])}>
              "System Settings"->React.string
            </Text>
            <SVGchevronright
              width={14.->ReactFromSvg.Size.dp}
              height={14.->ReactFromSvg.Size.dp}
              fill={Predefined.Colors.Ios.light.gray4}
            />
          </View>
        </SpacedView>
      </TouchableOpacity>
    </View>
    <Separator style=themeStyles##separatorOnBackground />
  </SpacedView>;
};
