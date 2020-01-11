// open Belt;
open ReactNative;
open ReactMultiversal;

[@react.component]
let make = (~category, ~selected, ~separator, ~onPress) => {
  // let (settings, setSettings) = React.useContext(AppSettings.context);
  let theme = Theme.useTheme();
  let themeStyles = Theme.useStyles();
  let themeColors = Theme.useColors();

  let (id, name, colorName, iconName) = category;
  let color = theme->Calendars.Categories.getColor(colorName);

  <TouchableOpacity key=id onPress={_ => onPress(category)}>
    <View style=Predefined.styles##rowCenter>
      <Spacer size=S />
      <SpacedView
        vertical=XS horizontal=None style=Predefined.styles##rowCenter>
        {if (!selected) {
           <SVGcircle
             width={22.->ReactFromSvg.Size.dp}
             height={22.->ReactFromSvg.Size.dp}
             fill={themeColors.gray}
           />;
         } else {
           <SVGcheckmarkcircle
             width={22.->ReactFromSvg.Size.dp}
             height={22.->ReactFromSvg.Size.dp}
             fill={themeColors.blue}
           />;
         }}
        <Spacer size=XS />
        <NamedIcon name=iconName fill=color />
      </SpacedView>
      <Spacer size=XS />
      <View style=Predefined.styles##flexGrow>
        <SpacedView vertical=XS horizontal=None>
          <View style=Predefined.styles##row>
            <View style=Predefined.styles##flexGrow>
              <Text
                style={Style.list([
                  Theme.text##body,
                  themeStyles##textOnBackground,
                ])}>
                name->React.string
              </Text>
            </View>
            <Spacer size=S />
          </View>
        </SpacedView>
        {separator
           ? <Separator style=themeStyles##separatorOnBackground />
           : React.null}
      </View>
    </View>
  </TouchableOpacity>;
};
