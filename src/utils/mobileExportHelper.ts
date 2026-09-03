/**
 * Mobile Native Export & Build Helpers
 * Generates configuration files, native manifests, and build commands for Apple (iOS) and Android
 */

export interface MobileBuildFile {
  filename: string;
  language: string;
  description: string;
  content: string;
}

export const IOS_INFO_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleDisplayName</key>
	<string>FaceVital AI</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	
	<!-- Critical: iOS Camera Permissions for FaceVital rPPG Optical Scan -->
	<key>NSCameraUsageDescription</key>
	<string>FaceVital AI requires front camera access to perform contactless optical photoplethysmography (rPPG) vital sign scanning, pulse wave analysis, and heart rate monitoring.</string>
	
	<!-- Optional: Microphone for breathing rate resonance analysis if enabled -->
	<key>NSMicrophoneUsageDescription</key>
	<string>FaceVital AI may use the microphone to assist in acoustic breathing rate synchrony.</string>

	<!-- App Transport Security for local development and secure HTTPS -->
	<key>NSAppTransportSecurity</key>
	<dict>
		<key>NSAllowsArbitraryLoads</key>
		<false/>
	</dict>

	<key>UILaunchStoryboardName</key>
	<string>LaunchScreen</string>
	<key>UIMainStoryboardFile</key>
	<string>Main</string>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>armv7</string>
		<string>video-camera</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
	</array>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<true/>
</dict>
</plist>`;

export const ANDROID_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.facevital.health">

    <!-- Essential Hardware & Permissions for rPPG Optical Face Scanning -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- Declare Camera Hardware Feature Requirement -->
    <uses-feature
        android:name="android.hardware.camera"
        android:required="true" />
    <uses-feature
        android:name="android.hardware.camera.front"
        android:required="true" />
    <uses-feature
        android:name="android.hardware.camera.autofocus"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:screenOrientation="portrait"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>`;

export const CAPACITOR_CONFIG_SAMPLE = `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.facevital.health',
  appName: 'FaceVital AI',
  webDir: 'dist',
  bundledWebRuntime: false,
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

export default config;`;

export const README_MOBILE_GUIDE = `# FaceVital AI - Apple iOS & Google Android Compilation Guide

This project is fully wired with **Capacitor 8**, enabling you to build native **iOS (.ipa)** and **Android (.apk / .aab)** applications directly from this codebase.

---

## 🍎 Apple iOS Compilation (App Store & TestFlight)

### Prerequisites:
- macOS with **Xcode 15+** installed
- **CocoaPods** installed (\`sudo gem install cocoapods\`)
- Apple Developer Account (for device testing & App Store deployment)

### 3-Step Build Process:
\`\`\`bash
# 1. Build the high-performance web assets
npm run build

# 2. Add iOS native platform (one-time setup)
npx cap add ios

# 3. Sync web code and open in Xcode
npm run cap:build
npx cap open ios
\`\`\`

### Inside Xcode:
1. Select your target **App** in the project navigator.
2. In **Signing & Capabilities**, select your **Apple Team** and Signing Certificate.
3. Verify **Info.plist** includes \`NSCameraUsageDescription\` (already configured).
4. Select target device (Simulator or connected iPhone) and click **Run** (Cmd + R).
5. For App Store submission: Select **Product -> Archive** -> Distribute to App Store Connect / TestFlight.

---

## 🤖 Android Compilation (Google Play Store & APK)

### Prerequisites:
- **Android Studio** (Iguana, Jellyfish, or newer)
- **JDK 17 or 21**
- Android SDK 34 / 35

### 3-Step Build Process:
\`\`\`bash
# 1. Build web bundle
npm run build

# 2. Add Android native platform (one-time setup)
npx cap add android

# 3. Sync code and launch in Android Studio
npm run cap:build
npx cap open android
\`\`\`

### Inside Android Studio:
1. Wait for Gradle sync to complete.
2. Verify \`AndroidManifest.xml\` has \`CAMERA\` permissions enabled.
3. Test locally: Select an Android Emulator or USB Debugging device and click **Run** (Shift + F10).
4. Build APK / AAB: Go to **Build -> Generate Signed Bundle / APK** -> Choose **Android App Bundle (.aab)** for Google Play Store upload.

---

## 📲 Instant PWA Installation (Zero Compilation)
If you don't need native store listings, FaceVital can be installed right away:
- **iOS Safari**: Tap Share Icon -> **Add to Home Screen**.
- **Android Chrome**: Tap Menu (3 dots) -> **Install App**.
`;

export const MOBILE_FILES: MobileBuildFile[] = [
  {
    filename: 'capacitor.config.ts',
    language: 'typescript',
    description: 'Capacitor native bridge configuration for iOS & Android bundle IDs, splash screen, and status bar.',
    content: CAPACITOR_CONFIG_SAMPLE
  },
  {
    filename: 'Info.plist (iOS)',
    language: 'xml',
    description: 'Apple iOS application manifest containing required NSCameraUsageDescription permissions for optical rPPG.',
    content: IOS_INFO_PLIST
  },
  {
    filename: 'AndroidManifest.xml (Android)',
    language: 'xml',
    description: 'Android application manifest defining camera hardware features, orientation locks, and webview permissions.',
    content: ANDROID_MANIFEST
  },
  {
    filename: 'README-MOBILE-BUILD.md',
    language: 'markdown',
    description: 'Comprehensive step-by-step developer compilation handbook for Xcode and Android Studio.',
    content: README_MOBILE_GUIDE
  }
];

/**
 * Trigger browser download for text files
 */
export function downloadFile(filename: string, content: string, contentType: string = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
