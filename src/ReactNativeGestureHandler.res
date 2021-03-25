type gestureRef

module NativeViewGestureHandler = {
  @react.component @module("react-native-gesture-handler")
  external make: (
    ~waitFor: React.ref<gestureRef>=?,
    ~simultaneousHandlers: React.ref<gestureRef>=?,
    ~children: React.element,
  ) => React.element = "NativeViewGestureHandler"
}

module ScrollView = {
  open ReactNative

  // below is a copy of ScrollView
  // https://raw.githubusercontent.com/reason-react-native/reason-react-native/master/src/components/ScrollView.re
  // only the bs.module has been changed
  // in addition to waitFor
  // ⬇
  include ScrollViewElement

  type contentOffset
  @obj external contentOffset: (~x: float, ~y: float) => contentOffset = ""

  type contentInsetAdjustmentBehavior = [#automatic | #scrollableAxes | #never | #always]

  type decelerationRate = [#fast | #normal]

  type indicatorStyle = [#default | #black | #white]

  type keyboardShouldPersistTaps = [#always | #never | #handled]

  type overScrollMode = [#always | #never | #auto]

  type snapToAlignment = [#start | #center | #end_]

  @react.component @module("react-native-gesture-handler")
  external make: (
    ~waitFor: React.ref<gestureRef>=?,
    ~simultaneousHandlers: option<option<array<React.ref<gestureRef>>>>=?,
    ~ref: ref=?,
    ~alwaysBounceHorizontal: // ScrollView props
    bool=?,
    ~alwaysBounceVertical: bool=?,
    ~automaticallyAdjustContentInsets: bool=?,
    ~bounces: bool=?,
    ~bouncesZoom: bool=?,
    ~canCancelContentTouches: bool=?,
    ~centerContent: bool=?,
    ~contentContainerStyle: Style.t=?,
    ~contentInset: View.edgeInsets=?,
    ~contentInsetAdjustmentBehavior: contentInsetAdjustmentBehavior=?,
    ~contentOffset: contentOffset=?,
    ~decelerationRate: decelerationRate=?,
    ~directionalLockEnabled: bool=?,
    ~endFillColor: Color.t=?,
    ~fadingEdgeLength: float=?,
    ~horizontal: bool=?,
    ~indicatorStyle: indicatorStyle=?,
    ~keyboardDismissMode: @string [#none | #interactive | @as("on-drag") #onDrag]=?,
    ~keyboardShouldPersistTaps: keyboardShouldPersistTaps=?,
    ~maximumZoomScale: float=?,
    ~minimumZoomScale: float=?,
    ~nestedScrollEnabled: bool=?,
    ~onContentSizeChange: ((float, float)) => unit=?,
    ~onMomentumScrollBegin: Event.scrollEvent => unit=?,
    ~onMomentumScrollEnd: Event.scrollEvent => unit=?,
    ~onScroll: Event.scrollEvent => unit=?,
    ~onScrollBeginDrag: Event.scrollEvent => unit=?,
    ~onScrollEndDrag: Event.scrollEvent => unit=?,
    ~overScrollMode: overScrollMode=?,
    ~pagingEnabled: bool=?,
    ~pinchGestureEnabled: bool=?,
    ~refreshControl: React.element=?,
    ~scrollEnabled: bool=?,
    ~scrollEventThrottle: int=?,
    ~scrollIndicatorInsets: View.edgeInsets=?,
    ~scrollPerfTag: string=?,
    ~scrollsToTop: bool=?,
    ~scrollToOverflowEnabled: bool=?,
    ~showsHorizontalScrollIndicator: bool=?,
    ~showsVerticalScrollIndicator: bool=?,
    ~snapToAlignment: snapToAlignment=?,
    ~snapToEnd: bool=?,
    ~snapToInterval: float=?,
    ~snapToOffsets: array<float>=?,
    ~snapToStart: bool=?,
    ~stickyHeaderIndices: array<int>=?,
    ~zoomScale: float=?,
    ~accessibilityActions: // View props 0.63.0
    array<Accessibility.actionInfo>=?,
    ~accessibilityElementsHidden: bool=?,
    ~accessibilityHint: string=?,
    ~accessibilityIgnoresInvertColors: bool=?,
    ~accessibilityLabel: string=?,
    ~accessibilityLiveRegion: Accessibility.liveRegion=?,
    ~accessibilityRole: Accessibility.role=?,
    ~accessibilityState: Accessibility.state=?,
    ~accessibilityValue: Accessibility.value=?,
    ~accessibilityViewIsModal: bool=?,
    ~accessible: bool=?,
    ~collapsable: bool=?,
    ~hitSlop: View.edgeInsets=?,
    ~importantForAccessibility: @string
    [#auto | #yes | #no | @as("no-hide-descendants") #noHideDescendants]=?,
    ~nativeID: string=?,
    ~needsOffscreenAlphaCompositing: bool=?,
    ~onAccessibilityAction: Accessibility.actionEvent => unit=?,
    ~onAccessibilityEscape: unit => unit=?,
    ~onAccessibilityTap: unit => unit=?,
    ~onLayout: Event.layoutEvent => unit=?,
    ~onMagicTap: unit => unit=?,
    ~onMoveShouldSetResponder: // Gesture Responder props
    Event.pressEvent => bool=?,
    ~onMoveShouldSetResponderCapture: Event.pressEvent => bool=?,
    ~onResponderEnd: Event.pressEvent => unit=?,
    ~onResponderGrant: Event.pressEvent => unit=?,
    ~onResponderMove: Event.pressEvent => unit=?,
    ~onResponderReject: Event.pressEvent => unit=?,
    ~onResponderRelease: Event.pressEvent => unit=?,
    ~onResponderStart: Event.pressEvent => unit=?,
    ~onResponderTerminate: Event.pressEvent => unit=?,
    ~onResponderTerminationRequest: Event.pressEvent => bool=?,
    ~onStartShouldSetResponder: Event.pressEvent => bool=?,
    ~onStartShouldSetResponderCapture: Event.pressEvent => bool=?,
    ~pointerEvents: @string [#auto | #none | @as("box-none") #boxNone | @as("box-only") #boxOnly]=?,
    ~removeClippedSubviews: bool=?,
    ~renderToHardwareTextureAndroid: bool=?,
    ~shouldRasterizeIOS: bool=?,
    ~style: Style.t=?,
    ~testID: string=?,
    ~children: React.element=?,
    ~onMouseDown: // React Native Web Props
    ReactEvent.Mouse.t => unit=?,
    ~onMouseEnter: ReactEvent.Mouse.t => unit=?,
    ~onMouseLeave: ReactEvent.Mouse.t => unit=?,
    ~onMouseMove: ReactEvent.Mouse.t => unit=?,
    ~onMouseOver: ReactEvent.Mouse.t => unit=?,
    ~onMouseOut: ReactEvent.Mouse.t => unit=?,
    ~onMouseUp: ReactEvent.Mouse.t => unit=?,
  ) => React.element = "ScrollView"
}

module Animated = {
  module ScrollView = {
    include ScrollView
    let make = ReactNative.Animated.createAnimatedComponent(make)
  }
}

module HandlerStateChangeEvent = {
  open ReactNative

  type extraChildStyle = {opacity: option<float>}
  type extraUnderlayStyle = {backgroundColor: option<Color.t>}
  type state = {
    extraChildStyle: Js.nullable<extraChildStyle>,
    extraUnderlayStyle: Js.nullable<extraUnderlayStyle>,
  }
  type payload = {
    handlerTag: float,
    numberOfPointers: float,
    state: state,
    oldState: state,
  }

  include Event.SyntheticEvent({
    type _payload = payload
  })
}

module SwipeableMethods = {
  module Make = (
    T: {
      type t
    },
  ) => {
    @send external close: T.t => unit = "close"
    @send external openLeft: T.t => unit = "openLeft"
    @send external openRight: T.t => unit = "openRight"
  }
}

module SwipeableElement = {
  open ReactNative
  type element
  type ref = Ref.t<element>

  include SwipeableMethods.Make({
    type t = element
  })
}

module Swipeable = {
  open ReactNative

  include SwipeableElement

  @react.component @module("react-native-gesture-handler")
  external make: (
    ~ref: ref=?,
    // BaseGestureHandle props
    ~enabled: bool=?,
    ~hitSlop: View.edgeInsets=?,
    ~id: string=?,
    ~minPointers: float=?,
    ~onActivated: HandlerStateChangeEvent.t => unit=?,
    ~onBegan: HandlerStateChangeEvent.t => unit=?,
    ~onCancelled: HandlerStateChangeEvent.t => unit=?,
    ~onEnded: HandlerStateChangeEvent.t => unit=?,
    ~onFailed: HandlerStateChangeEvent.t => unit=?,
    ~shouldCancelWhenOutside: bool=?,
    ~simultaneousHandlers: array<React.ref<'b>>=?,
    ~waitFor: array<React.ref<'a>>=?,
    // PanGestureHandle props
    ~activeOffsetX: array<float>=?,
    ~activeOffsetY: array<float>=?,
    ~avgTouches: bool=?,
    ~failOffsetX: array<float>=?,
    ~failOffsetY: array<float>=?,
    ~maxPointers: float=?,
    ~minDist: float=?,
    ~minPointers: float=?,
    ~minVelocity: float=?,
    ~minVelocityX: float=?,
    ~minVelocityY: float=?,
    // Swipeable props
    ~animationOptions: Animated.Value.Spring.config=?,
    ~childrenContainerStyle: Style.t=?,
    ~containerStyle: Style.t=?,
    ~enableTrackpadTwoFingerGesture: bool=?,
    ~friction: float=?,
    ~leftThreshold: float=?,
    ~onSwipeStart: unit => unit=?, // patched
    ~onSwipeableClose: unit => unit=?,
    ~onSwipeableLeftOpen: unit => unit=?,
    ~onSwipeableLeftWillOpen: unit => unit=?,
    ~onSwipeableOpen: unit => unit=?,
    ~onSwipeableRightOpen: unit => unit=?,
    ~onSwipeableRightWillOpen: unit => unit=?,
    ~onSwipeableWillClose: unit => unit=?,
    ~onSwipeableWillOpen: unit => unit=?,
    ~overshootFriction: float=?,
    ~overshootLeft: bool=?,
    ~overshootRight: bool=?,
    ~renderLeftActions: (@uncurry Animated.Value.t, Animated.Value.t) => React.element=?,
    ~renderRightActions: (@uncurry Animated.Value.t, Animated.Value.t) => React.element=?,
    ~rightThreshold: float=?,
    ~useNativeAnimations: bool=?,
    ~children: React.element=?,
  ) => React.element = "Swipeable"
}
