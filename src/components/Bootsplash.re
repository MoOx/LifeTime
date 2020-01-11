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
let make = () => {
  let windowDimensions = Dimensions.useWindowDimensions();
  let (bootSplashIsVisible, setBootSplashIsVisible) =
    React.useState(() => true);
  let (logoIsLoaded, setLogoIsLoaded) = React.useState(() => false);
  let (backgroundIsLoaded, setBackgroundIsLoaded) =
    React.useState(() => false);
  let animatedTranslateY = React.useRef(Animated.Value.create(0.));
  let animatedOpacity = React.useRef(Animated.Value.create(1.));

  React.useEffect2(
    () => {
      if (logoIsLoaded && backgroundIsLoaded) {
        ReactNativeBootsplash.hide(None);
        Animated.(
          stagger(
            250.,
            [|
              spring(
                animatedTranslateY->React.Ref.current,
                Value.Spring.config(
                  ~useNativeDriver=true,
                  ~toValue=(-50.)->Value.Spring.fromRawValue,
                  (),
                ),
              ),
              spring(
                animatedTranslateY->React.Ref.current,
                Value.Spring.config(
                  ~useNativeDriver=true,
                  ~toValue=windowDimensions##height->Value.Spring.fromRawValue,
                  (),
                ),
              ),
            |],
          )
          ->Animation.start()
        );
        Animated.(
          timing(
            animatedOpacity->React.Ref.current,
            Value.Timing.config(
              ~useNativeDriver=true,
              ~toValue=0.->Value.Timing.fromRawValue,
              ~duration=150.,
              ~delay=350.,
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
    (logoIsLoaded, backgroundIsLoaded),
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
