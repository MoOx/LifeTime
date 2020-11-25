open Belt
open ReactNative
open ReactNativeSvg

type stop = {
  offset: size,
  stopColor: string,
  stopOpacity: string,
}

@react.component
let make = (~width: size, ~height: size, ~stops: array<stop>) =>
  <Svg width height>
    <Defs>
      <LinearGradient id="grad" x1={0.->Style.dp} y1={0.->Style.dp} x2={0.->Style.dp} y2=height>
        {stops
        ->Array.map(stop =>
          <Stop
            key={stop.offset->Obj.magic ++ (stop.stopColor ++ stop.stopOpacity)}
            offset=stop.offset
            stopColor=stop.stopColor
            stopOpacity=stop.stopOpacity
          />
        )
        ->React.array}
      </LinearGradient>
    </Defs>
    <Rect x={0.->Style.dp} y={0.->Style.dp} width height fill="url(#grad)" />
  </Svg>
