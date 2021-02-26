package io.moox.lifetime;

import android.os.Bundle;
import android.os.Build;
import android.view.WindowManager;

import com.facebook.react.ReactActivity;
import com.zoontek.rnbootsplash.RNBootSplash;

public class MainActivity extends ReactActivity {
  
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // react-native-screen recommend to not pass savedInstanceState to avoid crashes
    // https://github.com/software-mansion/react-native-screens#android
    // super.onCreate(savedInstanceState);
    super.onCreate(null);
    
    RNBootSplash.init(R.drawable.bootsplash, MainActivity.this);
    
    TransparentStatusAndNavigationBarModule.init(MainActivity.this);
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "LifeTime";
  }
}
