open Belt
open ReactNative
open ReactNative.Style

@react.component
let make = React.memo((
  ~style as s=?,
  ~rowStyle=#column,
  ~length,
  ~dashGap=3.,
  ~dashLength=3.,
  ~dashThickness=StyleSheet.hairlineWidth,
  ~dashColor,
) => {
  let isRow = switch rowStyle {
  | #row => true
  | #rowReverse => true
  | #column => false
  | #columnReverse => false
  }

  let n = ceil(length /. (dashGap +. dashLength))->int_of_float

  <View style={arrayOption([s, Some(viewStyle(~flexDirection=rowStyle, ()))])}>
    {Array.range(0, n - 1)
    ->Array.map(i =>
      <View
        key={i->string_of_int}
        style={style(
          ~width=(isRow ? dashLength : dashThickness)->dp,
          ~height=(isRow ? dashThickness : dashLength)->dp,
          ~marginRight=(isRow ? dashGap : 0.)->dp,
          ~marginBottom=(isRow ? 0. : dashGap)->dp,
          ~backgroundColor=dashColor,
          (),
        )}
      />
    )
    ->React.array}
  </View>
})
