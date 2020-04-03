open Belt;
open ReactNative;
open ReactMultiversal;

let styles =
  Style.{
    "container":
      viewStyle(
        ~justifyContent=`center,
        ~alignItems=`center,
        ~borderRadius=Theme.Radius.button,
        (),
      ),
  }
  ->StyleSheet.create;

type mode =
  | Contained
  | Simple;

[@react.component]
let make =
    (~onPress, ~text, ~styleBackground=?, ~styleText=?, ~mode=Contained) => {
  let theme = Theme.useTheme(AppSettings.useTheme());

  <TouchableOpacity onPress>
    <SpacedView
      vertical=S
      style=Style.(
        arrayOption([|
          Some(styles##container),
          styleBackground
          ->Option.map(s => Some(s))
          ->Option.getWithDefault(
              switch (mode) {
              | Contained => Some(theme.styles##backgroundMain)
              | Simple => None
              },
            ),
        |])
      )>
      <Text
        style=Style.(
          arrayOption([|
            Some(Theme.text##callout),
            Some(Theme.text##semiBold),
            styleText
            ->Option.map(s => Some(s))
            ->Option.getWithDefault(
                switch (mode) {
                | Contained => Some(theme.styles##textOnMain)
                | Simple => Some(theme.styles##textMain)
                },
              ),
          |])
        )>
        text->React.string
      </Text>
    </SpacedView>
  </TouchableOpacity>;
};
