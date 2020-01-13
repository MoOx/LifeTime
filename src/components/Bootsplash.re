open ReactNative;

let styles =
  Style.{
    "bootsplash": viewStyle(~justifyContent=`center, ~alignItems=`center, ()),
    "background": viewStyle(~width=100.->pct, ~height=100.->pct, ()),
    "logo": imageStyle(~height=128.->dp, ~width=128.->dp, ()),
  }
  ->StyleSheet.create;

let background = Packager.require("../../public/Gradient.png");
let logo = Packager.require("../../public/Icon-transparent.png");

[@react.component]
let make = (~isReady) => {
  let (bootSplashIsVisible, setBootSplashIsVisible) =
    React.useState(() => true);
  let (logoIsLoaded, setLogoIsLoaded) = React.useState(() => false);
  let (backgroundIsLoaded, setBackgroundIsLoaded) =
    React.useState(() => false);
  let animatedTranslateY = React.useRef(Animated.Value.create(0.));
  let animatedOpacity = React.useRef(Animated.Value.create(1.));

  React.useEffect3(
    () => {
      if (logoIsLoaded && backgroundIsLoaded && isReady) {
        ReactNativeBootsplash.hide(None);
        Animated.(
          timing(
            animatedOpacity->React.Ref.current,
            Value.Timing.config(
              ~useNativeDriver=true,
              ~toValue=0.->Value.Timing.fromRawValue,
              ~duration=250.,
              (),
            ),
          )
          ->Animation.start(
              ~endCallback=_ => setBootSplashIsVisible(_ => false),
              (),
            )
        );
      };
      None;
    },
    (logoIsLoaded, backgroundIsLoaded, isReady),
  );
  !bootSplashIsVisible
    ? React.null
    : <Animated.View
        style=Style.(
          array([|
            StyleSheet.absoluteFill,
            styles##bootsplash,
            style(
              ~opacity=
                animatedOpacity->React.Ref.current->Animated.StyleProp.float,
              (),
            ),
          |])
        )>
        <Image
          source={background->Image.Source.fromRequired}
          onLoadEnd={() => setBackgroundIsLoaded(_ => true)}
          style=Style.(array([|StyleSheet.absoluteFill, styles##background|]))
          resizeMode=`stretch
        />
        <Animated.Image
          source={logo->Image.Source.fromRequired}
          resizeMode=`contain
          //  fadeDuration=0.
          onLoadEnd={() => setLogoIsLoaded(_ => true)}
          style=Style.(
            array([|
              styles##logo,
              style(
                ~transform=[|
                  translateY(
                    ~translateY=
                      animatedTranslateY
                      ->React.Ref.current
                      ->Animated.StyleProp.float,
                  ),
                |],
                (),
              ),
            |])
          )
        />
      </Animated.View>;
};
