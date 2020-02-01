// @flow

import * as React from 'react';
import {PixelRatio, StyleSheet, View, Image} from 'react-native';
import Svg, {Circle, Defs, RadialGradient, Stop} from 'react-native-svg';
import MaskedView from '@react-native-community/masked-view';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  lessThan,
  max,
  min,
  multiply,
  set,
  sub,
  useCode,
  Value,
} from 'react-native-reanimated';
import {interpolateColor} from 'react-native-redash';
import {timing, transformOrigin} from 'react-native-redash';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rings: {
    transform: [{rotate: '-270deg'}],
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
type AngularGradient2Props = {|
  size: number,
  colors: [string, string],
|}
*/
const AngularGradient = (
  {size, colors: [start, end]} /*: AngularGradient2Props*/,
) => {
  let borderRadius = size / 2;
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: start,
        borderRadius,
      }}>
      <MaskedView
        style={styles.flex}
        maskElement={
          <Image
            style={[
              styles.transparent,
              {
                width: size,
                height: size,
                borderRadius,
              },
            ]}
            source={require('./ActivityRings.mask.png')}
          />
        }>
        <View
          style={[
            styles.flex,
            {
              backgroundColor: end,
              borderRadius,
            },
          ]}
        />
      </MaskedView>
    </View>
  );
};

/*::
type HalfCircleProps = {|
  children: React.Node,
  radius: number,
|}
*/

const HalfCircle = ({children, radius} /*: HalfCircleProps*/) => {
  return (
    <View
      style={[
        styles.overflowHidden,
        {
          width: radius * 2,
          height: radius,
        },
      ]}>
      <View
        style={[
          styles.overflowHidden,
          {
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
          },
        ]}>
        {children}
      </View>
    </View>
  );
};

/*::
type CircularProgressProps = {|
  style: any,
  theta: Animated.Node<number>,
  background: React.Node,
  foreground: React.Node,
  radius: number,
|};
*/
const CircularProgress = (
  {style, theta, background, foreground, radius} /*: CircularProgressProps*/,
) => {
  const opacity = lessThan(theta, Math.PI);
  const rotate = interpolate(theta, {
    inputRange: [Math.PI, 2 * Math.PI],
    outputRange: [0, Math.PI],
    extrapolate: Extrapolate.CLAMP,
  });
  return (
    <Animated.View style={style}>
      <View style={styles.zIndex1}>
        <HalfCircle radius={radius}>
          <View style={{transform: [{rotate: '180deg'}]}}>{foreground}</View>
        </HalfCircle>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: transformOrigin(
                {x: 0, y: radius / 2},
                {rotate: theta},
              ),
              opacity,
            },
          ]}>
          <HalfCircle radius={radius}>{background}</HalfCircle>
        </Animated.View>
      </View>
      <View style={{transform: [{rotate: '180deg'}]}}>
        <HalfCircle radius={radius}>{foreground}</HalfCircle>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: transformOrigin({x: 0, y: radius / 2}, {rotate}),
            },
          ]}>
          <HalfCircle radius={radius}>{background}</HalfCircle>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

/*::
type ring = {|
  startColor: string,
  endColor: string,
  backgroundColor: string,
  progress: number,
|};

type RingProps ={|
  size: number,
  strokeWidth: number,
  ring: ring,
  theta: Animated.Node<number>,
|}
*/
const Ring = ({strokeWidth, ring, size, theta} /*: RingProps*/) => {
  const strokeWidthBy2 = strokeWidth / 2;
  const radius = PixelRatio.roundToNearestPixel(size / 2);
  const rotate = max(0, sub(theta, Math.PI * 2));
  const opacity = lessThan(theta, Math.PI * 2);
  const backgroundColor = interpolateColor(theta, {
    inputRange: [0, Math.PI * 2],
    outputRange: [ring.startColor, ring.endColor],
  });
  return (
    <View>
      <CircularProgress
        style={{transform: [{rotate}]}}
        theta={min(theta, Math.PI * 2)}
        foreground={
          <AngularGradient
            colors={[ring.startColor, ring.endColor]}
            size={size}
          />
        }
        background={
          <View
            style={[styles.flex, {backgroundColor: ring.backgroundColor}]}
          />
        }
        radius={radius}
      />
      <Animated.View
        style={[
          {transform: [{rotate}]},
          StyleSheet.absoluteFill,
          {
            width: strokeWidth,
            height: strokeWidth,
            borderRadius: strokeWidthBy2,
            opacity,
            backgroundColor: ring.startColor,
            top: radius - strokeWidthBy2,
          },
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            width: strokeWidth,
            height: strokeWidth,
            borderRadius: strokeWidthBy2,
            top: radius - strokeWidthBy2,
            transform: [
              {translateX: radius - strokeWidthBy2},
              {rotate: theta},
              {translateX: -(radius - strokeWidthBy2)},
              {translateY: -4},
            ],
          },
        ]}>
        <Svg width={strokeWidth} height={strokeWidth}>
          <Defs>
            <RadialGradient
              cx="50%"
              cy="50%"
              fx="50%"
              fy="50%"
              r="50%"
              id="shadow">
              <Stop offset="0%" stopOpacity={0} />
              <Stop offset="50%" stopOpacity={0.15} stopColor="black" />
              <Stop stopColor="black" stopOpacity={0} offset="100%" />
            </RadialGradient>
          </Defs>
          <Circle
            cx={strokeWidth / 2}
            cy={strokeWidth / 2}
            r={strokeWidth / 2}
            fill="url(#shadow)"
          />
        </Svg>
      </Animated.View>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            width: strokeWidth,
            height: strokeWidth,
            borderRadius: strokeWidthBy2,
            backgroundColor,
            top: radius - strokeWidthBy2,
            transform: [
              {translateX: radius - strokeWidthBy2},
              {rotate: theta},
              {translateX: -(radius - strokeWidthBy2)},
            ],
          },
        ]}
      />
    </View>
  );
};

/*::
type ActivityRingsProps = {|
  rings: Array<ring>,
  width: number,
  strokeWidth: number,
  backgroundColor: string,
  spaceBetween: number,
  children?: React.Node,
|};
*/

const easing = Easing.bezier(0.32, 0.12, -0.1, 1);

export default (
  {
    rings,
    width,
    strokeWidth,
    backgroundColor,
    spaceBetween,
    children,
  } /*: ActivityRingsProps*/,
) => {
  const progress = new Value(0);
  useCode(
    () =>
      set(
        progress,
        timing({
          duration: 1500,
          easing,
        }),
      ),
    [progress],
  );
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
            ]}>
            <View
              style={[StyleSheet.absoluteFill, styles.rings, styles.center]}>
              <Ring
                theta={multiply(ring.progress * Math.PI * 2, progress)}
                ring={ring}
                size={size}
                strokeWidth={strokeWidth}
              />
            </View>
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
