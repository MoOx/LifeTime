# LifeTime

[![iOS](https://github.com/MoOx/LifeTime/actions/workflows/build-ios.yml/badge.svg)](https://github.com/MoOx/LifeTime/actions/workflows/build-ios.yml)
[![Android](https://github.com/MoOx/LifeTime/actions/workflows/build-android.yml/badge.svg)](https://github.com/MoOx/LifeTime/actions/workflows/build-android.yml)
[![Tests](https://github.com/MoOx/LifeTime/actions/workflows/build-tests.yml/badge.svg)](https://github.com/MoOx/LifeTime/actions/workflows/build-tests.yml)

## Installation

Before installing the project, you have to verify that you have on you machine
all requirements

### Requirements

Please be sure to have installed:

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/) with [Yarn](https://yarnpkg.com/)
- [Watchman](https://facebook.github.io/watchman/)
- [Ruby](https://www.ruby-lang.org/en/) with [Bundler](https://bundler.io) 2
- [Xcode](https://developer.apple.com/xcode/) for iOS development
  (via the AppStore, <https://developer.apple.com/download/more/> or <https://xcodereleases.com> to get the older version if necessary)
- [Android Studio](https://developer.android.com/studio/) for Android
  development (and optionally [Genymotion](https://www.genymotion.com/desktop/))

Optionally but highly recommended:

- Use [`fnm`](https://github.com/Schniz/fnm),
  [`nvm`](https://github.com/creationix/nvm) or
  [`nvs`](https://github.com/jasongin/nvs) to switch Node.js versions if you
  need to (see [.node-version](.node-version))
- Use [`rbenv`](https://github.com/rbenv/rbenv) or [`rvm`](http://rvm.io) to use the Ruby version required (see [.ruby-version](.ruby-version))

### macOS

If you are using macOS (_required for iOS development_), you can use
[HomeBrew](https://brew.sh/) to easily get most of these requirements:

```console
brew install git
brew install node
brew install yarn
brew install watchman
brew install --cask android-platform-tools
brew install --cask android-sdk
brew install --cask android-studio
```

(Only Xcode is missing with the commands above)

Optionally

#### Node via fnm

```console
brew uninstall node
brew install Schniz/tap/fnm

export PATH=$HOME/.fnm:$PATH
eval "`fnm env --multi --use-on-cd`"

fnm install 12 && fnm default `fnm ls | grep v12 | tail -1 | cut -c4-`
```

#### Ruby & Bundler via rbenv

```console
brew install rbenv

export GEM_HOME=$HOME/.gem
export PATH=$PATH:$HOME/.gem/bin
eval "$(rbenv init -)"

rbenv install 2.6.3 && rbenv global 2.6.3
gem install bundle
```

## Getting Started

Clone the repo and install the dependencies

```console
git clone https://github.com/MoOx/reason-react-native-boilerplate.git
cd reason-react-native-boilerplate
yarn
```

## Recommended IDE

### Visual Studio Code

On macOS you can install VSCode using Homebrew:

```console
brew cask install visual-studio-code
```

Open it & you should get `code` CLI installed. Then you can install recommended
extensions from the CLI.

### Recommended Visual Studio Code Extensions

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Flow Language Support](https://marketplace.visualstudio.com/items?itemName=flowtype.flow-for-vscode)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native)
- [DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv)

You can get those with the following commands

```console
code --install-extension dbaeumer.vscode-eslint
code --install-extension flowtype.flow-for-vscode
code --install-extension esbenp.prettier-vscode
code --install-extension msjsdiag.vscode-react-native
code --install-extension mikestead.dotenv
```

### Optional Debug Tools

#### React Native Debugger

This tool contains React Inspector, Redux debbuger, and a light version of
chrome devtools (console, sources, network...).

```console
brew cask install react-native-debugger
```

Launch it before starting the application to debug.

More information
[on react-native-debugger documentation](https://github.com/jhen0409/react-native-debugger)
