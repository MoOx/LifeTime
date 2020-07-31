/**
 * @format
 */

import 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

if (!__DEV__) {
  const dsn =
    'https://aa2bb6c101304c549ba4aa2006f31678@o109907.ingest.sentry.io/5348542';
  Sentry.init({
    dsn,
    enableAutoSessionTracking: true,
  });
}

try {
  AppRegistry.registerComponent(appName, () => App);
} catch (err) {
  Sentry.captureException(err);
}
