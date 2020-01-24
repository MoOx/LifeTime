open Belt;
open ReactNativeSvg;

type stop = {
  offset: string,
  stopColor: string,
  stopOpacity: string,
};

[@react.component]
let make = (~width: string, ~height: string, ~stops: array(stop)) => {
  <Svg width height>
    <Defs>
      <LinearGradient id="grad" x1="0" y1="0" x2="0" y2=height>
        {stops
         ->Array.map(stop =>
             <Stop
               key={stop.offset ++ stop.stopColor ++ stop.stopOpacity}
               offset={stop.offset}
               stopColor={stop.stopColor}
               stopOpacity={stop.stopOpacity}
             />
           )
         ->React.array}
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width height fill="url(#grad)" />
  </Svg>;
};
