open ReactNavigation;

module StatsStack =
  Stack.Make({
    type params = {. "currentActivityTitle": option(string)};
  });

module GoalsStack =
  Stack.Make({
    type params = {.};
  });

module SettingsStack =
  Stack.Make({
    type params = {.};
  });

module Tabs =
  BottomTabs.Make({
    type params = {.};
  });

module RootStack =
  Stack.Make({
    type params = {.};
  });
