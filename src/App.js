import 'react-native-gesture-handler';

import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn:
    'https://aa2bb6c101304c549ba4aa2006f31678@o109907.ingest.sentry.io/5348542',
});

/**
 * Do not modify this file - it is a proxy to your `App.re` file
 * located in the `src/` folder.
 */
export {app as default} from './App.bs.js';
