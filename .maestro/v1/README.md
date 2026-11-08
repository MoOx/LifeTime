# v1 capture flows

Maestro flows that drive **v1** (Release build, bundle id `io.moox.LifeTime`) in the iOS
Simulator and take the screenshots listed in `docs/reference/v1/README.md`. Run them
through `scripts/v1/capture.sh`, which erases the simulator, sets the appearance and the
status bar, and passes three variables:

| Variable | Meaning |
|---|---|
| `OUT` | Folder for screenshots (`docs/reference/v1/ios/light` or `…/dark`) |
| `VIDEO` | Folder for scroll videos |
| `RECORD` | `1` in the light pass, so videos are recorded once |

They are a port of v1's own App Store screenshot flow (`git show main:e2e/demo.e2e.js`)
and of `e2e/fresh.e2e.js`, using v1's real `testID`s where it has them and its exact
labels (from `docs/SCREENS.md`) elsewhere.

**Untested:** written in a cloud session without a simulator. Fix selectors and timings as
needed when running them.

Flows depend on order: `01` starts from a fresh install; `02`–`04` continue from the state
the previous flow left. `_categorise.yaml` is a sub-flow.
