open ReactNative
open ReactNative.Style
open ReactMultiversal

@react.component
let make = () => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  Platform.os === Platform.ios
    ? <>
        <View
          style={array([
            StyleSheet.absoluteFill,
            theme.styles["background"],
            style(~opacity=0.8, ()),
          ])}
        />
        <BlurView
          nativeBlurType={switch theme.mode {
          | #dark => #dark
          | #light => #light
          }}
          style=StyleSheet.absoluteFill
        />
        <View style={array([StyleSheet.absoluteFill, Predefined.styles["justifyEnd"]])}>
          <Separator style={theme.styles["separatorLightOnBackground"]} />
        </View>
      </>
    : <View
        style={array([
          StyleSheet.absoluteFill,
          Predefined.styles["justifyEnd"],
          theme.styles["background"],
        ])}>
        <Separator style={theme.styles["separatorLightOnBackground"]} />
      </View>
}
