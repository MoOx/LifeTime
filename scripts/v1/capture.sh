#!/usr/bin/env bash
# Capture every v1 screen natively, in light then dark, by running the Maestro flows in
# .maestro/v1/ against a freshly erased "LifeTime v1" simulator. Run scripts/v1/build.sh
# first. Scroll videos are off: v1's header is a hand-built replica the new app does not
# copy (INTENT.md D10). V1_RECORD=1 records them anyway, in the light pass.
#
#   scripts/v1/capture.sh                  both appearances, all flows
#   V1_MODES=light scripts/v1/capture.sh   one appearance
#   V1_FLOWS=02 scripts/v1/capture.sh      only flows whose name starts with 02 (note: 02–04
#                                          expect the state left by the flows before them)
#
# UNTESTED: written without macOS; selectors and timings will need adjusting.

set -euo pipefail
source "$(dirname "$0")/lib.sh"

command -v maestro >/dev/null || fail "Maestro missing: curl -fsSL https://get.maestro.mobile.dev | bash"
[ -d "$APP" ] || fail "No v1 build at $APP — run scripts/v1/build.sh first."

UDID="$(v1_device)"
OUT_ROOT="$REPO/docs/reference/v1/ios"
FLOWS_DIR="$REPO/.maestro/v1"

for MODE in ${V1_MODES:-light dark}; do
  step "$MODE pass on $DEVICE_NAME ($UDID)"
  # Erasing is what makes each pass identical: no injected demo calendar from a previous
  # run, no app state, no events — so flow 01 really sees an empty calendar.
  xcrun simctl shutdown "$UDID" 2>/dev/null || true
  xcrun simctl erase "$UDID"
  xcrun simctl boot "$UDID"
  xcrun simctl bootstatus "$UDID" -b >/dev/null
  xcrun simctl ui "$UDID" appearance "$MODE"
  xcrun simctl status_bar "$UDID" override --time "9:41" \
    --dataNetwork wifi --wifiMode active --wifiBars 3 \
    --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100
  xcrun simctl install "$UDID" "$APP"

  mkdir -p "$OUT_ROOT/$MODE" "$OUT_ROOT/video"
  RECORD=0; [ "${V1_RECORD:-0}" = 1 ] && [ "$MODE" = light ] && RECORD=1

  for flow in "$FLOWS_DIR"/${V1_FLOWS:-0}*.yaml; do
    step "$(basename "$flow")"
    maestro --device "$UDID" test \
      -e OUT="$OUT_ROOT/$MODE" -e VIDEO="$OUT_ROOT/video" -e RECORD="$RECORD" \
      "$flow"
  done
done

printf '\n\033[32m✔ Captures in docs/reference/v1/ios/ — now check each one against SCREENS.md and fill in docs/reference/v1/README.md.\033[0m\n'
