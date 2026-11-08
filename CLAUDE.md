# LifeTime — instructions for Claude

LifeTime is MoOx's privacy-first time-tracking app: it shows how the week was spent, from
the phone's own data, and helps keep goals and limits. The repository is mid-way through
a rebuild. **Read [docs/INTENT.md](docs/INTENT.md) before doing anything** — it holds what
MoOx wants, why the previous attempt disappointed, the decisions taken, and the method.

## "continue"

When MoOx says **continue** (or anything equivalent: "go", "next", "on y va"):

1. `git pull` on the current branch.
2. Open [docs/NEXT.md](docs/NEXT.md) and take the **first step that is not ticked**.
3. Do it fully, following that step's instructions and its definition of done.
4. Tick it in NEXT.md with the date and the evidence (file paths, commit, screenshot),
   commit, push — then go straight on to the next step.
5. Stop only when a step says it needs MoOx (a decision, a password or Apple ID, a
   physical device) or its time-box runs out. Then write what is blocked, and why, into
   that step, commit, push, and ask MoOx — **every open question in one message**.

Never stop just to report progress; a summary at the end of the run is enough.

## Rules

- **Evidence before claims.** Never write "done", "works" or "complete" without citing
  what proves it: a native screenshot, a test run, a log. If it was not checked, say so.
- **The native renderer is the reference.** iOS Simulator, Android emulator or a device
  decide whether UI is right. `scripts/preview.mjs` renders the *web* build and cannot
  show headers, large titles, tab bars, Liquid Glass or native controls — never use it to
  judge native UI.
- **Cited or absent.** Behaviour carried over from v1 points to its v1 source
  (`git show main:<path>`); anything new says why it differs.
- **Spike before building on a native assumption** — prove it on a simulator first.
- **Record decisions** in INTENT.md §4 the moment they are taken.
- Install user-space tools freely (npm packages, `fnm`, Maestro, Homebrew formulae).
  Ask MoOx — in the single batched message — before anything that needs his password,
  his Apple ID, several GB of download (Xcode, simulator runtimes) or a system setting.

## Repository map

| Path | What |
|---|---|
| `docs/INTENT.md` | Intent, lessons, decisions, method — the source of truth |
| `docs/NEXT.md` | The runbook "continue" executes |
| `docs/DATA-SOURCES.md` | What a phone can tell us automatically (research, Nov 2026) |
| `docs/SPEC.md`, `docs/SCREENS.md` | What v1 does, and its screens in detail |
| `docs/reference/v1/` | Native captures of v1, and how v1 was rebuilt to take them |
| `src/domain/` | Tested TypeScript domain logic, candidate for reuse |
| `app/`, `src/ui`, `src/features` | The v2 UI attempt — to be replaced from the spec |
| `.maestro/` | Maestro flows (native screenshots and navigation checks) |
| `scripts/v1/` | Rebuilding and capturing v1 from the `main` branch |
| `main` branch | v1 source (React Native 0.67 + ReScript 9) |

## Commands

- `npm run check` — SDK versions, routes, Hermes `Intl` guard, typecheck, unit tests.
- `npx expo run:ios` / `npx expo run:android` — native dev builds.
- `maestro test <flow>` — drive the app on a booted simulator or emulator.

## Git

- Work on the branch currently checked out (the rebuild lives on
  `claude/app-audit-native-refactor-yx50ap`). Never push to `main`.
- Small commits with a message saying what changed and why. A commit whose message
  contains `[testflight]` triggers a TestFlight build in CI — only for builds MoOx should
  install.
