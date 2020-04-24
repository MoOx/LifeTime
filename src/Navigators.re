open ReactNavigation;

module M = {
  type params = unit;
};

module StatsStack = {
  module M = {
    type params = {currentActivityTitle: option(string)};
  };
  include Stack.Make(M);
};

module GoalsStack = Stack.Make(M);

module SettingsStack = Stack.Make(M);

module Tabs = BottomTabs.Make(M);

module RootStack = {
  module M = {
    type params = {
      newGoalType: option(Goal.Type.serializableT),
      goalId: option(Goal.id),
    };
  };
  include Stack.Make(M);
};
