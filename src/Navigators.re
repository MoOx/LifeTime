open ReactNavigation;

module RootStackNavigator =
  Stack.Make({
    type params = {. "name": string};
  });

module MainStack =
  Stack.Make({
    type params = {. "name": string};
  });
