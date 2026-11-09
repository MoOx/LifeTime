# LifeTime — intent, lessons and method

> **Read this first.** This is the document a new session starts from. It records what
> MoOx wants — in his own words wherever the wording matters — why the previous rebuild
> disappointed, the decisions taken since, and how the work is now run. When a chat and
> this document disagree, the chat is the one that is out of date: update this file.
>
> **Status.** The summary of intent and four framing answers were given by MoOx on
> 2026-11-08. Entries marked *default* or *proposed* in §4 are not yet explicitly
> confirmed by him.
>
> **Why it exists.** The conversation that produced the v2 attempt was compacted twice,
> and parts of MoOx's requests now survive only in abbreviated form. Intent that lives
> only in a chat gets lost; this file is where it lives instead.

---

## 1. What LifeTime is for

**v1 (2020–2022).** LifeTime turns the calendars already on the phone into a weekly report
of where time went. Events are grouped into *activities*, activities into *categories*,
and on top sit *goals* (a minimum to reach) and *limits* (a maximum to respect). Pitch:
*"Your personal coach, helping you to reach your goals and spend your valuable time on
things you love."* Everything stays on the device. Full description: [SPEC.md](./SPEC.md).

**Where MoOx wants it to go** (2026-11-08):

> « Dans l'idée, j'aimerais vraiment que cette app soit le plus autonome possible et me
> propose dans une premier temps une vue d'ensemble de mon temps sur la semaine, et à
> terme, soyons optimiste, des recommendations d'ajustements de mon temps ou mes activités
> selon mes objectifs de vie et mes contraintes. »

In order:

1. **An overview of the week that needs as little manual logging as possible.**
2. **Later: recommendations** to adjust time and activities against the user's life goals
   and constraints.

**The calendar is a source, not the product's identity:**

> « Lifetime était orienté calendrier car c'était la source la plus facile. Le
> positionnement c'est du marketing. SI on est capable de créé une "lifetime" sans le
> calendrier avec pleins d'autres sources, on avisera mais j'ai peur que ce soit assez
> juste, mais j'aimerais me tromper et être capable de récupérer plein d'infos. »

Whether a week can be described without the calendar is a factual question, answered
source by source in [DATA-SOURCES.md](./DATA-SOURCES.md) — not a branding choice.

**What that research found (2026-11-08).** MoOx's fear is justified, in a narrower form
than "too thin":
- Local sources put a time boundary around most of a week. But they can *name* only
  about half of it, and only on a well-equipped phone. In a worked example (assumed
  hours, not measured):
  - iPhone + Apple Watch: about 57% of the 168 hours.
  - Android + wearable: 41%, and 65% with background location.
  - Phone alone: 8–24%.
- The named hours fall in Rest, Exercise, Work at a named place and, on Android or in the
  EU, phone use. **Nutrition, Social, Self-care and Chores stay almost invisible.**
- The report's framing: **sensors give the skeleton, the calendar gives the meaning.**
  - The calendar is the semantic layer, and the sensors audit it. "You planned three gym
    sessions; your watch saw one" is a recommendation neither source can make alone, and
    it fits vision step 2 with no cloud and no model.
- The largest share of an iPhone week is **located but unlabelled**. Cheap, learned rules
  ("Gym → Exercise") matter more than more sensors.

---

## 2. What MoOx asked for

### 2.1 The original request (verbatim)

> « Voilà un app que j'avais réalisé mais non maintenu par faute de temps. j'aimerais que
> tu étudies ce qu'elle fait, créé un document de spec. ENsuite que tu fasses des
> propositions d'améliorations. Et en parallèle, il faudrait repartir d'une base de code
> fraiche, avec expo et le plus de composant natif possible (eg: menu liquid glass etc). Là
> dans le projet j'avais défini les tailles de polices etc. Ce qui fait que sur android ca
> avait pas l'air natif. Tu pourrais voir ce que propose expo ou autre pour avoir un app
> qui à bien l'air liquid glass et HIG et une material design ? Et dernier point voir
> comment publier ça facilement que je puisse tester quand ca sera près l'app facilement.
> Il reste un point, la librairie que j'utilisais pour le calendrier à l'époque était
> pleine de bug et non maintenu. Tu peux voir ce qu'on pourrait faire à ce sujet ? Car
> c'était un point bloquant à l'époque. Prend bien le temps pour chaque étape. »

