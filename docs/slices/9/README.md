# Slice 9: the accessibility pass

Done 2026-11-14 (docs/spec/60-slices.md, slice 9: large text, VoiceOver labels, Reduce
Motion). The rules it settled are in spec/40-design.md ("Type", "VoiceOver", "Motion").

## How it was checked

- **Large text.** `.maestro/accessibility.yaml` walks every screen (30 captures) on an E2E
  Release build, iPhone 17 Pro, iOS 27.2, at the largest size,
  `accessibility-extra-extra-extra-large` (`xcrun simctl ui booted content_size`). Each
  defect below was found on a capture of that flow, fixed, and captured again.
- **VoiceOver.** The Simulator has no VoiceOver. What it reads was taken from the
  accessibility tree XCUITest sees (`maestro hierarchy`) on the Summary, the Sorter (rows and
  selection), the goal editor and Notifications: [voiceover.md](./voiceover.md).
- **Reduce Motion.** `.maestro/reduce-motion.yaml` with Reduce Motion on in the Simulator
  (`defaults write com.apple.Accessibility ReduceMotionEnabled`), recording Welcome:
  [reduce-motion-welcome-frames.png](./reduce-motion-welcome-frames.png), a frame every
  0.25 s. The pitch is fully drawn while iOS's sheet is still rising (6.00 s) and everything is
  in place at 6.25 s, where without Reduce Motion it fades in from 750 ms and 1250 ms after
  that (SCREENS.md §2). `Continue` appears at the end of the presentation, as before.
- **Nothing regressed at the default size**: `welcome`, `shell`, `summary`, `calendar`,
  `activity`, `goals`, `settings` and `sorter` all pass on the final build.

## Large text: what broke, and the fix

| Screen | At the largest size | Fix |
|---|---|---|
| Welcome | the pitch ran under the permission sentence, `Continue` cut off | the pitch scrolls above a pinned `Continue` |
| Calendar and reminders sheets | sized to their content, the buttons were off screen and unreachable | full height and scrolling at the accessibility sizes (`src/ui/Sheet.tsx`) |
| Section titles with an action | "Weekl / y / Chart", "Activ-ities" beside "Cus-tomize report" | the action goes under the title |
| Week chart | gutter labels cut to "1…", day letters cut off below the pager | gutter and letter strip grow to the chart's 1.3 limit; the pager's height follows the caption |
| Summary activities | "21h" cut to "2…" beside its bar | the duration goes above the bar |
| Sorter | titles cut to "Cross…", the category menu squeezed the row | titles wrap, the menu goes under the title |
| Goal editor | "45 mi n", seven day columns past the edges | both rows capped at the largest standard size (`dynamicTypeSize`) |
| Notifications | "9:00 A M" beside "Next notif-ication" | the next firing goes under the hour |
| Goals | the introduction drawn at a contrast too low to read, at any size | secondary once, not secondary on secondary |
| Row symbols | 28 pt tiles beside text three times larger | they grow with the text, up to 1.5 times |

## Captures at the largest size

The final build, `accessibility.yaml` `COMPLETED` in light and in dark.

