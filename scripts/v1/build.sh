#!/usr/bin/env bash
# Build v1 in Release for the simulator (JS bundled: no Metro, no dev overlays — what v1's
# own App Store screenshot setup used) and launch it on the dedicated "LifeTime v1"
# simulator. Run scripts/v1/setup.sh first.
#
# UNTESTED: written without macOS. Record problems and fixes in docs/reference/v1/BUILD.md.

set -euo pipefail
source "$(dirname "$0")/lib.sh"

[ -d "$WT/ios/Pods" ] || fail "Run scripts/v1/setup.sh first."
use_node16

UDID="$(v1_device)"
step "Simulator: $DEVICE_NAME ($UDID)"

step "xcodebuild with $(xcodebuild -version | head -1) (log: $WT/xcodebuild.log)"
cd "$WT"
export V1_NODE_BINARY="$(command -v node)"   # read by the patched bundle phase (setup.sh)
export CI=true   # v1's own switch to skip sentry-cli in its build phases (no credentials here)
# Xcode 26.6 does not find the implicit dependency on libPods-LifeTime.a ("Target
# dependency graph (1 target)"), so the pods are built explicitly first.
# ONLY_ACTIVE_ARCH: a Release build would otherwise also compile x86_64.
: > "$WT/xcodebuild.log"
for SCHEME in Pods-LifeTime LifeTime; do
  # pipefail is on, so this catches xcodebuild's own exit status.
  xcodebuild \
    -workspace ios/LifeTime.xcworkspace -scheme "$SCHEME" -configuration Release \
    -destination "id=$UDID" -derivedDataPath ios/build \
    ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO build 2>&1 | tee -a "$WT/xcodebuild.log" \
    | grep -E '( error: |BUILD (SUCCEEDED|FAILED))' | cut -c1-300 \
    || fail "$SCHEME failed to build: read the errors in $WT/xcodebuild.log."
done
[ -d "$APP" ] || fail "No app at $APP: read the errors in $WT/xcodebuild.log."
# The bundle phase swallows Metro's failures: xcodebuild reports success with no JS at all.
[ -s "$APP/main.jsbundle" ] || fail "No main.jsbundle in the app: look for Metro's error in $WT/xcodebuild.log."

step "Install and launch"
xcrun simctl boot "$UDID" 2>/dev/null || true
xcrun simctl bootstatus "$UDID" -b >/dev/null
open -a Simulator --args -CurrentDeviceUDID "$UDID" || true
xcrun simctl install "$UDID" "$APP"
xcrun simctl launch "$UDID" "$BUNDLE_ID"
sleep 8   # v1's welcome has staged entrances of up to ~2.5 s

mkdir -p "$REPO/docs/reference/v1/ios"
xcrun simctl io "$UDID" screenshot "$REPO/docs/reference/v1/ios/00-launch.png"
printf '\n\033[32m✔ v1 is running. Proof: docs/reference/v1/ios/00-launch.png — open it and check it shows the Welcome screen.\033[0m\n'
