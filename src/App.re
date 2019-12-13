open ReactNative;

let styles =
  Style.(
    StyleSheet.create({
      "container": viewStyle(~flexGrow=1., ~backgroundColor="#fff", ()),
      "bootsplash":
        viewStyle(~justifyContent=`center, ~alignItems=`center, ()),
      "background": viewStyle(~width=100.->pct, ~height=100.->pct, ()),
      "logo": imageStyle(~height=128.->dp, ~width=128.->dp, ()),
    })
  );

let color1 = "#3023AE";
let color2 = "#8113FE";

let gradient = Packager.require("../public/Gradient.png");
let logo = Packager.require("../public/Icon-transparent.png");

[@react.component]
let app = () => {
  let windowDimensions = Dimensions.useWindowDimensions();
  let (bootSplashIsVisible, setBootSplashIsVisible) =
    React.useState(() => true);
  let (logoIsLoaded, setLogoIsLoaded) = React.useState(() => false);
  let animatedOpacity = React.useRef(Animated.Value.create(1.));
  let animatedTranslateY = React.useRef(Animated.Value.create(0.));

  React.useEffect1(
    () => {
      if (logoIsLoaded) {
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
    [|logoIsLoaded|],
  );
  // let width = windowDimensions##width;
  // let height = windowDimensions##height;
  <>
    <StatusBar barStyle=`darkContent />
    // <SafeAreaView style=styles##container />
    <View style=styles##container>
      {!bootSplashIsVisible
         ? React.null
         : <Animated.View
             style=Style.(
               array([|
                 StyleSheet.absoluteFill,
                 styles##bootsplash,
                 style(
                   ~opacity=
                     animatedOpacity
                     ->React.Ref.current
                     ->Animated.StyleProp.float,
                   (),
                 ),
               |])
             )>
             // https://github.com/facebook/react-native/issues/23693
             //  <ReactNativeSvg.SvgXml
             //    xml={j|<svg
             //             viewBox="0 0 $width $height"
             //             xmlns="http://www.w3.org/2000/svg"
             //             xmlns:xlink="http://www.w3.org/1999/xlink"
             //           >
             //             <defs>
             //               <linearGradient
             //                 id="gradient"
             //                 gradientTransform="rotate(90)"
             //               >
             //                 <stop offset="0%"  stop-color="$color1" />
             //                 <stop offset="100%" stop-color="$color2" />
             //               </linearGradient>
             //             </defs>
             //             <rect
             //               width="$width"
             //               height="$height"
             //               fill="url(#gradient)"
             //             />
             //           </svg>|j}
             //    width="100%"
             //    height="100%"
             //    style=StyleSheet.absoluteFill
             //  />

               <Image
                 source={gradient->Image.Source.fromRequired}
                 style=Style.(
                   array([|StyleSheet.absoluteFill, styles##background|])
                 )
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
             </Animated.View>}
    </View>
  </>;
};