| | Light | Dark |
|---|---|---|
| Welcome | [light-a01-welcome.png](./light-a01-welcome.png) | [dark-a01-welcome.png](./dark-a01-welcome.png) |
| Welcome, scrolled to the privacy link | [light-a01b-welcome-scrolled.png](./light-a01b-welcome-scrolled.png) | [dark-a01b-welcome-scrolled.png](./dark-a01b-welcome-scrolled.png) |
| Privacy | [light-a02-privacy.png](./light-a02-privacy.png) | [dark-a02-privacy.png](./dark-a02-privacy.png) |
| Summary on demo data | [light-a03-summary-demo.png](./light-a03-summary-demo.png) | [dark-a03-summary-demo.png](./dark-a03-summary-demo.png) |
| Summary, the chart section title | [light-a04-summary-demo-scrolled.png](./light-a04-summary-demo-scrolled.png) | [dark-a04-summary-demo-scrolled.png](./dark-a04-summary-demo-scrolled.png) |
| Summary, the chart | [light-a05-summary-demo-bottom.png](./light-a05-summary-demo-bottom.png) | [dark-a05-summary-demo-bottom.png](./dark-a05-summary-demo-bottom.png) |
| Calendar access sheet | [light-a06-calendar-access.png](./light-a06-calendar-access.png) | [dark-a06-calendar-access.png](./dark-a06-calendar-access.png) |
| Calendar access sheet, scrolled to its buttons | [light-a06b-calendar-access-scrolled.png](./light-a06b-calendar-access-scrolled.png) | [dark-a06b-calendar-access-scrolled.png](./dark-a06b-calendar-access-scrolled.png) |
| Empty state | [light-a07-empty.png](./light-a07-empty.png) | [dark-a07-empty.png](./dark-a07-empty.png) |
| Filters | [light-a08-filters.png](./light-a08-filters.png) | [dark-a08-filters.png](./dark-a08-filters.png) |
| Summary, a real week: the Sorter card | [light-a09-summary-week.png](./light-a09-summary-week.png) | [dark-a09-summary-week.png](./dark-a09-summary-week.png) |
| Summary, the week chart | [light-a10-summary-chart.png](./light-a10-summary-chart.png) | [dark-a10-summary-chart.png](./dark-a10-summary-chart.png) |
| Summary, activities with the duration above the bar | [light-a11-summary-activities.png](./light-a11-summary-activities.png) | [dark-a11-summary-activities.png](./dark-a11-summary-activities.png) |
| Activity: categories | [light-a12-activity.png](./light-a12-activity.png) | [dark-a12-activity.png](./dark-a12-activity.png) |
| Activity: Match and Events | [light-a13-activity-scrolled.png](./light-a13-activity-scrolled.png) | [dark-a13-activity-scrolled.png](./dark-a13-activity-scrolled.png) |
| Sorter | [light-a14-sorter.png](./light-a14-sorter.png) | [dark-a14-sorter.png](./dark-a14-sorter.png) |
| Sorter, selecting | [light-a15-sorter-select.png](./light-a15-sorter-select.png) | [dark-a15-sorter-select.png](./dark-a15-sorter-select.png) |
| Sorter, the rule | [light-a16-sorter-rule.png](./light-a16-sorter-rule.png) | [dark-a16-sorter-rule.png](./dark-a16-sorter-rule.png) |
| Goals, empty | [light-a17-goals-empty.png](./light-a17-goals-empty.png) | [dark-a17-goals-empty.png](./dark-a17-goals-empty.png) |
| New goal: type and days | [light-a18-goal-new.png](./light-a18-goal-new.png) | [dark-a18-goal-new.png](./dark-a18-goal-new.png) |
| New goal: duration | [light-a19-goal-duration.png](./light-a19-goal-duration.png) | [dark-a19-goal-duration.png](./dark-a19-goal-duration.png) |
| New goal: categories | [light-a20-goal-categories.png](./light-a20-goal-categories.png) | [dark-a20-goal-categories.png](./dark-a20-goal-categories.png) |
| Reminders sheet | [light-a21-reminders-access.png](./light-a21-reminders-access.png) | [dark-a21-reminders-access.png](./dark-a21-reminders-access.png) |
| Reminders sheet, scrolled to its buttons | [light-a21b-reminders-access-scrolled.png](./light-a21b-reminders-access-scrolled.png) | [dark-a21b-reminders-access-scrolled.png](./dark-a21b-reminders-access-scrolled.png) |
| A goal card | [light-a22-goal-card.png](./light-a22-goal-card.png) | [dark-a22-goal-card.png](./dark-a22-goal-card.png) |
| Settings | [light-a23-settings.png](./light-a23-settings.png) | [dark-a23-settings.png](./dark-a23-settings.png) |
| Settings, More | [light-a24-settings-scrolled.png](./light-a24-settings-scrolled.png) | [dark-a24-settings-scrolled.png](./dark-a24-settings-scrolled.png) |
| Notifications | [light-a25-notifications.png](./light-a25-notifications.png) | [dark-a25-notifications.png](./dark-a25-notifications.png) |
| Reset | [light-a26-reset.png](./light-a26-reset.png) | [dark-a26-reset.png](./dark-a26-reset.png) |
| Help | [light-a27-help.png](./light-a27-help.png) | [dark-a27-help.png](./dark-a27-help.png) |

## Found on the way

- **Every `lifetime://e2e` link stacked a second set of tabs** (`app/e2e.tsx` ended with a
  `<Redirect>`, which replaced the E2E screen with new tabs). Two Goals screens then each opened
  the reminders sheet; the flow had to dismiss it twice. It now returns to the Summary already
  there (`router.dismissTo`). E2E builds only, but earlier flows ran on that stack.
- **The reminder's remove button was never drawn** (since slice 7, visible in its captures):
  `@expo/ui`'s `Button` uses `systemImage` only with a label. It now has its label, shown as
  an icon.
- **Welcome's `Continue` was 46 pt below where it was drawn** for XCUITest, hence for
  VoiceOver's activation: the SwiftUI button mounted while its container still slid up. It
  now fades in without sliding.

## Open

- **Hidden symbols are still in XCUITest's tree**, including the calendar glyph hidden since
  slice 4: `@expo/ui` applies SwiftUI's `accessibilityHidden(true)` (read in its sources), yet
  the elements are listed. Whether VoiceOver skips them can only be heard on a device. Labels
  that matter do not depend on it: rows are buttons whose combined label holds no symbol name,
  and the Sorter's static rows group their texts. To check with VoiceOver on alpha1.
- The ring's sweep under Reduce Motion is set (`ReduceMotion.System`, Reanimated's own
  handling) but not recorded: the first goal's ring draws under the reminders sheet.
