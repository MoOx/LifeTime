package io.moox.lifetime;

import android.annotation.TargetApi;
import android.os.Build;
import android.graphics.Color;
import android.view.View;
import android.view.Window;
import android.app.Activity;
import android.view.WindowManager;
// requires targetSdkVersion 30
// import android.view.WindowInsetsController;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.common.logging.FLog;
import com.facebook.react.common.ReactConstants;

import java.util.HashMap;
import java.util.Map;

public class TransparentStatusAndNavigationBarModule extends ReactContextBaseJavaModule {
  TransparentStatusAndNavigationBarModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "TransparentStatusAndNavigationBarModule";
  }

  public static final String backgroundColorFallbackAlphaHex = "25";
  public static final int backgroundColorFallback = Color.parseColor("#"+backgroundColorFallbackAlphaHex+"000000");

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      constants.put("backgroundColorFallback", Color.TRANSPARENT);
    } else {
      constants.put("backgroundColorFallback", "#000000"+backgroundColorFallbackAlphaHex);
    }
    return constants;
  }

  static public void init(final Activity activity) {
    if (activity == null) {
      FLog.w(
        ReactConstants.TAG,
        "TransparentStatusAndNavigationBarModule: Ignored change, current activity is null."
      );
      return;
    }
    final Window window = activity.getWindow();
    activity.runOnUiThread(new Runnable() {
      @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
      @Override
      public void run() {
        // if this flags are here, code after this call will have no effect
        window.clearFlags(
          WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS |
          WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION
        );

        final View decorView = activity.getWindow().getDecorView();
        int flags = decorView.getSystemUiVisibility();
        flags |= View.SYSTEM_UI_FLAG_LAYOUT_STABLE;
        flags |= View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
        decorView.setSystemUiVisibility(flags);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
          window.setStatusBarContrastEnforced(false);
          window.setNavigationBarContrastEnforced(false);
        }

        // for M and above, we can set transparent color once for status bar once
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          window.setStatusBarColor(Color.TRANSPARENT);
        }
        // for M and above, we can set transparent color once for navigation bar once
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          window.setNavigationBarColor(Color.TRANSPARENT);
        }
        // for things that dont call this code, setBarsStyle will handle fallbacks
      }
    });
  }

  static public void _setBarsStyle(
    final Activity activity,
    @Nullable final String barsStyle
  ) {
    if (activity == null) {
      FLog.w(
        ReactConstants.TAG,
        "TransparentStatusAndNavigationBarModule: Ignored change, current activity is null."
      );
      return;
    }

    activity.runOnUiThread(new Runnable() {
      @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
      @Override
      public void run() {
        final Window window = activity.getWindow();
        final View decorView = window.getDecorView();
        int flags = decorView.getSystemUiVisibility();
        if ("dark-content".equals(barsStyle)) {
          // requires targetSdkVersion 30
          // if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          //   setSystemBarsAppearance(APPEARANCE_LIGHT_STATUS_BARS, APPEARANCE_LIGHT_STATUS_BARS);
          // } else
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
          } else {
            window.setStatusBarColor(backgroundColorFallback);
          }
          // requires targetSdkVersion 30
          // if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          //   setSystemBarsAppearance(APPEARANCE_LIGHT_NAVIGATION_BARS, APPEARANCE_LIGHT_NAVIGATION_BARS)
          // } else
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
          } else {
            window.setNavigationBarColor(backgroundColorFallback);
          }
        } else {
          // requires targetSdkVersion 30
          // if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          //   setSystemBarsAppearance(0, APPEARANCE_LIGHT_STATUS_BARS)
          // } else
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
          } else {
            window.setStatusBarColor(Color.TRANSPARENT);
          }
          // requires targetSdkVersion 30
          // if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          //   setSystemBarsAppearance(APPEARANCE_LIGHT_NAVIGATION_BARS, APPEARANCE_LIGHT_NAVIGATION_BARS)
          // } else
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
          } else {
            window.setNavigationBarColor(Color.TRANSPARENT);
          }
        }
        decorView.setSystemUiVisibility(flags);
      }
    });
  }
  
  @ReactMethod
  public void setBarsStyle(@Nullable final String barsStyle, Promise promise) {
    final Activity activity = getCurrentActivity();
    this._setBarsStyle(activity, barsStyle);
  }
}
