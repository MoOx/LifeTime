open ReactNative;

type t = [
  | `bookmark
  | `broom
  | `cancel
  | `carrot
  | `checkmark
  | `checkmarkcircle
  | `chevronright
  | `circle
  | `edit
  | `export
  | `heart
  | `heartoutline
  | `hourglass
  | `import
  | `info
  | `meditation
  | `moonshine
  | `moonsymbol
  | `ok
  | `pennant
  | `round
  | `scope
  | `settings
  | `sharerounded
  | `social
  | `sunoutline
  | `tag
  | `theatremask
  | `timeline
  | `workout
];

[@react.component]
let make =
    (~name: t, ~width=28.->Style.dp, ~height=28.->Style.dp, ~fill="white") => {
  <View
    style=Style.(
      viewStyle(
        ~justifyContent=`center,
        ~alignItems=`center,
        ~borderRadius=6.,
        ~backgroundColor=fill,
        ~width,
        ~height,
        (),
      )
    )>
    {
      open ReactFromSvg.Size;
      let width = 80.->pct;
      let height = 80.->pct;
      let fill = "#fff";
      switch (name) {
      | `bookmark => <SVGbookmark width height fill />
      | `broom => <SVGbroom width height fill />
      | `cancel => <SVGcancel width height fill />
      | `carrot => <SVGcarrot width height fill />
      | `checkmark => <SVGcheckmark width height fill />
      | `checkmarkcircle => <SVGcheckmarkcircle width height fill />
      | `chevronright => <SVGchevronright width height fill />
      | `circle => <SVGcircle width height fill />
      | `edit => <SVGedit width height fill />
      | `export => <SVGexport width height fill />
      | `heart => <SVGheart width height fill />
      | `heartoutline => <SVGheartoutline width height fill />
      | `hourglass => <SVGhourglass width height fill />
      | `import => <SVGimport width height fill />
      | `info => <SVGinfo width height fill />
      | `meditation => <SVGmeditation width height fill />
      | `moonshine => <SVGmoonshine width height fill />
      | `moonsymbol => <SVGmoonsymbol width height fill />
      | `ok => <SVGok width height fill />
      | `pennant => <SVGpennant width height fill />
      | `round => <SVGround width height fill />
      | `scope => <SVGscope width height fill />
      | `settings => <SVGsettings width height fill />
      | `sharerounded => <SVGsharerounded width height fill />
      | `social => <SVGsocial width height fill />
      | `sunoutline => <SVGsunoutline width height fill />
      | `tag => <SVGtag width height fill />
      | `theatremask => <SVGtheatremask width height fill />
      | `timeline => <SVGtimeline width height fill />
      | `workout => <SVGworkout width height fill />
      };
    }
  </View>;
};
