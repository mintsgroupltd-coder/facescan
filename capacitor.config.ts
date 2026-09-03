import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.facevital.health',
  appName: 'FaceVital AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#050505',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#050505'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    preferredContentMode: 'mobile'
  }
};

export default config;
