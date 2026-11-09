#!/usr/bin/env bash
# Prepare v1 (the `main` branch: React Native 0.67 + ReScript 9) so it can be built for
# the iOS Simulator and captured. Runs on macOS only.
#
# UNTESTED: written in a cloud session that has no macOS. Expect to fix things; record
# every symptom and fix in docs/reference/v1/BUILD.md.
#
#   scripts/v1/setup.sh                 prepare ../LifeTime-v1
#   V1_HERMES=0 scripts/v1/setup.sh     same, with JSC instead of Hermes
#   V1_WORKTREE=/path scripts/v1/setup.sh

set -euo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
WT="${V1_WORKTREE:-$(cd "$REPO/.." && pwd)/LifeTime-v1}"
HERMES="${V1_HERMES:-1}"

step() { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
fail() { printf '\n\033[31m✘ %s\033[0m\n' "$*"; exit 1; }

[ "$(uname)" = Darwin ] || fail "macOS only."

step "Worktree of main at $WT (this checkout is left untouched)"
if [ ! -d "$WT" ]; then
  git -C "$REPO" fetch origin main
  # Detached at origin/main, so nothing done in the worktree can land on main by accident.
  git -C "$REPO" worktree add --detach "$WT" origin/main
fi
cd "$WT"

step "Node 16 (v1's .node-version)"
if command -v fnm >/dev/null; then
  eval "$(fnm env --shell bash)"
  fnm use --install-if-missing 16
fi
node -v | grep -q '^v16\.' || fail "Node 16 required, found $(node -v). Install fnm (brew install fnm) and re-run."

step "Dependencies, then v1's own prepare script"
# prepare = patch-package, husky, SVG components, Markdown → JSON, ReScript, splash screen.
# HUSKY=0 skips the git hooks (pointless in a worktree); DETOX_DISABLE_POSTINSTALL skips
# compiling Detox's framework, which v1's screenshots no longer use (Maestro does).
if ! HUSKY=0 DETOX_DISABLE_POSTINSTALL=1 npm ci; then
  fail "npm ci failed. Fallback: 'npm ci --ignore-scripts', then run each prepare step by hand (npx patch-package; npm run svg; npm run md:to-json; npm run res:build; npm run bootsplash) and note which one breaks in BUILD.md."
fi
[ -f ios/LifeTime/BootSplash.storyboard ] || fail "ios/LifeTime/BootSplash.storyboard missing — run 'npm run bootsplash' and check its error."

step "Fix: boost download URL (boostorg.jfrog.io is gone)"
BOOST=node_modules/react-native/third-party-podspecs/boost.podspec
sed -i '' 's#https://boostorg.jfrog.io/artifactory/main/release/1.76.0/source/boost_1_76_0.tar.bz2#https://archives.boost.io/release/1.76.0/source/boost_1_76_0.tar.bz2#' "$BOOST"
grep -q archives.boost.io "$BOOST" || echo "  ! boost.podspec did not contain the expected URL — check it by hand."

step "Fix: drop Yoga's -Werror (recent clang adds warnings its 2022 sources trip)"
sed -i '' "/'-Werror',/d" node_modules/react-native/ReactCommon/yoga/Yoga.podspec

step "Fix: app deployment target → 15.1"
sed -i '' -E 's/IPHONEOS_DEPLOYMENT_TARGET = 1[0-4]\.[0-9]+;/IPHONEOS_DEPLOYMENT_TARGET = 15.1;/g' ios/LifeTime.xcodeproj/project.pbxproj

step "Fix: let the bundle phase use Node 16 (its own fnm lookup lands on the default Node)"
sed -i '' 's/export NODE_BINARY=node/export NODE_BINARY=\\"${V1_NODE_BINARY:-node}\\"/' ios/LifeTime.xcodeproj/project.pbxproj

step "Fix: Podfile (no Flipper, iOS 15.1, libc++ removed-functions define)"
cp "$REPO/scripts/v1/Podfile" ios/Podfile
if [ "$HERMES" != 1 ]; then
  sed -i '' 's/:hermes_enabled => true/:hermes_enabled => false/' ios/Podfile
  echo "  Hermes disabled (JSC)."
fi

step "pod install"
command -v pod >/dev/null || fail "CocoaPods missing: brew install cocoapods"
# v1's .ruby-version pins 2.7.4, which rbenv refuses when it is not installed. Any Ruby
# with a recent CocoaPods does the job, so take the newest one rbenv has.
if command -v rbenv >/dev/null; then export RBENV_VERSION="${V1_RUBY:-$(rbenv versions --bare | tail -1)}"; fi
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8   # CocoaPods aborts without a UTF-8 locale
(cd ios && pod install --repo-update)

step "Fix: Sentry 7.1.4 relied on transitive headers that the iOS 26 SDK no longer pulls in"
prepend_include() { # <file> <header>
  grep -q "#include <$2>" "$1" || { chmod u+w "$1"; printf '#include <%s>\n' "$2" | cat - "$1" > "$1.tmp" && command mv -f "$1.tmp" "$1"; }
}
SENTRY=ios/Pods/Sentry/Sources/SentryCrash/Recording
prepend_include "$SENTRY/Monitors/SentryCrashMonitor_CPPException.cpp" exception
prepend_include "$SENTRY/Tools/SentryCrashMachineContext.c" sys/_types/_ucontext64.h

printf '\n\033[32m✔ v1 prepared in %s — next: scripts/v1/build.sh\033[0m\n' "$WT"
