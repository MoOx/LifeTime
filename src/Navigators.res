open ReactNavigation

module M = {
  type params = unit
}

module StatsStack = {
  module M = {
    type params = {currentActivityTitle: option<string>}
  }
  include Stack.Make(M)
}

module GoalsStack = Stack.Make(M)

module SettingsStack = Stack.Make(M)

module Tabs = BottomTabs.Make(M)

module RootStack = {
  module M = {
    type params = {
      newGoalType: option<Goal.Type.serializableT>,
      goalId: option<Goal.id>,
      // react-navigation native params to navigate to a screen if you are in a tab
      screen: option<string>,
    }

    @bs.obj
    external params: (
      ~newGoalType: Goal.Type.serializableT=?,
      ~goalId: Goal.id=?,
      ~screen: string=?,
      unit,
    ) => params = ""
  }
  include Stack.Make(M)
}
