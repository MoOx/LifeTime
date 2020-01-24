// @todo go like ReactNative Style size
type stringDpOrPct = string;
type color = string;
type opacity = string;

module SvgXml = {
  [@react.component] [@bs.module "react-native-svg"]
  external make:
    (
      ~xml: string,
      ~width: stringDpOrPct=?,
      ~height: stringDpOrPct=?,
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
      ~width: stringDpOrPct=?,
      ~height: stringDpOrPct=?,
      ~style: ReactNative.Style.t=?
    ) =>
    React.element =
    "SvgCss";
};

module Svg = {
  [@react.component] [@bs.module "react-native-svg"]
  external make:
    (
      ~width: stringDpOrPct=?,
      ~height: stringDpOrPct=?,
      ~style: ReactNative.Style.t=?,
      ~children: React.element
    ) =>
    React.element =
    "Svg";
};

module Defs = {
  [@react.component] [@bs.module "react-native-svg"]
  external make: (~children: React.element) => React.element = "Defs";
};

module LinearGradient = {
  [@react.component] [@bs.module "react-native-svg"]
  external make:
    (
      ~id: string,
      ~x1: stringDpOrPct,
      ~x2: stringDpOrPct,
      ~y1: stringDpOrPct,
      ~y2: stringDpOrPct,
      ~children: React.element
    ) =>
    React.element =
    "LinearGradient";
};

module Stop = {
  [@react.component] [@bs.module "react-native-svg"]
  external make:
    (~offset: stringDpOrPct, ~stopColor: color, ~stopOpacity: opacity) =>
    React.element =
    "Stop";
};

module Rect = {
  [@react.component] [@bs.module "react-native-svg"]
  external make:
    (
      ~x: stringDpOrPct,
      ~y: stringDpOrPct,
      ~width: stringDpOrPct,
      ~height: stringDpOrPct,
      ~fill: color=?
    ) =>
    React.element =
    "Rect";
};

/*
 * The fill prop refers to the color inside the shape.
 */
// ~fill:color=?,
// ~fillOpacity:opacity=?,
// ~fillRule:[@bs.string] [ |`nonzero | `evenodd ]=?,
// // Stroke
// ~stroke:string=?,
// ~strokeWidth:stringDpOrPct=?,
// ~strokeOpacity:opacity=?,
// ~strokeMiterlimit:stringDpOrPct=?,
// ~strokeLinecap:[@bs.string] [ |`butt | `square |`round ]=?,
// ~strokeLinejoin:[@bs.string] [ |`miter | `bevel | `round]=?,
// ~strokeDasharray: array(stringDpOrPct)=?,
// ~strokeDashoffset: stringDpOrPct=?
// ~x:0=?,
// ~y:0=?,
// ~rotation:0=?,
// ~scale:stringDpOrPct=?,
// ~origin:string=?,
// ~originX:stringDpOrPct=?,
// ~originY:stringDpOrPct=?,
