open Belt;

[@bs.module "react-native-navigation-bar-color"]
external changeNavigationBarColor: string => unit = "default";

// we pile new values in front & remove them by the beginning
let history = ref([||]);

[@react.component]
let make = (~backgroundColor: string) => {
  React.useEffect1(
    () => {
      // pile in front
      history := [|backgroundColor|]->Array.concat(history^);
      // change to the color we just piled
      history^[0]->Option.map(changeNavigationBarColor)->ignore;
      Some(
        () => {
          // remove current value
          (history^)
          ->Array.getIndexBy(c => c == backgroundColor)
          ->Option.map(indexToRemove => {
              history :=
                (history^)->Array.keepWithIndex((_c, i) => i != indexToRemove)
            })
          ->ignore;
          // put back latest know value
          history^[0]->Option.map(changeNavigationBarColor)->ignore;
        },
      );
    },
    [|backgroundColor|],
  );
  React.null;
};
