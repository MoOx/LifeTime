// @flow

import * as React from 'react';
import {PixelRatio, StyleSheet, View, Image, processColor} from 'react-native';
import Svg, {Circle, Defs, RadialGradient, Stop} from 'react-native-svg';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, {
  abs,
  block,
  Clock,
  clockRunning,
  color,
  cond,
  EasingNode,
  interpolateNode,
  lessThan,
  max,
  round,
  set,
  startClock,
  stopClock,
  sub,
  timing,
  useCode,
  Value,
} from 'react-native-reanimated';

const _180deg = Math.PI;
const _360deg = _180deg * 2;
const rotate90 = {rotate: '90deg'};
const rotate180 = {rotate: '180deg'};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  absolute: {
    position: 'absolute',
  },
  absoluteTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overflowHidden: {
    overflow: 'hidden',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  zIndex1: {
    zIndex: 1,
  },
});

/*::
type HalfCircleProps = {|
  children: React.Node,
  size: number,
|}
*/

const HalfCircle = ({children, size} /*: HalfCircleProps*/) => {
  return (
    <View style={[styles.overflowHidden, {width: size, height: size / 2}]}>
      <View
        style={[
          styles.overflowHidden,
          {width: size, height: size, borderRadius: size / 2},
        ]}
      >
        {children}
      </View>
    </View>
  );
};

export const opacity = (c /*: number*/) /*: number*/ => ((c >> 24) & 255) / 255;
export const red = (c /*: number*/) /*: number*/ => (c >> 16) & 255;
export const green = (c /*: number*/) /*: number*/ => (c >> 8) & 255;
export const blue = (c /*: number*/) /*: number*/ => c & 255;

const interpolateNodeColor = (
  animationValue /*: Animated.Adaptable<number>*/,
  config /*: {inputRange: Array<number>, outputRange : Array<string>}*/,
) => {
  const colors = config.outputRange.map(c => processColor(c));
  return color(
    round(
      interpolateNode(animationValue, {
        inputRange: config.inputRange,
        outputRange: colors.map(c => (typeof c === 'number' ? red(c) : 0)),
        extrapolate: 'clamp',
      }),
    ),
    round(
      interpolateNode(animationValue, {
        inputRange: config.inputRange,
        outputRange: colors.map(c => (typeof c === 'number' ? green(c) : 0)),
        extrapolate: 'clamp',
      }),
    ),
    round(
      interpolateNode(animationValue, {
        inputRange: config.inputRange,
        outputRange: colors.map(c => (typeof c === 'number' ? blue(c) : 0)),
        extrapolate: 'clamp',
      }),
    ),
    round(
      interpolateNode(animationValue, {
        inputRange: config.inputRange,
        outputRange: colors.map(c => (typeof c === 'number' ? opacity(c) : 0)),
        extrapolate: 'clamp',
      }),
    ),
  );
};

const runTiming = (clock, value, config) => {
  const state = {
    finished: new Value(0),
    position: value,
    time: new Value(0),
    frameTime: new Value(0),
  };

  return block([
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, value),
      set(state.frameTime, 0),
      startClock(clock),
    ]),
    timing(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ]);
};

