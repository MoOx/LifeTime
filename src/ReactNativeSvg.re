module SvgXml = {
  [@react.component] [@bs.module "react-native-svg"]
  external make:
    (
      ~xml: string,
      ~width: string=?,
      ~height: string=?,
      ~style: ReactNative.Style.t=?
    ) =>
    React.element =
    "SvgXml";
};

module SvgCss = {
  [@react.component] [@bs.module "react-native-svg"]
  external make:
    (
      ~xml: string,
      ~width: string=?,
      ~height: string=?,
      ~style: ReactNative.Style.t=?
    ) =>
    React.element =
    "SvgCss";
};

/*
 * The fill prop refers to the color inside the shape.
 */
// ~fill:string=?,
// ~fillOpacity:int=?,
// ~fillRule:[@bs.string] [ |`nonzero | `evenodd ]=?,
// ~stroke:string=?,
// ~strokeWidth:int=?,
// ~strokeOpacity:int=?,
// ~strokeLinecap:[@bs.string] [ |`butt | `square |`round ]=?,
// ~strokeLinejoin:[@bs.string] [ |`miter | `bevel | `round]=?,
// ~strokeDasharray: array(int)=?,
// ~strokeDashoffset: int=?
// ~x:0=?,
// ~y:0=?,
// ~rotation:0=?,
// ~scale:int=?,
// ~origin:string=?,
// ~originX:int=?,
// ~originY:int=?,

// [@react.component] [@bs.module "react-native-svg"]
// external make:
//   (

//   ) =>
//   React.element =
//   "default";
