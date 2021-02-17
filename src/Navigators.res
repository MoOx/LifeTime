open ReactNavigation
open ReactNativeScreens

module M = {
  type params = unit
}

module StatsStack = {
  module M = {
    type params = {currentActivityTitle: option<string>}
  }
  include NativeStack.Make(M)
}

module GoalsStack = NativeStack.Make(M)

module SettingsStack = NativeStack.Make(M)

module Tabs = BottomTabs.Make(M)

module RootStack = {
  module M = {
    type params = {
      // for Goals*ModalScreen
      newGoalType: option<Goal.Type.serializableT>,
      goalId: option<Goal.id>,
      // react-navigation native params to navigate to a screen if you are in a tab
      screen: option<string>,
    }

    @obj
    external params: (
      ~newGoalType: Goal.Type.serializableT=?,
      ~goalId: Goal.id=?,
      ~screen: string=?,
      unit,
    ) => params = ""
  }
  include NativeStack.Make(M)
}
