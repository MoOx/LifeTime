open ReactNative;
open ReactMultiversal;

[@react.component]
let make = (~activity, ~onIgnoreActivity) => {
  let themeStyles = Theme.useStyles();
  let themeColors = Theme.useColors();
  <SpacedView horizontal=None>
    <TouchableOpacity onPress={_ => onIgnoreActivity(activity)}>
      <Separator style=themeStyles##separatorOnBackground />
      <SpacedView vertical=XS style=themeStyles##background>
        <Center>
          <Text style=Style.(textStyle(~color=themeColors.red, ()))>
            "Ignore"->React.string
          </Text>
        </Center>
      </SpacedView>
      <Separator style=themeStyles##separatorOnBackground />
    </TouchableOpacity>
    <SpacedView horizontal=XS vertical=XXS>
      <Text
        style=Style.(
          list([
            themeStyles##textLightOnBackgroundDark,
            textStyle(~fontSize=12., ()),
          ])
        )>
        "This will hide similar events from all reports."->React.string
      </Text>
    </SpacedView>
  </SpacedView>;
};
