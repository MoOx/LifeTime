type showConfig
@obj external showConfig: (~duration: float=?) => showConfig = ""

type hideConfig
@obj external hideConfig: (~duration: float=?) => hideConfig = ""

@module("react-native-bootsplash") @scope("default")
external show: option<showConfig> => unit = "show"

@module("react-native-bootsplash") @scope("default")
external hide: option<hideConfig> => unit = "hide"

/*
 ## Usage

 ### No options

 ```re
 ReactNativeBootSplash.hide(None);
 ReactNativeBootSplash.show(None);
 ```

 ## With options

 ```re
 ReactNativeBootSplash.(show(Some(showConfig(~duration=1000.))));
 ReactNativeBootSplash.(hide(Some(hideConfig(~duration=1000.))));
 ```

 */
