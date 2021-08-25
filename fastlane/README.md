# fastlane documentation

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using

```
[sudo] gem install fastlane -NV
```

or alternatively using `brew install fastlane`

# Available Actions

### versionBump

```
fastlane versionBump
```

Bump version

---

## Android

### android beta

```
fastlane android beta
```

Submit a new Beta Build to Google Play Store Beta

### android deploy

```
fastlane android deploy
```

Deploy a new version to the Google Play

---

## iOS

### ios beta

```
fastlane ios beta
```

iOS: Push a new beta build to TestFlight

---

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