/*::
type ring = {|
  backgroundColor: string,
  endColor: string,
  progress: number,
  startColor: string,
|};

type RingProps ={|
  animationDuration?: number,
  ring: ring,
  shadowSolidColor?: string,
  shadowSolidSize?: number,
  size: number,
  strokeWidth: number,
|}
*/
const Ring = (
  {
    strokeWidth,
    ring,
    size,
    shadowSolidSize = 1,
    shadowSolidColor = 'rgba(0,0,0,0.25)',
    animationDuration = 1500,
  } /*: RingProps*/,
) => {
  const clock = React.useRef(new Clock()).current;
  const progress = React.useRef(new Value(0));
  // const progress = {current: new Value(0)}; // dev help :)
  useCode(() => {
    return runTiming(clock, progress.current, {
      toValue: ring.progress * _360deg,
      duration: animationDuration,
      easing,
    });
  }, [ring.progress]);
  const absoluteProgress = abs(progress.current);
  const scaleX = cond(lessThan(progress.current, 0), -1, 1);
  const rotateStartingPoint = max(0, sub(absoluteProgress, _360deg));

  const offset = PixelRatio.roundToNearestPixel(size / 2) - strokeWidth / 2;
  const circleStyle = {
    width: strokeWidth,
    height: strokeWidth,
    borderRadius: strokeWidth / 2,
    position: 'absolute',
    top: offset,
    left: 0,
  };
  const circleEndStyle = {
    transform: [
      {translateX: offset},
      {rotate: absoluteProgress},
      {translateX: -offset},
    ],
  };
  const borderRadius = size / 2;
  const foreground = (
    <View
      style={{
        borderRadius,
        width: size,
        height: size,
        backgroundColor: ring.startColor,
      }}
    >
      <MaskedView
        style={styles.flex}
        maskElement={
          <Image
            style={[
              styles.transparent,
              {width: size, height: size, borderRadius},
            ]}
            source={require('./ActivityRings.mask.png')}
          />
        }
      >
        <View
          style={[styles.flex, {backgroundColor: ring.endColor, borderRadius}]}
        />
      </MaskedView>
    </View>
  );
  const background = (
    <View style={[styles.flex, {backgroundColor: ring.backgroundColor}]} />
  );
  const shadowWidth = size - strokeWidth * 2;
  return (
    <Animated.View
      style={[
        styles.center,
        {borderRadius: size / 2, transform: [{scaleX}, rotate90]},
        styles.overflowHidden,
      ]}
    >
      {/* circle */}
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [{rotate: rotateStartingPoint}],
        }}
      >
        <View style={styles.zIndex1}>
          <HalfCircle size={size}>
            <View style={{transform: [rotate180]}}>{foreground}</View>
          </HalfCircle>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [
                  {translateY: size / 4},
                  {rotate: absoluteProgress},
                  {translateY: -size / 4},
                ],
                opacity: lessThan(absoluteProgress, _180deg),
              },
            ]}
          >
            <HalfCircle size={size}>{background}</HalfCircle>
          </Animated.View>
        </View>
        <View style={{transform: [rotate180]}}>
          <HalfCircle size={size}>{foreground}</HalfCircle>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [
                  {translateY: size / 4},
                  {
                    rotate: interpolateNode(absoluteProgress, {
                      inputRange: [_180deg, _360deg],
                      outputRange: [0, _180deg],
                      extrapolate: 'clamp',
                    }),
                  },
                  {translateY: -size / 4},
                ],
              },
            ]}
          >
            <HalfCircle size={size}>{background}</HalfCircle>
          </Animated.View>
        </View>
      </Animated.View>
      {/* circle start point, visible on start */}
      <Animated.View
        style={[
          circleStyle,
          {
            transform: [{rotate: rotateStartingPoint}],
            backgroundColor: ring.startColor,
            // make it invisible as soon as progress to one full circle
            opacity: lessThan(absoluteProgress, _360deg),
          },
        ]}
      />
      {/* circle end point shadow that create the impression of depth */}
      <Animated.View
        style={[
          circleStyle,
          circleEndStyle,
          {
            // for the first circle, we don't need the same shadow
            // so we start the shadow only when the stroke is going to overlap the start
            opacity: interpolateNode(absoluteProgress, {
              inputRange: [0, _360deg * 0.8, _360deg],
              outputRange: [0.5, 0.5, 1],
            }),
          },
        ]}
      >
        <View
          style={[
            styles.overflowHidden,
            styles.absolute,
            {
              top: strokeWidth / 2 - shadowWidth / 2,
              left: strokeWidth / 2 - shadowWidth / 2,
              width: shadowWidth,
              height: shadowWidth / 2,
            },
          ]}
        >
          <Svg
            style={[StyleSheet.absoluteFill]}
            width={shadowWidth}
            height={shadowWidth}
          >
            <Defs>
              <RadialGradient
                cx="50%"
                cy="50%"
                fx="50%"
                fy="50%"
                r="50%"
                id="shadow"
              >
                <Stop offset="10%" stopOpacity={1} stopColor="#000" />
                <Stop offset="20%" stopOpacity={0.3} stopColor="#000" />
                <Stop offset="25%" stopOpacity={0.2} stopColor="#000" />
                <Stop offset="100%" stopOpacity={0} stopColor="#000" />
              </RadialGradient>
            </Defs>
            <Circle
              cx={shadowWidth / 2}
              cy={shadowWidth / 2}
              r={shadowWidth / 2}
              fill="url(#shadow)"
            />
          </Svg>
        </View>
        <View
          style={[
            styles.overflowHidden,
            styles.absolute,
            {
              top: -shadowSolidSize / 2,
              left: -shadowSolidSize / 2,
              width: strokeWidth + shadowSolidSize,
              height: strokeWidth / 2 + shadowSolidSize,
            },
          ]}
        >
          <View
            style={[
              styles.absoluteTopLeft,
              {
                width: strokeWidth + shadowSolidSize,
                height: strokeWidth + shadowSolidSize,
                borderRadius: strokeWidth + shadowSolidSize,
                backgroundColor: shadowSolidColor,
              },
            ]}
          />
        </View>
      </Animated.View>
      {/* circle end point, follow the progress entirely */}
      <Animated.View
        style={[
          circleStyle,
          circleEndStyle,
          {
            backgroundColor: interpolateNodeColor(absoluteProgress, {
              inputRange: [0, _360deg],
              outputRange: [ring.startColor, ring.endColor],
            }),
          },
        ]}
      />
    </Animated.View>
  );
};

/*::
type ActivityRingsProps = {|
  animationDuration?: number,
  backgroundColor: string,
  children?: React.Node,
  rings: Array<ring>,
  shadowSolidColor?: string,
  shadowSolidSize?: number,
  spaceBetween: number,
  strokeWidth: number,
  width: number,
|};
*/

const easing = EasingNode.bezier(0.32, 0.12, -0.1, 1);

export default (
  {
    animationDuration,
    backgroundColor,
    children,
    rings,
    shadowSolidColor,
    shadowSolidSize,
    spaceBetween,
    strokeWidth,
    width,
  } /*: ActivityRingsProps*/,
) /*: React.Node */ => {
  return (
    <View style={[{width, height: width}]}>
      {rings.map((ring, i) => {
        const size = width - strokeWidth * i * 2 - spaceBetween * i;
        const foregroundRadius = size / 2 - strokeWidth;
        return (
          <View
            key={i}
            style={[
              StyleSheet.absoluteFill,
              {
                width: size,
                height: size,
                top: (width - size) / 2,
                left: (width - size) / 2,
              },
            ]}
          >
            <Ring
              animationDuration={animationDuration}
              ring={ring}
              shadowSolidColor={shadowSolidColor}
              shadowSolidSize={shadowSolidSize}
              size={size}
              strokeWidth={strokeWidth}
            />
            <View style={[StyleSheet.absoluteFill, styles.center]}>
              <View
                style={[
                  {
                    backgroundColor,
                    borderRadius: foregroundRadius,
                    width: foregroundRadius * 2,
                    height: foregroundRadius * 2,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
      {children}
    </View>
  );
};
