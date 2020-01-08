open ReactNavigation;

module StatsStack =
  Stack.Make({
    type params = {. "currentActivity": option(string)};
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
