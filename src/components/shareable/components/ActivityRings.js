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
  abs,
  cond,
  max,
  multiply,
  set,
  sub,
  useCode,
  Value,
} from 'react-native-reanimated';
import {interpolateColor} from 'react-native-redash';
import {timing} from 'react-native-redash';

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
  size: number,
|}
*/

const HalfCircle = ({children, size} /*: HalfCircleProps*/) => {
  return (
    <View
      style={[
        styles.overflowHidden,
        {
          width: size,
          height: size / 2,
        },
      ]}>
      <View
        style={[
          styles.overflowHidden,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}>
        {children}
      </View>
    </View>
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
  const absTheta = abs(theta);
  const scaleX = cond(lessThan(theta, 0), -1, 1);
  const strokeWidthBy2 = strokeWidth / 2;
  const offset = PixelRatio.roundToNearestPixel(size / 2) - strokeWidthBy2;
  const rotateStartingPoint = max(0, sub(absTheta, _360deg));
  const circleStyle = [
    StyleSheet.absoluteFill,
    {
      width: strokeWidth,
      height: strokeWidth,
      borderRadius: strokeWidthBy2,
      top: offset,
    },
  ];
  const circleEndStyle = {
    transform: [
      {translateX: offset},
      {rotate: absTheta},
      {translateX: -offset},
    ],
  };
  const foreground = (
    <AngularGradient colors={[ring.startColor, ring.endColor]} size={size} />
  );
  const background = (
    <View style={[styles.flex, {backgroundColor: ring.backgroundColor}]} />
  );
  return (
    <Animated.View
      style={[
        styles.center,
        {
          transform: [{scaleX}, rotate90],
        },
      ]}>
      {/* circle */}
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [{rotate: rotateStartingPoint}],
        }}>
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
                  {rotate: absTheta},
                  {translateY: -size / 4},
                ],
                opacity: lessThan(absTheta, _180deg),
              },
            ]}>
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
                    rotate: interpolate(absTheta, {
                      inputRange: [_180deg, _360deg],
                      outputRange: [0, _180deg],
                      extrapolate: Extrapolate.CLAMP,
                    }),
                  },
                  {translateY: -size / 4},
                ],
              },
            ]}>
            <HalfCircle size={size}>{background}</HalfCircle>
          </Animated.View>
        </View>
      </Animated.View>
      {/* circle start point */}
      <Animated.View
        style={[
          circleStyle,
          {
            transform: [{rotate: rotateStartingPoint}],
            opacity: lessThan(absTheta, _360deg),
            backgroundColor: ring.startColor,
          },
        ]}
      />
      {/* circle end  point shadow */}
      <Animated.View style={[circleStyle, circleEndStyle]}>
        <Svg width={strokeWidth} height={strokeWidth}>
          <Defs>
            <RadialGradient
              cx="50%"
              cy="50%"
              fx="50%"
              fy="50%"
              r="50%"
              id="shadow">
              <Stop offset="0%" stopOpacity={0} stopColor="#000" />
              <Stop offset="50%" stopOpacity={0.15} stopColor="#000" />
              <Stop offset="100%" stopOpacity={0} stopColor="#000" />
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
      {/* circle end point*/}
      <Animated.View
        style={[
          circleStyle,
          circleEndStyle,
          {
            backgroundColor: interpolateColor(absTheta, {
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
            <Ring
              theta={multiply(ring.progress * _360deg, progress)}
              ring={ring}
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