| # | Ask | Where it stands |
|---|---|---|
| 1 | Study v1, write a spec | [SPEC.md](./SPEC.md) (behaviour) and [SCREENS.md](./SCREENS.md) (screen-by-screen blueprint) |
| 2 | Propose improvements | [IMPROVEMENTS.md](./IMPROVEMENTS.md), v1 GitHub issues folded in and closed |
| 3 | Fresh Expo codebase, native components, Liquid Glass + HIG on iOS, Material on Android, no hard-coded type sizes | Built once as v2 (this branch); **the UI is what disappointed** — see §3 |
| 4 | Publish easily to test | Done: TestFlight via GitHub Actions + fastlane match from `MoOx/certificates` ([RELEASE.md](./RELEASE.md)) |
| 5 | Replace the dead calendar library | Done: `expo-calendar` ([CALENDAR.md](./CALENDAR.md)) |

### 2.2 Refinements given during the v2 attempt

- **Keep v1's intent precisely — inside the screens.** Navigation may be redone; what is
  on each screen may not:

  > « faire une sorte de specs précise de ce que j'avais utilisé (hors UI, je veux dire
  > styles copié d'iOS et encore qu'il faut garder l'intention (titre, footnote, list
  > groupe, radio, select etc), et bien coller au spec. [...] un gros points qu'on peut
  > reset du code existant (mais en gardant l'intention) c'est le routing et la
  > navigation. Mais la précision de l'intérieur des écrans, y compris l'écran d'accueil,
  > et le tuto au début (en quelques sortes) devraient être conserver. »

  That covers the home screen (weekly chart you swipe week by week, "Show this week"
  copied from Screen Time, top activities), categorising each activity, the goal rings
  (his own implementation — read `git show main:src/components/ActivityRings.js`), and
  the onboarding.
- **Categorisation that scales:** "everything in this calendar is Work"; "everything that
  starts with X is category Y"; eventually **a magic-wand button that proposes a category
  for everything in one tap using a local LLM**, aimed at novices — "ça peut être game
  changer" ([CATEGORISATION.md](./CATEGORISATION.md) §4).
- **Goal rings:** a switch at the top right between "current progress" and "entire week".
  An empty ring in the morning, as in Apple Fitness, is motivating, not alarming. Skia
  for drawing.
- **Icons:** expo-symbols everywhere. On web the Android (Material) name must be passed
  too, under the `web` key.
- **Liquid Glass sparingly:** corner buttons, the navigation bar and popovers only.
- **Show the app with demo data before asking for any permission.**
- **New-goal validation, Contacts-style:** the commit control stays visible but disabled,
  and a red footnote names exactly what is missing.
- **Duration input:** a slider as well as preset chips.
- **Home pull-to-refresh:** if it fights the large title, replace it with a "Refresh"
  action next to the "Updated …" line. *Open — see §7.*
- **Web:** a demo on the website, possibly a Google Calendar connection. *Deferred.*
- **Pace:** « Allons y tranquillement, mais surement, pour éviter trop d'aller et
  retour. »

### 2.3 Framing answers (2026-11-08, verbatim)

| Question | Answer |
|---|---|
| What disappointed most? | « le rendu, inprécis et pas mal de bug notamment sur la navigation et les titres au scroll. Ma v1 a beaucoup de défaut, et le code est daté mais visuellement elle était très propre. » |
| Restart the code from zero? | « On peut garder le métier qui a du sens, mais on le met à jour avec ts quoi. Et l'UI a partir de la spec ça me va. » |
| Calendar reader or automatic timeline? | Quoted in §1. |
| Privacy | « La confidentialité, idéalement on fait au plus propre. Tout ce qui peut être local on le fait, si après on gagne beaucoup à partir de connexion, pourquoi pas. Strava par exemple, ça me parait niche puisque ca cible seulement les utilisateurs de strava. » |
| Where to work | « Faisons tout ce qu'on peut ici si ça à du sens, avec des simulateurs/emulateurs locaux pour éviter la CI et avoir le plus d'autonomie possible vu que les sessions peuvent tourner ici en local, non ? » — see §6 for what is actually possible. |

---

## 3. Why the v2 attempt disappointed

**MoOx:** imprecise rendering, many bugs — **navigation and large titles on scroll** in
particular — where v1, for all its dated code, was visually very clean.

**Diagnosis**, so the new method answers each cause rather than the symptoms:

1. **Code before understanding.** v2 was scaffolded and its screens built before v1 was
   understood. The precise blueprint ([SCREENS.md](./SCREENS.md)) arrived after two
   rebuilds, when MoOx had to ask for it.
2. **No way to see native output.** Every fix cost a ~20-minute TestFlight build and
   MoOx's eyes. The web preview added later could not show native chrome at all — no
   headers, no large-title collapse, no tab bar, no Liquid Glass — which is exactly where
   the defects he named live.
3. **Claims ahead of evidence.** "Extraction complete" before v1's rings had been read; a
   reminders screen that scheduled nothing; "expo-symbols renders nothing on web" when
   the `web` key was simply missing. Each was caught by MoOx, not by the work itself.
4. **Native assumptions never tested before building on them.** `@expo/ui` `Host`
   layout, Dynamic Type under Fabric, `headerTransparent` combined with
   `headerLargeTitle`, and Hermes' partial `Intl` each cost a crash or a round trip.

---

## 4. Decisions

| # | Decision | Source |
|---|---|---|
| D1 | Keep the domain logic that still makes sense, in TypeScript, with its tests (`src/domain/*`) — re-validated against the new spec, not carried over blindly. | MoOx, 2026-11-08 |
| D2 | Rebuild the UI from the spec. | MoOx, 2026-11-08 |
| D3 | The visual bar is **v1's cleanliness, rendered with native components**: v1's captures set the standard for content, hierarchy, spacing and polish. Navigation and headers are *not* copied from v1 — see D10. Everything is checked on a native renderer before MoOx sees a build. | MoOx's diagnosis + method |
| D4 | Local first. Cloud sources only where the gain is large *and* broad; each source states its own privacy claim. Strava is out (niche). | MoOx, 2026-11-08 |
| D5 | The calendar is one source among others. The product framing is decided after [DATA-SOURCES.md](./DATA-SOURCES.md). | MoOx, 2026-11-08 |
| D6 | Vision in two steps: (1) a weekly overview with minimal manual logging; (2) later, recommendations against goals and constraints. | MoOx, 2026-11-08 |
| D7 | iOS first; Android in a dedicated pass afterwards, not in every slice; web for the demo, later. | MoOx, 2026-11-09: « simple faisons iOS pour le moment et on fera une passe android ensuite » |
| D8 | Native building and verification run in a Claude Code session on MoOx's Mac, driven by [NEXT.md](./NEXT.md) through a plain "continue" ([CLAUDE.md](../CLAUDE.md)); CI only for releases. | MoOx, 2026-11-08 — « Prépare tout ce que tu peux sur une branche, y compris un fichier pour que j'ai juste à lancer un simple prompt "continue" depuis ma machine » |
| D9 | The visual reference is **v1 itself, rebuilt from `main` and captured natively by Claude** in the iOS Simulator, light and dark. `LifeTime.sketch` holds only the icon, splash and Play Store graphic — no screens. | MoOx, 2026-11-08 — « Ca serait encore plus précis si tu captures toi même ce qui semble pertinent » |
| D10 | **Headers are the platform's own, not v1's replica.** v1 hand-built an iOS-style large title that turned into a small sticky title. That is replaced by the real thing:<br>• **iOS:** the system large title collapsing into the navigation bar on scroll, as in Mail. The native stack's `headerLargeTitle` (react-native-screens, used by expo-router's `Stack`) is UIKit's own behaviour. v2's header bugs came from misusing it (`headerTransparent` combined with large titles), not from the tool.<br>• **Android:** the Material 3 equivalent, a medium or large top app bar collapsing to the small one on scroll. As of Nov 2026 it exists only in react-native-screens' *experimental* stack (4.30, `react-native-screens/experimental`, header `type: 'small' \| 'medium' \| 'large'`). expo-router 58 wraps that stack but does not expose the type, and `@expo/ui`'s Compose `TopAppBar` is the small fixed bar only. Spike it. If it is not solid, use the standard small top app bar, which is also native. Never a hand-built imitation. | MoOx, 2026-11-08 — « je ne cherche pas spécialement le comportement de ma v1 pour les titres. Je veux au contraire quelque chose qui fait le plus natif possible [...] comme l'app iOS Mail. Et un équivalent android qui aurait du sens. » Library facts: read in the published packages, `react-native-screens` 4.30.1, `expo-router` 58.0.30, `@expo/ui` 58.0.27 |
| D11 | The v2 attempt is not captured or diffed. | MoOx, 2026-11-08 — « Pas besoin de capturer la v2. » |
| D12 | **The new app starts from a clean Expo SDK 58 scaffold.** The existing code is a quarry, not a base. What has proven itself is carried over deliberately: `src/domain` with its tests, the TestFlight pipeline and the offline checks (`scripts/check-*`). The rest is carried over piece by piece, once a spike shows it renders correctly natively. | MoOx, 2026-11-08 — « on pourrait repartir de 0 pour la v2 meme si je pense que l'existant de cette session est un bon début. » |
| D13 | **Always up to date, with no refresh action.** Data is re-read transparently (launch, focus, calendar changes), with a small indicator if it takes a moment, as in iOS Mail. Pull-to-refresh is a nice-to-have only. | MoOx, 2026-11-09: « Le but c'est que les gens n'est pas à faire "Refresh" comme action » |
| D14 | Categorise automatically whenever possible; manual categorisation stays, and must work on "all events of this kind" (starts with, includes, etc.), not one event at a time. | MoOx, 2026-11-09 |
| D15 | English first; translation later. | MoOx, 2026-11-09 |
| D16 | The new app replaces v1: same identifier, same App Store listing, v1 exports importable. | MoOx, 2026-11-09 |
| D17 | Store copy may state the health purpose that HealthKit requires. | MoOx, 2026-11-09 |
| D18 | Free, as v1. | MoOx, 2026-11-09 |
| D19 | Screen Time: not now. Revisit later; EU-only data makes it not urgent. | MoOx, 2026-11-09 |
| D20 | Notification permission: optional, as in v1, and asked as late as possible. The exact moment depends on what the notifications will say. | MoOx, 2026-11-09 |
| D21 | **Release plan:** v2-alpha1 is v1 brought up to date (iOS, calendar, existing domain logic); v2-alpha2 adds sleep and sport; then the interface is rethought around automation. | MoOx, 2026-11-09: « on tente d'avoir une remise au gout du jour puis sommeil/sport puis revoir l'UI » |
| D22 | The calendar stays the primary source. Someone who works and trains at home gives sensors little. Sensors add what they measure with certainty. | MoOx, 2026-11-09: « je ne sais pas si on doit avoir vraiment les capteurs en primaire » |
| D23 | **Two kinds of overlap.** The same thing seen twice (sport in the calendar and on the watch) counts once. Different things at the same time (a train commute while reading) count in both. Detailed in alpha2. | MoOx, 2026-11-09: « Il faut avoir 2 possibilités » |
| D24 | Time nothing accounts for is not shown. | MoOx, 2026-11-09: « On veut voir ce qu'on fait, pas ce qu'on ne fait pas. » |
| D25 | The chart stacks by the week's totals, the biggest at the bottom, as in v1. Possibly revisited later. | MoOx, 2026-11-09: « J'aimais bien l'idée d'empilement qu'on voit les plus gros "consommateurs" de temps » |
| D26 | The Sorter is in alpha1, with a tool to select several events and deduce a rule that applies in future. | MoOx, 2026-11-09: « selectionner plusieurs evenements et en déduire une regle pour que ca s'applique à l'avenir » |

