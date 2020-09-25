open ReactNative;
open ReactMultiversal;

[@react.component]
let make = () => {
  let theme = Theme.useTheme(AppSettings.useTheme());
  <>
    <View
      style=Style.(
        array([|
          StyleSheet.absoluteFill,
          theme.styles##background,
          style(~opacity=0.8, ()),
        |])
      )
    />
    <BlurView
      nativeBlurType={
        switch (theme.mode) {
        | `dark => `dark
        | `light => `light
        }
      }
      style=StyleSheet.absoluteFill
    />
  </>;
};
