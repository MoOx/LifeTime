open Belt;
open ReactNative;

[@react.component]
let make =
    (
      ~style as s,
      ~rowStyle,
      ~dashGap,
      ~dashLength,
      ~dashThickness,
      ~dashColor,
    ) => {
  let (layout, setLayout) = React.useState(() => None);
  let onLayout =
    React.useCallback0((layoutEvent: Event.layoutEvent) => {
      let layout = layoutEvent##nativeEvent##layout;
      setLayout(_ => Some(layout));
    });

  let isRow =
    switch (rowStyle) {
    | `row => true
    | `rowReverse => true
    | `column => false
    | `columnReverse => false
    };

  let length =
    switch (layout) {
    | Some(layout) => isRow ? layout##width : layout##height
    | None => 0.
    };
  let n = ceil(length /. (dashGap +. dashLength))->int_of_float;

  <View onLayout style=Style.(list([s, style(~flexDirection=rowStyle, ())]))>
    {Array.range(0, n - 1)
     ->Array.map(i =>
         <View
           key={i->string_of_int}
           style=Style.(
             style(
               ~width=(isRow ? dashLength : dashThickness)->dp,
               ~height=(isRow ? dashThickness : dashLength)->dp,
               ~marginRight=(isRow ? dashGap : 0.)->dp,
               ~marginBottom=(isRow ? 0. : dashGap)->dp,
               ~backgroundColor=dashColor,
               (),
             )
           )
         />
       )
     ->React.array}
  </View>;
};
