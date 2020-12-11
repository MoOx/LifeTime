open ReactNative

let styles = {
  open Style
  {
    "bootsplash": viewStyle(~justifyContent=#center, ~alignItems=#center, ()),
    "background": viewStyle(~width=100.->pct, ~height=100.->pct, ()),
    "logo": imageStyle(~height=128.->dp, ~width=128.->dp, ()),
  }
}->StyleSheet.create

let background = Packager.require("../../public/Gradient.png")
let logo = Packager.require("../../public/Icon-transparent.png")

@react.component
let make = (~isReady) => {
  let (bootSplashIsVisible, setBootSplashIsVisible) = React.useState(() => true)
  let (logoIsLoaded, setLogoIsLoaded) = React.useState(() => false)
  let (backgroundIsLoaded, setBackgroundIsLoaded) = React.useState(() => false)
  let animatedTranslateY = React.useRef(Animated.Value.create(0.))
  let animatedOpacity = React.useRef(Animated.Value.create(1.))

  React.useEffect4(() => {
    if logoIsLoaded && (backgroundIsLoaded && isReady) {
      ReactNativeBootsplash.hide(None)
      open Animated
      timing(
        animatedOpacity.current,
        Value.Timing.config(
          ~useNativeDriver=true,
          ~toValue=0.->Value.Timing.fromRawValue,
          ~duration=250.,
          (),
        ),
      )->Animation.start(~endCallback=_ => setBootSplashIsVisible(_ => false), ())
    }
    None
  }, (logoIsLoaded, backgroundIsLoaded, isReady, setBootSplashIsVisible))
  !bootSplashIsVisible
    ? React.null
    : <Animated.View
        style={
          open Style
          array([
            StyleSheet.absoluteFill,
            styles["bootsplash"],
            style(~opacity=animatedOpacity.current->Animated.StyleProp.float, ()),
          ])
        }>
        <Image
          source={background->Image.Source.fromRequired}
          onLoadEnd={() => setBackgroundIsLoaded(_ => true)}
          style={
            open Style
            array([StyleSheet.absoluteFill, styles["background"]])
          }
          resizeMode=#stretch
        />
        <Animated.Image
          source={logo->Image.Source.fromRequired}
          resizeMode=#contain
          onLoadEnd={() => setLogoIsLoaded(_ => true)}
          style={
            open Style
            array([
              styles["logo"],
              style(
                ~transform=[
                  translateY(~translateY=animatedTranslateY.current->Animated.StyleProp.float),
                ],
                (),
              ),
            ])
          }
        />
      </Animated.View>
}
