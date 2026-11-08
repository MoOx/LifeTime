# Shared helpers for the v1 scripts. Sourced, not executed.

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WT="${V1_WORKTREE:-$(cd "$REPO/.." && pwd)/LifeTime-v1}"
DEVICE_NAME="${V1_DEVICE:-LifeTime v1}"
DEVICE_TYPE="${V1_DEVICE_TYPE:-iPhone 17 Pro}"
APP="$WT/ios/build/Build/Products/Release-iphonesimulator/LifeTime.app"
BUNDLE_ID="io.moox.LifeTime"   # v1 Release; also the new app's id — keep them on separate simulators

# v1 is built against the iOS 26 SDK: an app built with the iOS 27 SDK must adopt the
# UIScene life cycle to launch on iOS 27, and v1 predates it. MoOx's Mac has Xcode 26.6
# installed with xcodes at this path; DEVELOPER_DIR overrides it.
XCODE_26="/Applications/Xcode-26.6.0.app/Contents/Developer"
if [ -z "${DEVELOPER_DIR:-}" ] && [ -d "$XCODE_26" ]; then export DEVELOPER_DIR="$XCODE_26"; fi

step() { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
fail() { printf '\n\033[31m✘ %s\033[0m\n' "$*"; exit 1; }

[ "$(uname)" = Darwin ] || fail "macOS only."

# Newest available iOS 26.x runtime — the family Xcode 26.6 ships with.
v1_runtime() {
  if [ -n "${V1_RUNTIME:-}" ]; then echo "$V1_RUNTIME"; return; fi
  xcrun simctl list runtimes -j | /usr/bin/python3 -c '
import json, sys
rs = [r for r in json.load(sys.stdin)["runtimes"]
      if r.get("isAvailable") and r.get("platform") == "iOS" and r["version"].startswith("26.")]
rs.sort(key=lambda r: [int(x) for x in r["version"].split(".")])
print(rs[-1]["identifier"] if rs else "")'
}

# UDID of the dedicated simulator, created on first use.
v1_device() {
  local udid
  udid="$(xcrun simctl list devices -j | /usr/bin/python3 -c '
import json, sys
name = sys.argv[1]
for devs in json.load(sys.stdin)["devices"].values():
    for d in devs:
        if d["name"] == name and d.get("isAvailable"):
            print(d["udid"]); sys.exit()' "$DEVICE_NAME")"
  if [ -z "$udid" ]; then
    local runtime; runtime="$(v1_runtime)"
    [ -n "$runtime" ] || fail "No iOS 26.x simulator runtime (DEVELOPER_DIR=${DEVELOPER_DIR:-unset}). Install one from Xcode 26.6 > Settings > Components, or 'xcodebuild -downloadPlatform iOS'. Override with V1_RUNTIME=…"
    udid="$(xcrun simctl create "$DEVICE_NAME" "$DEVICE_TYPE" "$runtime")"
  fi
  echo "$udid"
}

use_node16() {
  if command -v fnm >/dev/null; then eval "$(fnm env --shell bash)"; fnm use --install-if-missing 16 >/dev/null; fi
  node -v | grep -q '^v16\.' || fail "Node 16 required for v1's JS bundle, found $(node -v)."
}
