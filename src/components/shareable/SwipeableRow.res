open Belt
open ReactNative
open ReactNative.Style
type button = {
  icon: option<React.element>,
  label: string,
  color: string,
  onPress: unit => unit,
}

let buttonWidth = 80.

let styles = {
  "container": viewStyle(~flexGrow=1., ~flexShrink=1., ()),
  "button": viewStyle(
    ~flex=1.,
    ~alignItems=#center,
    ~justifyContent=#center,
    ~width=buttonWidth->dp,
    (),
  ),
  "swipeHandleContainer": viewStyle(~justifyContent=#center, ~alignItems=#center, ()),
}->StyleSheet.create

@react.component
let make = (
  ~id: string,
  ~buttons: array<button>,
  ~disabled: bool,
  // ~style: Style.t,
  // ~swipeableRef: React.ref<ReactNativeGestureHandler.Swipeable.ref>,
  ~children: React.element,
) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  let screenReaderEnabled = ReactNativeHooks.useScreenReaderEnabled()

  React.useEffect1(() => {
    if screenReaderEnabled {
      SwipeableRowEventEmitter.emitter->SwipeableRowEventEmitter.emit(#autoClose(None))
    }
    None
  }, [screenReaderEnabled])

  let (isOpen, isOpen_set) = React.useState(() => false)
  let openAnimatedValue = React.useRef(Animated.Value.create(0.)).current

  let swipeableRef = React.useRef(Js.Nullable.null)
  // let swipeableRef = swipeableRef->Option.getWithDefault(_swipeableRef)

  // @todo when we upgrade react native, see if this workaround is necessary
  let windowDim = Dimensions.useWindowDimensions()
  let widthRef = React.useRef(windowDim.width)
  let onLayout = React.useCallback0((event: Event.layoutEvent) => {
    let width = event.nativeEvent.layout.width
    if width !== 0. {
      widthRef.current = width
    }
  })

  let rightActions = ReactMore.useCallback22((_progress, dragX) => {
    buttons
    ->Array.mapWithIndex((index, button) => {
      open Animated.Interpolation
      let translateX = Style.translateX(
        ~translateX=dragX
        ->interpolate(
          config(
            ~inputRange=[-.buttonWidth *. buttons->Array.length->float, 0.],
            ~outputRange=[0., buttonWidth *. (index->float +. 1.)]->fromFloatArray,
            (),
          ),
        )
        ->Animated.StyleProp.float,
      )

      <TouchableOpacity
        key={button.label}
        accessible={true}
        accessibilityRole=#button
        onPress={_ => {
          SwipeableRowEventEmitter.emitter->SwipeableRowEventEmitter.emit(#autoClose(None))
          button.onPress()
        }}
        style={Style.viewStyle(~zIndex=buttons->Array.length - index, ())}>
        <Animated.View
          style={array([
            StyleSheet.absoluteFill,
            Style.viewStyle(
              ~backgroundColor=button.color,
              ~transform=[{translateX}],
              // width => cheating max level
              // we stretch the background color to the max possible width of the item
              ~width=widthRef.current->dp,
              (),
            ),
          ])}
        />
        <Animated.View
          style={array([styles["button"], Style.viewStyle(~transform=[{translateX}], ())])}>
          {button.icon->Option.getWithDefault(React.null)}
          <Text
            numberOfLines={1}
            style={array([
              Theme.text["subhead"],
              Theme.text["weight500"],
              theme.styles["textOnMain"],
            ])}>
            {button.label->React.string}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    })
    ->React.array
  }, (buttons, theme))

  React.useEffect3(() => {
    open Animated
    spring(
      openAnimatedValue,
      Value.Spring.config(
        ~useNativeDriver=true,
        ~toValue=(isOpen ? 0. : 1.)->Value.Spring.fromRawValue,
        (),
      ),
    )->Animation.start()

    None
    // adding screenReaderEnabled as a dep to force ... to be visible when screen readers are disabled
  }, (openAnimatedValue, isOpen, screenReaderEnabled))

  let cancel = React.useRef(None)
  React.useEffect3(() => {
    cancel.current = Some(
      SwipeableRowEventEmitter.emitter->SwipeableRowEventEmitter.addListener(
        #autoClose(
          idToKeep => {
            if isOpen && idToKeep->Option.getWithDefault("") !== id {
              swipeableRef.current
              ->Js.Nullable.toOption
              ->Option.map(swipeable => {
                swipeable->ReactNativeGestureHandler.Swipeable.close
              })
              ->ignore
              // we cancel removal immediately, otherwise, if auto-close is called more than once
              // this kills the animation & go directly to close, which is ugly
              // and auto-close being attached to onScroll, this is kind of mandatory to not call it again
              cancel.current->Option.map(c => c->SwipeableRowEventEmitter.remove)->ignore
            }
          },
        ),
      ),
    )
    Some(
      () => {
        cancel.current->Option.map(c => c->SwipeableRowEventEmitter.remove)->ignore
      },
    )
  }, (isOpen, id, cancel))

  let onSwipeStart = React.useCallback1(() => {
    SwipeableRowEventEmitter.emitter->SwipeableRowEventEmitter.emit(#autoClose(Some(id)))
  }, [id])
  let onSwipeableOpen = React.useCallback1(() => isOpen_set(_ => true), [isOpen_set])
  let onSwipeableClose = React.useCallback1(() => isOpen_set(_ => false), [isOpen_set])

  disabled
    ? <View style={styles["container"]}> {children} </View>
    : screenReaderEnabled
    ? <View
      accessible={true}
      accessibilityActions={buttons->Array.map(button =>
        Accessibility.actionInfo(~name=button.label, ~label=button.label, ())
      )}
      onAccessibilityAction={(event: Accessibility.actionEvent) => {
        buttons
        ->Array.keep(button => button.label === event.nativeEvent.actionName)
        ->Array.get(0)
        ->Option.map(button => {
          button.onPress()
        })
        ->ignore
      }}>
      <View style={styles["container"]}> {children} </View>
    </View>
    : <View onLayout={onLayout}>
        <ReactNativeGestureHandler.Swipeable
          ref={swipeableRef->Ref.value}
          renderRightActions={rightActions}
          // https://github.com/software-mansion/react-native-gesture-handler/pull/1102
          // this is to allow us to dimissed opened swipeable as soon as you start opening another
          onSwipeStart
          onSwipeableOpen
          onSwipeableClose>
          <View style={styles["container"]}> {children} </View>
        </ReactNativeGestureHandler.Swipeable>
      </View>
}
