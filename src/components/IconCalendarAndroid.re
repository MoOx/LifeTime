open ReactNative;

let icon = Packager.require("../../public/IconCalendar.android.png");

[@react.component]
let make = (~style as s=?) => {
  <Image source={icon->Image.Source.fromRequired} style=?s />;
};