---

## 5. Method

### Phases

0. **Alignment** — this document. *Done 2026-11-08.*
1. **Research** — what a phone can tell us about how its owner spent time:
   [DATA-SOURCES.md](./DATA-SOURCES.md).
2. **Product spec** — data model (sources → raw observations → a resolved timeline),
   merge rules for overlapping sources, screens, navigation map with the header behaviour
   of every screen, permissions and onboarding, privacy per source. Every decision lands
   in §4; open questions are batched and asked once.
3. **Spikes** — every risky native assumption is proven on a simulator or device before a
   screen depends on it.
4. **Build** — slice by slice, each with a written definition of done.

### Rules

- **Evidence before claims.** "Done" cites what proves it: a native screenshot, a test, a
  log. Nothing is called complete without it.
- **Cited or absent.** Anything carried over from v1 points at the v1 source
  (`git show main:<path>`); anything new says why.
- **The native renderer is the reference.** iOS Simulator, Android emulator or a device —
  not the web preview — decides whether a screen is right.
- **One batch of questions per phase.** Between batches, take the documented default and
  record it here.

---

## 6. Environment facts (checked 2026-11-08)

- **The cloud session cannot run simulators.** Its container is Linux x86_64 with no
  `/dev/kvm` and no CPU virtualisation flags: the iOS Simulator needs macOS, and the
  Android emulator has no hardware acceleration here.
