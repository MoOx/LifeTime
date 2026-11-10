# Spike 1: Expo SDK 58 builds with Xcode 27

**Question.** Does a fresh Expo SDK 58 app build with Xcode 27 and launch on the newest
simulator runtime? (NEXT.md step 4, spike 1; spec D12.)

**What was tried.** A throwaway app outside the repository (`~/dev/LifeTime-spike`), created
from the `default@sdk-58` template: expo ~58.0.23, React Native 0.88.1, expo-router ~58.0.30,
react-native-screens ~4.30.1, @expo/ui ~58.0.27. Node 22, Xcode 27.2 (27B52), default
`xcode-select`. Built with `npx expo run:ios --configuration Release` on an iPhone 17 Pro
simulator.

**Evidence.**

- Release build installed and launched on iOS 27.0:
  [01-sdk58-build/launched-ios27.0.png](./01-sdk58-build/launched-ios27.0.png).
- Pods: 116 dependencies, 115 pods; ExpoModulesCore, ExpoFont, ExpoImage and others arrive
  precompiled.

**Verdict: passes.** SDK 58 builds and runs under Xcode 27.2.

**Caveats, recorded for slice 0.**

- **Runtimes on this Mac.** Xcode 27.2 ships the iOS 27.2 simulator SDK, but no 27.2 runtime
  was installed. The installed iOS 27.1 runtime (build `24A94425`, which looks like a beta)
  refuses to create any iPhone 17 Pro or 18 Pro device ("Incompatible device"), so the spike
  ran on iOS 27.0. MoOx deleted that 27.1 runtime on 2026-11-10. The 27.2 runtime is being downloaded; slice 0 re-runs the build on it.
- **Launch alert.** `expo run:ios` launches through a deep link, which iOS 27 answers with an
  "Open in LifeTime-spike?" alert. The command then waits forever, which once looked like a
  build still running. Launch with `xcrun simctl launch <udid> <bundle id>` instead, and never
  read a live `expo run:ios` as a build in progress without checking for `xcodebuild`.
- A Release build embeds its JS bundle, so no Metro is needed to verify it.
