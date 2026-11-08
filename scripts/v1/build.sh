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
export SENTRY_DISABLE_AUTO_UPLOAD=true   # v1's Sentry symbol upload has no credentials here
xcodebuild \
  -workspace ios/LifeTime.xcworkspace -scheme LifeTime -configuration Release \
  -destination "id=$UDID" -derivedDataPath ios/build \
  CODE_SIGNING_ALLOWED=NO build 2>&1 | tee "$WT/xcodebuild.log" | grep -E '(error|warning: .*deprecated|BUILD (SUCCEEDED|FAILED))' || true
[ -d "$APP" ] || fail "No app at $APP — read the errors in $WT/xcodebuild.log."

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
