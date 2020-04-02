open Belt;
open ReactNative;
open ReactMultiversal;

let help =
  MarkdownJsonRenderer.required(Packager.require("../md/help.json"));

let title = help.title->Option.getWithDefault("Help");

[@react.component]
let make = () => {
  // let theme = Theme.useTheme(AppSettings.useTheme());
  <SpacedView horizontal=M vertical=L style=Predefined.styles##flexGrow>
    <MarkdownJsonRenderer body={help.body} />
  </SpacedView>;
};
