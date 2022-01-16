open ReactNative
open ReactNative.Style
open ReactNativeSvg

@react.component
let make = (~style=?) => {
  let today = Date.now()
  <View ?style>
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 76 76">
      <Polygon fill="#FFFFFF" points="58 18 18 18 18 58 58 58" />
      <Polygon fill="#EA4335" points="58 76 76 58 58 58" />
      <Polygon fill="#FBBC04" points="76 18 58 18 58 58 76 58" />
      <Polygon fill="#34A853" points="58 58 18 58 18 76 58 76" />
      <Path fill="#188038" d="M0,58 L0,70 C0,73.315 2.685,76 6,76 L18,76 L18,58 L0,58 Z" />
      <Path fill="#1967D2" d="M76,18 L76,6 C76,2.685 73.315,0 70,0 L58,0 L58,18 L76,18 Z" />
      <Path fill="#4285F4" d="M58,0 L6,0 C2.685,0 0,2.685 0,6 L0,58 L18,58 L18,18 L58,18 L58,0 Z" />
      //   <Path
      //     fill="#F44242"
      //     d="M26.205,49.03 C24.71,48.02 23.675,46.545 23.11,44.595 L26.58,43.165 C26.895,44.365 27.445,45.295 28.23,45.955 C29.01,46.615 29.96,46.94 31.07,46.94 C32.205,46.94 33.18,46.595 33.995,45.905 C34.81,45.215 35.22,44.335 35.22,43.27 C35.22,42.18 34.79,41.29 33.93,40.6 C33.07,39.91 31.99,39.565 30.7,39.565 L28.695,39.565 L28.695,36.13 L30.495,36.13 C31.605,36.13 32.54,35.83 33.3,35.23 C34.06,34.63 34.44,33.81 34.44,32.765 C34.44,31.835 34.1,31.095 33.42,30.54 C32.74,29.985 31.88,29.705 30.835,29.705 C29.815,29.705 29.005,29.975 28.405,30.52 C27.8053962,31.0664502 27.354603,31.7564046 27.095,32.525 L23.66,31.095 C24.115,29.805 24.95,28.665 26.175,27.68 C27.4,26.695 28.965,26.2 30.865,26.2 C32.27,26.2 33.535,26.47 34.655,27.015 C35.775,27.56 36.655,28.315 37.29,29.275 C37.925,30.24 38.24,31.32 38.24,32.52 C38.24,33.745 37.945,34.78 37.355,35.63 C36.765,36.48 36.04,37.13 35.18,37.585 L35.18,37.79 C36.2904654,38.247828 37.2550655,38.9998013 37.97,39.965 C38.695,40.94 39.06,42.105 39.06,43.465 C39.06,44.825 38.715,46.04 38.025,47.105 C37.335,48.17 36.38,49.01 35.17,49.62 C33.955,50.23 32.59,50.5400368 31.075,50.5400368 C29.32,50.545 27.7,50.04 26.205,49.03 L26.205,49.03 Z M47.52,31.81 L43.71,34.565 L41.805,31.675 L48.64,26.745 L51.26,26.745 L51.26,50 L47.52,50 L47.52,31.81 Z"
      //   />
      <ReactNativeSvg.Text
        fill="#4285F4"
        fontFamily="Roboto"
        fontSize={32.->dp}
        letterSpacing={-1.->dp}
        fontWeight=#_500
        x={50.->pct}
        y={54.->pct}
        alignmentBaseline=#middle
        textAnchor=#middle>
        {today->Date.dateString->React.string}
      </ReactNativeSvg.Text>
    </Svg>
  </View>
}
