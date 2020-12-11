open Belt
open ReactNative

@react.component
let make = (
  ~style as s,
  ~rowStyle=#column,
  ~dashGap=3.,
  ~dashLength=3.,
  ~dashThickness=StyleSheet.hairlineWidth,
  ~dashColor,
) => {
  let (layout, setLayout) = React.useState(() => None)
  let onLayout = React.useCallback1((layoutEvent: Event.layoutEvent) => {
    let layout = layoutEvent.nativeEvent.layout
    setLayout(_ => Some(layout))
  }, [setLayout])

  let isRow = switch rowStyle {
  | #row => true
  | #rowReverse => true
  | #column => false
  | #columnReverse => false
  }

  let length = switch layout {
  | Some(layout) => isRow ? layout.width : layout.height
  | None => 0.
  }
  let n = ceil(length /. (dashGap +. dashLength))->int_of_float

  <View
    onLayout
    style={
      open Style
      array([s, style(~flexDirection=rowStyle, ())])
    }>
    {Array.range(0, n - 1)->Array.map(i =>
      <View
        key={i->string_of_int}
        style={
          open Style
          style(
            ~width=(isRow ? dashLength : dashThickness)->dp,
            ~height=(isRow ? dashThickness : dashLength)->dp,
            ~marginRight=(isRow ? dashGap : 0.)->dp,
            ~marginBottom=(isRow ? 0. : dashGap)->dp,
            ~backgroundColor=dashColor,
            (),
          )
        }
      />
    )->React.array}
  </View>
}
