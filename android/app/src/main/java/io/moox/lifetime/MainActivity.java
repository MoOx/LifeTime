package io.moox.lifetime;

import android.os.Bundle;
import android.os.Build;
import android.view.WindowManager;

import com.facebook.react.ReactActivity;

// react-native-gesture-handler
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

import com.zoontek.rnbootsplash.RNBootSplash;

import io.moox.rntransparentstatusandnavigationbar.RNTransparentStatusAndNavigationBar;
public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "LifeTime";
  }
  
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegate(this, getMainComponentName()) {
      @Override
      protected ReactRootView createRootView() {
       return new RNGestureHandlerEnabledRootView(MainActivity.this);
      }
    };
  }
  
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // react-native-screen recommend to not pass savedInstanceState to avoid crashes
    // https://github.com/software-mansion/react-native-screens#android
    // super.onCreate(savedInstanceState);
    super.onCreate(null);
    
    RNBootSplash.init(R.drawable.bootsplash, MainActivity.this);
    
    RNTransparentStatusAndNavigationBar.init(MainActivity.this);
  }
}
