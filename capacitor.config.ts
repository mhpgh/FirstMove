import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.firstmove.app',
  appName: 'FirstMove',
  webDir: 'dist',
  server: {
    url: 'https://6654dd72-2db1-449d-8c50-76996ae1b1d0-00-31bgwtp0zk1q0.riker.replit.dev',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#FF6B9D",
      sound: "beep.wav"
    },
    App: {
      launchAutoHide: false
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FF6B9D",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    }
  }
};

export default config;
