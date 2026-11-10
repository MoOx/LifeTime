# Spike 2: native large title on iOS (D10)

**Question.** Under an expo-router `Stack` with `headerLargeTitle` and native tabs, does the
large title collapse into the navigation bar on scroll as in Mail, in light and dark? Does a
pushed screen get a small title and the minimal back button? Which conditions does it need?

**What was tried.** The spike app of [spike 1](./01-sdk58-build.md), iOS 27.0, iPhone 17 Pro.

- Tabs: `NativeTabs` from `expo-router/native-tabs`, two triggers (`list.bullet`,
  `gearshape`).
- Each tab is a `Stack` whose `contentStyle` is `systemGroupedBackground`; index screen
  `{ title, headerLargeTitle: true }`; detail screen
  `{ title: 'Sleep', headerBackButtonDisplayMode: 'minimal' }`.
- The index screen's root element is a `ScrollView` with
  `contentInsetAdjustmentBehavior="automatic"`, holding four groups of ten rows. No
  `headerTransparent`, no wrapper view around the scroll view, no custom header.

**Evidence** (in [02-large-title/](./02-large-title/)):

| | Light | Dark |
|---|---|---|
| At rest, large title | `light-rest.png` | `dark-rest.png` |
| Scrolled, title collapsed into the bar, content blurred under it | `light-collapsed.png` | `dark-collapsed.png` |
| Pushed screen, small title, minimal back button in its glass circle | `light-pushed.png` | `dark-pushed.png` |
| Recording: scroll down, push, back, scroll to top with the title re-expanding and bouncing | `collapse-light.mp4` | `collapse-dark.mp4` |

Videos are re-encoded to 402 px wide, 30 fps, to stay small in the repository.

**Verdict: passes.** The title, the bar's material, the back button and the Liquid Glass tab
bar are the system's own, in both appearances. Nothing is drawn by the app.

**Conditions that held** (to keep on every large header, as 30-screens.md states):

1. The `ScrollView` is the screen's root, hence its first scrollable descendant.
2. `contentInsetAdjustmentBehavior="automatic"` on it.
3. `headerTransparent` is not set; the bar's background is the system's.
4. The background colour comes from the Stack's `contentStyle`, not from a view wrapped
   around the scroll view.

Not tested: the negative cases (a wrapper view, `headerTransparent`) that broke v2 (NEXT.md
step 4 names them). They are avoided rather than reproduced.

**Observation for the slices.** After a scroll, the first tap on a row only stops the
deceleration (the system's behaviour), and the push then took a visible moment to start in
this Release build. To measure in slice 1 on the real Summary before calling it a problem.
