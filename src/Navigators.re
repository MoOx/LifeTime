open ReactNavigation;

module RootStack =
  Stack.Make({
    type params = {.};
  });

module Tabs =
  BottomTabs.Make({
    type params = {.};
  });

module StatsStack =
  Stack.Make({
    type params = {. "currentActivity": option(string)};
  });
