open ReactNavigation;

module RootStack =
  Stack.Make({
    type params = {.};
  });

module MainStack =
  Stack.Make({
    type params = {. "currentActivity": option(string)};
  });
