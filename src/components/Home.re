open ReactNative;
open ReactMultiversal;

let styles =
  Style.(
    StyleSheet.create({
      "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
    })
  );

let title = "Your LifeTime";

[@react.component]
let make = (~onFiltersPress) => {
  let themeStyles = Theme.useStyles();
  let today = Date.now();
  <>
    <StatusBar barStyle=`darkContent />
    <ScrollView
      style=Predefined.styles##flexGrow
      showsHorizontalScrollIndicator=false
      showsVerticalScrollIndicator=false>
      <ReactNativeSafeAreaContext.SafeAreaView
        style=Predefined.styles##flexGrow>
        <SpacedView>
          <TitlePre style=themeStyles##textLightOnBackground>
            {Date.(
               today->dayLongString
               ++ " "
               ++ today->dateString
               ++ " "
               ++ today->monthLongString
             )
             ->Js.String.toUpperCase
             ->React.string}
          </TitlePre>
          <Title style=themeStyles##textOnBackground>
            title->React.string
          </Title>
        </SpacedView>
        <HomeGraph onFiltersPress />
        <Spacer size=L />
      </ReactNativeSafeAreaContext.SafeAreaView>
    </ScrollView>
  </>;
};
