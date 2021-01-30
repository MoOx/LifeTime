open ReactNativeGestureHandler

module Stack = {
  @bs.module("@react-navigation/stack")
  external useGestureHandlerRef: unit => React.ref<gestureRef> = "useGestureHandlerRef"
}
