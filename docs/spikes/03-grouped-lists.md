# Spike 3: grouped lists, headers and footnotes

**Question.** Can grouped lists, their section headers (with a trailing action) and footnotes
be drawn with system colours and Dynamic Type to v1's content and polish, at the default text
size and at a large accessibility size? Inset or edge-to-edge groups?

**What was tried.** The spike app of [spike 1](./01-sdk58-build.md), iOS 27.0, iPhone 17 Pro,
light. Components in `src/components/grouped.tsx` of that app:

- `Header`: footnote style, uppercase, `secondaryLabel`, trailing action in `link`.
- `Footnote`: footnote style, `secondaryLabel`.
- `Group`: either inset (16 pt margins, radius 26, `secondarySystemGroupedBackground`) or
  edge-to-edge with hairline borders (v1's look, `docs/reference/v1/ios/light/30-settings-top.png`).
- `Row`: body style, minimum 44 pt, value in `secondaryLabel`, separator inset to the text,
  pressed highlight `systemGray4`.
- Every text uses `dynamicTypeRamp` and a 17 pt or 13 pt base, never a fixed rendered size.

Summary tab: inset groups. Settings tab: edge-to-edge groups. Same content.

**Evidence** (in [03-grouped-lists/](./03-grouped-lists/)):

| | Default size (`large`) | Accessibility large |
|---|---|---|
| Inset | `default-inset.png` | `ax-large-inset.png` |
| Edge-to-edge | `default-edge.png` | `ax-large-edge.png` |

Compared by eye with `docs/reference/v1/ios/light/30-settings-top.png` and
`14-home-scrolled.png`: header and footnote sizes, colours and spacing match; row height
matches v1's rows without a second line. Icons, chevrons and v1's bar rows are not part of
this spike; they come with the screens that use them.

**Defects found and fixed during the spike.**

1. At accessibility sizes, a header with an action overflowed: `CUSTOMIZE REPORT` ran off the
   screen, glued to the title. Fix: the header row wraps (`flexWrap`, `columnGap` 16,
   `rowGap` 4, title `flexShrink`); the action drops under the title, as in Settings.app.
2. `Link asChild` around a `Pressable` drops a style given as a function: the pressed
   highlight version lost its left padding, text touching the screen edge. Fix: rows
   navigate with `router.push` in `onPress`. Rule for the slices: no function `style` under
   `Link asChild`.

**Verdict: passes**, both styles, both sizes. Long titles wrap, values stay on one line,
nothing is truncated.

**Open for MoOx: inset or edge-to-edge?** The spec's default is inset, as in Settings.app on
iOS 26 and later; v1 was edge-to-edge. Both are equally native and equally cheap. The default
stays inset until MoOx chooses.
