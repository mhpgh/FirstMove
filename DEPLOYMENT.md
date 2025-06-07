# FirstMove Android Deployment Guide

## Chromebook-Friendly Build Options

### Option 1: Use Replit's GitHub Integration (Recommended)

1. **Connect to GitHub:**
   - Go to your Replit project settings
   - Connect this project to a GitHub repository
   - Push your code to GitHub

2. **Enable GitHub Actions:**
   - The `.github/workflows/android-build.yml` file is already configured
   - GitHub will automatically build APKs when you push code
   - Download the APK from the Actions tab

### Option 2: Online Build Services

#### Using AppCenter (Microsoft)
1. Sign up at appcenter.ms
2. Create a new Android project
3. Connect your GitHub repository
4. Configure build settings for Android/Gradle
5. Trigger builds automatically

#### Using Bitrise
1. Sign up at bitrise.io
2. Add your project from GitHub
3. Use the Android workflow template
4. Download APKs from build artifacts

### Option 3: Local Build on Replit (Limited)

1. **Run the build preparation:**
   ```bash
   node capacitor-build.js
   ```

2. **Generate development APK:**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

3. **Download APK:**
   - APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 4: Progressive Web App (Immediate)

The app is already configured as a PWA and can be installed directly:

1. **On Android Chrome:**
   - Visit: https://your-replit-url.replit.app
   - Tap "Add to Home Screen"
   - App works offline with push notifications

2. **Deploy PWA to Replit:**
   - Click "Deploy" button in Replit
   - Share the deployment URL with your partner

## Testing Push Notifications

### Web Browser Testing:
1. Open two browser windows (different profiles/incognito)
2. Register two users and pair them
3. Set moods on both accounts
4. Verify match notifications appear

### Mobile Testing:
1. Install the PWA on your phone
2. Test notifications when app is closed
3. Verify vibration and sound alerts work

## Production Deployment

### For Android Store:
1. Use GitHub Actions to build release APK
2. Sign APK with your keystore
3. Upload to Google Play Console

### For Web:
1. Deploy to Replit (free hosting)
2. Custom domain available with paid plans
3. SSL and CDN included automatically

## Troubleshooting

### Build Issues:
- Ensure all dependencies are installed: `npm ci`
- Check Android SDK version compatibility
- Verify Capacitor configuration is correct

### Notification Issues:
- Test browser permissions first
- Check service worker registration
- Verify WebSocket connections are working

### Database Issues:
- Confirm PostgreSQL connection string
- Run migrations: `npm run db:push`
- Check environment variables are set