- **Remote Control:** MoOx's Mac ("MaxBook") is known, but it offers no folder to cloud
  sessions (`not_available` for each listed folder).
- **So native work runs on the Mac**, in a Claude Code session started there (desktop app
  or CLI), where Xcode, the iOS Simulator and the Android emulator are available.
  Alternatively, a cloud session can drive the Mac through Remote Control once a LifeTime
  folder is offered to cloud sessions (Claude desktop app → Settings → Claude Code →
  Remote Control); that is not available to every account yet.
- **MoOx's Mac** has Xcode 26.6 at `/Applications/Xcode-26.6.0.app` (installed with
  `xcodes`), so v1 can be built against the iOS 26 SDK, where the UIScene rule does not
  apply.
- **Release pipeline:** `.github/workflows/ios-testflight.yml` (fastlane match against
  `MoOx/certificates`), pinned to Xcode 26.6 until the app adopts the UIScene life cycle
  required by the iOS 27 SDK.

---

## 7. Open items

- **Commutes:** a commute is a mode, not an activity (reading on the train, cycling to work). To settle when motion data arrives, with user-defined categories (D23).
- **Platform-specific first sources:** iOS HealthKit + visits; Android Health Connect +
  usage events, deferring background location until the core passes Play review.
- **Policy timing:** HealthKit and Core Motion only for visible health and fitness
  purposes; Screen Time only for device-usage management, with the Family Controls
  entitlement requested months ahead if wanted (EU-only data).
- **Recommendations** (vision step 2): scope and timing.

---

## 8. What is already in the repository

| Asset | Use now |
|---|---|
| [SPEC.md](./SPEC.md) | What v1 does — source material |
| [SCREENS.md](./SCREENS.md) | v1 screen blueprint (intent, strings, behaviours) — source material for the new UI spec |
| [IMPROVEMENTS.md](./IMPROVEMENTS.md) | Proposals and the folded-in v1 issues |
| [CATEGORISATION.md](./CATEGORISATION.md) | Rules, sorter, on-device-model design |
| [CALENDAR.md](./CALENDAR.md) | Why `expo-calendar`, and how |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | The v2 stack — to be revised by the new spec |
| [RELEASE.md](./RELEASE.md) | TestFlight pipeline |
| [DATA-SOURCES.md](./DATA-SOURCES.md) | Automatic sources inventory (phase 1) |
| `src/domain/` | Tested TypeScript domain logic — candidate for reuse (D1) |
| v1 code | `main` branch |
