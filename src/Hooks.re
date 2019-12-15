let useTheme = (): Theme.t => {
  switch (ReactNativeDarkMode.useDarkMode()) {
  | true => `dark
  | _ => `light
  };
};

let useStyles =
    (themedStyles: Theme.dynamicStyles('a)): Theme.rnStyleSheet('a) => {
  let theme = useTheme();
  switch (theme) {
  | `light => themedStyles.light
  | `dark => themedStyles.dark
  };
};
