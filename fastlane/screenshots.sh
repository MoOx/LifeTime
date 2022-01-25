#!/usr/bin/env zsh

# stop on first error
set -e

build=false
#I: indicates that a - I option with parameters can be accepted
#C means you can accept a - C option without parameters
while {getopts b arg} {
  case $arg {
    (b)
    build=true
    ;;

    (?)
    echo error
    return 1
    ;;
  }
}

rm -rf ./artifacts
shotsRoot="screenshots/en-US/"

function takeShots(build, config, folder) {
  mvTo=$shotsRoot/$folder
  $build && ./node_modules/.bin/detox build -c $config
  ./node_modules/.bin/detox test -c $config
  rm -rf $mvTo
  mkdir -p $mvTo
  mv ./artifacts/$config.*/✓\ */* $mvTo
  cd $shotsRoot
  find "$folder" -type f -name "*.png" -exec sh -c 'new=$(echo "{}" | tr "/" "-"); mv "{}" "$new"' \;
  rm -rf $folder
  cd ../..
  rm -rf ./artifacts
}

takeShots("ios-6.5", "Apple iPhone 11 Pro Max")
takeShots("ios-5.5-legacy", "Apple iPhone 8 Plus")
takeShots("ios-12.9", "Apple iPad Pro (12.9-inch) (4th generation)")
takeShots("ios-12.9-legacy", "Apple iPad Pro (12.9-inch) (2nd generation)")
