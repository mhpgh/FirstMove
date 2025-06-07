# FirstMove Android App

A React Native mobile app for couples to enhance intimate communication through intelligent mood matching.

## Features

- User authentication and registration
- Partner pairing with secure codes
- Real-time mood matching
- Push notifications for matches
- Connection tracking and privacy controls
- Clean, intuitive mobile interface

## Development Setup

1. Install dependencies:
```bash
cd mobile-app
npm install
```

2. Update API endpoint in `src/services/ApiService.ts`:
```typescript
const API_BASE_URL = 'https://your-actual-replit-url.replit.app';
```

3. Start development server:
```bash
npx expo start
```

## Building for Android

### Prerequisites

1. Install Expo CLI:
```bash
npm install -g @expo/cli
```

2. Create Expo account at https://expo.dev

3. Login to Expo:
```bash
expo login
```

### Build APK for Testing

```bash
expo build:android
```

### Build AAB for Play Store

```bash
expo build:android --type app-bundle
```

## Deployment to Google Play Store

### Step 1: Prepare App Assets

Create the following assets in the `assets` folder:

- `icon.png` (1024x1024) - App icon
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `splash.png` (1284x2778) - Splash screen
- `notification-icon.png` (96x96) - Notification icon

### Step 2: Configure App Details

Update `app.json` with your specific details:

```json
{
  "expo": {
    "name": "FirstMove",
    "slug": "firstmove-couples",
    "android": {
      "package": "com.yourcompany.firstmove",
      "versionCode": 1
    }
  }
}
```

### Step 3: Build Production APK/AAB

Using Expo Application Services (EAS):

```bash
npm install -g eas-cli
eas login
eas build --platform android
```

### Step 4: Google Play Console Setup

1. Go to https://play.google.com/console
2. Create new application
3. Fill out store listing:
   - App name: "FirstMove"
   - Short description: "Connect with your partner through mood matching"
   - Full description: Include features and benefits
   - Screenshots: Capture key screens from the app
   - Category: "Lifestyle" or "Social"
   - Content rating: Rate appropriately for adult content

### Step 5: Upload and Publish

1. Upload your AAB file to Google Play Console
2. Complete all required sections:
   - Store listing
   - Content rating
   - Target audience
   - Privacy policy
3. Submit for review

## Required Assets for Play Store

### Screenshots (required)
- Phone screenshots: 2-8 images, 16:9 or 9:16 aspect ratio
- 7-inch tablet screenshots: 2-8 images (optional)
- 10-inch tablet screenshots: 2-8 images (optional)

### App Icon
- 512x512 PNG
- High-resolution icon for Play Store

### Feature Graphic
- 1024x500 JPG or PNG
- Used in Play Store promotions

## Privacy Policy

You'll need a privacy policy URL. Key points to include:

- Data collection (user accounts, mood data)
- Data usage (matching partners, notifications)
- Data sharing (none with third parties)
- Data retention and deletion
- User rights and contact information

## Content Rating

Answer Google's content rating questionnaire covering:
- Violence and graphic content
- Sexual content and nudity
- Profanity
- Controlled substances
- Gambling and contests
- User-generated content

## Testing

Before submission:

1. Test all core functionality
2. Verify push notifications work
3. Test on different Android devices/versions
4. Check privacy controls
5. Verify account deletion works

## Post-Launch

1. Monitor crash reports in Play Console
2. Respond to user reviews
3. Plan updates and new features
4. Monitor user engagement metrics

## Support

For technical issues with the mobile app, check:
- Expo documentation: https://docs.expo.dev
- React Native documentation: https://reactnative.dev
- Google Play Console help: https://support.google.com/googleplay/android-developer