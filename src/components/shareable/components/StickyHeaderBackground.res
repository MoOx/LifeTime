open ReactNative
open ReactMultiversal

@react.component
let make = () => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  Platform.os === Platform.ios
    ? <>
        <View
          style={
            open Style
            array([StyleSheet.absoluteFill, theme.styles["background"], style(~opacity=0.8, ())])
          }
        />
        <BlurView
          nativeBlurType={switch theme.mode {
          | #dark => #dark
          | #light => #light
          }}
          style=StyleSheet.absoluteFill
        />
        <View
          style={
            open Style
            array([StyleSheet.absoluteFill, Predefined.styles["justifyEnd"]])
          }>
          <Separator style={theme.styles["separatorLightOnBackground"]} />
        </View>
      </>
    : <View
        style={
          open Style
          array([
            StyleSheet.absoluteFill,
            Predefined.styles["justifyEnd"],
            theme.styles["background"],
          ])
        }>
        <Separator style={theme.styles["separatorLightOnBackground"]} />
      </View>
}
