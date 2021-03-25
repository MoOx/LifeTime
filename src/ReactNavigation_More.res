open ReactNativeGestureHandler

module Stack = {
  @module("@react-navigation/stack")
  external useGestureHandlerRef: unit => React.ref<gestureRef> = "useGestureHandlerRef"
}
