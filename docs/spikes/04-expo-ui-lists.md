# Spike 4: SwiftUI lists through `@expo/ui` under the native large title (D27)

**Question.** MoOx wants lists and controls drawn by the OS through `@expo/ui` wherever it
has the component (INTENT.md D27), rather than React Native drawn to match one year's iOS.
Does a SwiftUI `Form` hosted in a screen of expo-router's native `Stack`:

1. sit under the large title and make it collapse into the bar, as the React Native
   scroll view of [spike 2](./02-large-title.md) does;
2. push expo-router screens from its rows, with the native small title and back button;
3. carry a React Native view inside a section (the chart, goal cards);
4. look right in light, dark and at a large accessibility size?

And is v2's claim true that `@expo/ui`'s list has no section headers or footers?

**What was tried.** Built straight into slice 1, iOS 27.2, iPhone 17 Pro, Xcode 27.2, Release
build, `@expo/ui` 58.0.28.

- `src/ui/Form.tsx`: `FormScreen` is `<Host style={{ flex: 1 }}><Form>…</Form></Host>`, the
  screen's only content, with no React Native scroll view around it. `Section` takes a
  `title` and a `footer`. `Row` is a SwiftUI `Button` holding an `HStack` (title, `Spacer`,
  value in the secondary style with monospaced digits, `chevron.right` in the tertiary style
  when it pushes), and calls `router.push` so navigation stays expo-router's.
- Every screen of slice 1 uses it. Summary adds a React Native `View` in a section through
  `RNHostView matchContents={{ vertical: true }}`, standing for the chart.
- Toolbar buttons (`Stack.Toolbar`) stay outside the `Host`, as siblings.

**Evidence.**

- The slice 1 flow, `.maestro/shell.yaml`, passes in light and in dark: 39 steps each, with
  ten screenshots per appearance in [slices/1/](../slices/1/README.md) (tabs at rest and
  collapsed, pushed screens, both sheets).
- [ax-xl-summary.png](./04-expo-ui-lists/ax-xl-summary.png): Summary at the
  `accessibility-extra-large` text size. Section headers, rows, values and footers all scale.
- [dark-without-theme.png](./04-expo-ui-lists/dark-without-theme.png): the defect described
  under "Dark mode", before the fix.

**Verdict: passes.**

1. The large title collapses into the bar with the scroll edge effect under it, exactly as
   with the React Native scroll view: react-native-screens finds SwiftUI's scroll view
   through the `Host`.
2. Rows push with the native small title and the minimal back button; re-tapping the tab
   pops to the root. The first tap after a fling only stops the scroll, as in any UIKit
   list.
3. `RNHostView` lays the React Native view out inside the section, at the row's width.
4. Light and dark are the system's; Dynamic Type scales everything SwiftUI draws.

v2's claim is outdated: `Section` has `title`, `header` and `footer` (any view) in 58.0.x.
Section headers are SwiftUI's own, in sentence case and the iOS 27 style, not v1's uppercase
footnote: that is the OS's choice and the point of D27.

**Rules learnt.**

- A SwiftUI `Button` tints its label with the accent colour, so a navigation row drew blue.
  `tint('primary')` on the button gives Settings.app's label colours; the value and chevron
  then take the secondary and tertiary hierarchical styles.
- `Host` with `flex: 1` holding a `Form` is enough; `useViewportSizeMeasurement` is not
  needed here.
- Maestro reaches SwiftUI views through `accessibilityIdentifier(...)`, the same `id:`
  selectors as React Native `testID`.

**Dark mode.** The first dark run showed the large title black on black. It was not
`@expo/ui`: slice 0 dropped the SDK 58 template's `ThemeProvider`, and expo-router colours
header titles with the navigation theme's `text`, which defaults to the light theme. Spike 2
had kept the template's `ThemeProvider`, which is why it passed, as its app on the same iOS
27.2 simulator confirmed. `app/_layout.tsx` now passes `DarkTheme` or `DefaultTheme` from
`useColorScheme()`. An explicit `PlatformColor('label')` title colour did not fix it, because
the theme colour is still used.

**Not covered.** Section headers with a trailing action (SCREENS.md §1), swipe actions, and
controls (toggle, picker, date picker, text field): each is proven by the first slice that
needs it. Android: `@expo/ui/jetpack-compose` comes with the Android pass (D7). With the
machine heavily loaded, a push took about two seconds to appear; it was not measured on an
idle machine.
