open ReactNative;

type t = [
  | `alarm
  | `beachball
  | `beachumbrella
  | `bed
  | `bookmark
  | `briefcase
  | `broom
  | `calendar
  | `cancel
  | `carrot
  | `chat
  | `checkmark
  | `checkmarkcircle
  | `chevronright
  | `circle
  | `cutlery
  | `dashboard
  | `delete
  | `edit
  | `error
  | `export
  | `faceid
  | `forest
  | `fork
  | `fullfamily
  | `guitar
  | `heartmonitor
  | `homepage
  | `hourglass
  | `import
  | `info
  | `medal
  | `medicalid
  | `meditation
  | `moonandstars
  | `moonsymbol
  | `mountain
  | `movieticket
  | `ok
  | `palmtree
  | `people2
  | `people3
  | `puzzle
  | `romance
  | `round
  | `scope
  | `settings
  | `sharerounded
  | `shoes
  | `signposttourist
  | `social
  | `staff
  | `star
  | `tag
  | `theatremask
  | `today
  | `touchid
  | `trash
  | `work
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
      // | `3dglasses => <SVG3dglasses width height fill />
      | `alarm => <SVGalarm width height fill />
      | `beachball => <SVGbeachball width height fill />
      | `beachumbrella => <SVGbeachumbrella width height fill />
      | `bed => <SVGbed width height fill />
      | `bookmark => <SVGbookmark width height fill />
      | `briefcase => <SVGbriefcase width height fill />
      | `broom => <SVGbroom width height fill />
      | `calendar => <SVGcalendar width height fill />
      | `cancel => <SVGcancel width height fill />
      | `carrot => <SVGcarrot width height fill />
      | `chat => <SVGchat width height fill />
      | `checkmark => <SVGcheckmark width height fill />
      | `checkmarkcircle => <SVGcheckmarkcircle width height fill />
      | `chevronright => <SVGchevronright width height fill />
      | `circle => <SVGcircle width height fill />
      | `cutlery => <SVGcutlery width height fill />
      | `dashboard => <SVGdashboard width height fill />
      | `delete => <SVGdelete width height fill />
      | `edit => <SVGedit width height fill />
      | `error => <SVGerror width height fill />
      | `export => <SVGexport width height fill />
      | `faceid => <SVGfaceid width height fill />
      | `forest => <SVGforest width height fill />
      | `fork => <SVGfork width height fill />
      | `fullfamily => <SVGfullfamily width height fill />
      | `guitar => <SVGguitar width height fill />
      | `heartmonitor => <SVGheartmonitor width height fill />
      | `homepage => <SVGhomepage width height fill />
      | `hourglass => <SVGhourglass width height fill />
      | `import => <SVGimport width height fill />
      | `info => <SVGinfo width height fill />
      | `medal => <SVGmedal width height fill />
      | `medicalid => <SVGmedicalid width height fill />
      | `meditation => <SVGmeditation width height fill />
      | `moonandstars => <SVGmoonandstars width height fill />
      | `moonsymbol => <SVGmoonsymbol width height fill />
      | `mountain => <SVGmountain width height fill />
      | `movieticket => <SVGmovieticket width height fill />
      | `ok => <SVGok width height fill />
      | `palmtree => <SVGpalmtree width height fill />
      | `people2 => <SVGpeople2 width height fill />
      | `people3 => <SVGpeople3 width height fill />
      | `puzzle => <SVGpuzzle width height fill />
      | `romance => <SVGromance width height fill />
      | `round => <SVGround width height fill />
      | `scope => <SVGscope width height fill />
      | `settings => <SVGsettings width height fill />
      | `sharerounded => <SVGsharerounded width height fill />
      | `shoes => <SVGshoes width height fill />
      | `signposttourist => <SVGsignposttourist width height fill />
      | `social => <SVGsocial width height fill />
      | `staff => <SVGstaff width height fill />
      | `star => <SVGstar width height fill />
      | `tag => <SVGtag width height fill />
      | `theatremask => <SVGtheatremask width height fill />
      | `today => <SVGtoday width height fill />
      | `touchid => <SVGtouchid width height fill />
      | `trash => <SVGtrash width height fill />
      | `work => <SVGwork width height fill />
      | `workout => <SVGworkout width height fill />
      };
    }
  </View>;
};
