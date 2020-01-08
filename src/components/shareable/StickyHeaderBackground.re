open ReactNative;
open ReactMultiversal;

[@react.component]
let make = () => {
  let theme = Theme.useTheme();
  let themeStyles = Theme.useStyles();
  <>
    <View
      style=Style.(
        list([
          StyleSheet.absoluteFill,
          themeStyles##background,
          style(~opacity=0.8, ()),
        ])
      )
    />
    <BlurView
      nativeBlurType={
        switch (theme) {
        | `dark => `dark
        | `light => `light
        }
      }
      style=StyleSheet.absoluteFill
    />
  </>;
};
