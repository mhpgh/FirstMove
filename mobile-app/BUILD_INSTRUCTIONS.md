# Complete Android Build Instructions

## Step 1: EAS Login (Required)

You need to log in to Expo to build the app. Run this command:

```bash
cd mobile-app
eas login
```

Enter your Expo account credentials when prompted. If you don't have an Expo account, create one at https://expo.dev

## Step 2: Configure Build

```bash
eas build:configure
```

This will create the necessary configuration files for building.

## Step 3: Build Production APK for Play Store

```bash
eas build --platform android --profile production
```

This creates an Android App Bundle (.aab) file optimized for Google Play Store submission.

## Alternative: Build APK for Direct Testing

If you want an APK file for direct installation:

```bash
eas build --platform android --profile preview
```

## Expected Build Time

- Initial build: 15-30 minutes
- Subsequent builds: 5-15 minutes

## Build Output

After successful build, you'll receive:
- Download link for the .aab or .apk file
- QR code for easy download on mobile device
- Build details and logs in your Expo dashboard

## Next Steps After Build

1. Download the .aab file from the build completion link
2. Upload to Google Play Console
3. Complete store listing requirements
4. Submit for review

## Troubleshooting

If build fails:
- Check your app.json configuration
- Ensure all dependencies are compatible
- Review build logs in Expo dashboard
- Try rebuilding with `--clear-cache` flag

The app is configured and ready to build - you just need to authenticate with Expo first.