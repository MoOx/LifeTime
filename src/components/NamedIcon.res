open ReactNative

type t = [
  | #bookmark
  | #broom
  | #cancel
  | #carrot
  | #checkmark
  | #checkmarkcircle
  | #chevronright
  | #circle
  | #edit
  | #\"export"
  | #heart
  | #heartoutline
  | #hourglass
  | #\"import"
  | #info
  | #meditation
  | #moonshine
  | #moonsymbol
  | #ok
  | #pennant
  | #scope
  | #settings
  | #sharerounded
  | #social
  | #sunoutline
  | #tag
  | #theatremask
  | #timeline
  | #workout
]

@react.component
let make = (~name: t, ~width=28.->Style.dp, ~height=28.->Style.dp, ~fill="white") =>
  <View
    style={
      open Style
      viewStyle(
        ~justifyContent=#center,
        ~alignItems=#center,
        ~borderRadius=6.,
        ~backgroundColor=fill,
        ~width,
        ~height,
        (),
      )
    }>
    {
      open Style
      let width = 80.->pct
      let height = 80.->pct
      let fill = "#fff"
      switch name {
      | #bookmark => <SVGBookmark width height fill />
      | #broom => <SVGBroom width height fill />
      | #cancel => <SVGCancel width height fill />
      | #carrot => <SVGCarrot width height fill />
      | #checkmark => <SVGCheckmark width height fill />
      | #checkmarkcircle => <SVGCheckmarkcircle width height fill />
      | #chevronright => <SVGChevronright width height fill />
      | #circle => <SVGCircle width height fill />
      | #edit => <SVGEdit width height fill />
      | #\"export" => <SVGExport width height fill />
      | #heart => <SVGHeart width height fill />
      | #heartoutline => <SVGHeartoutline width height fill />
      | #hourglass => <SVGHourglass width height fill />
      | #\"import" => <SVGImport width height fill />
      | #info => <SVGInfo width height fill />
      | #meditation => <SVGMeditation width height fill />
      | #moonshine => <SVGMoonshine width height fill />
      | #moonsymbol => <SVGMoonsymbol width height fill />
      | #ok => <SVGOk width height fill />
      | #pennant => <SVGPennant width height fill />
      | #scope => <SVGScope width height fill />
      | #settings => <SVGSettings width height fill />
      | #sharerounded => <SVGSharerounded width height fill />
      | #social => <SVGSocial width height fill />
      | #sunoutline => <SVGSunoutline width height fill />
      | #tag => <SVGTag width height fill />
      | #theatremask => <SVGTheatremask width height fill />
      | #timeline => <SVGTimeline width height fill />
      | #workout => <SVGWorkout width height fill />
      }
    }
  </View>
