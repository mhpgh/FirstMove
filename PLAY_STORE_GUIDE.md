# FirstMove - Google Play Store Deployment Guide

## Overview
This guide walks you through publishing FirstMove to the Google Play Store using GitHub Actions for automated builds.

## Prerequisites
1. Google Play Console developer account ($25 one-time fee)
2. GitHub account (free)
3. This Replit project pushed to GitHub

## Step 1: Create GitHub Repository

1. **Export from Replit:**
   - Go to your Replit project
   - Click the three dots menu → "Export as zip"
   - Extract the files

2. **Create GitHub Repository:**
   - Go to github.com and create a new repository
   - Upload all project files
   - Ensure `.github/workflows/android-build.yml` is included

## Step 2: Generate Signing Key

You need a signing key to publish to Play Store. Run these commands locally or in any Linux environment:

```bash
# Generate keystore (replace YOUR_NAME with your actual name)
keytool -genkey -v -keystore release-key.keystore -alias firstmove-key -keyalg RSA -keysize 2048 -validity 10000

# Follow prompts and remember the passwords!
```

**Important:** Save the keystore file and remember all passwords - you'll need them forever.

## Step 3: Configure GitHub Secrets

In your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add these secrets:

```
KEYSTORE_BASE64: [base64 encoded keystore file]
KEYSTORE_PASSWORD: [your keystore password]
KEY_ALIAS: firstmove-key
KEY_PASSWORD: [your key password]
```

**To get KEYSTORE_BASE64:**
```bash
base64 -w 0 release-key.keystore
```
Copy the entire output as the secret value.

## Step 4: Build the App

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial release"
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - Build the web assets
   - Create debug APK (for testing)
   - Create release APK (signed)
   - Create AAB file (for Play Store)

3. **Download the AAB:**
   - Go to Actions tab in GitHub
   - Click the latest workflow run
   - Download "firstmove-release-aab"

## Step 5: Prepare for Play Store

### App Information Required:
- **App Name:** FirstMove
- **Package Name:** com.firstmove.app
- **Category:** Dating & Social
- **Content Rating:** Mature 17+ (dating app)
- **Target Audience:** Adults (18+)

### Required Assets:
Create these in any image editor:

1. **App Icon:** 512x512px PNG
2. **Feature Graphic:** 1024x500px PNG
3. **Screenshots:** 
   - Phone: 16:9 ratio (1080x1920px recommended)
   - Tablet: 3:4 ratio (1536x2048px recommended)
   - Need 2-8 screenshots

### Privacy Policy:
You need a privacy policy URL. Create one covering:
- Data collection (user accounts, mood data)
- Push notifications
- Database storage
- No data sharing with third parties

## Step 6: Play Console Setup

1. **Create App:**
   - Go to play.google.com/console
   - Create new app
   - Select "App" and enter details

2. **App Content:**
   - Fill out privacy policy URL
   - Complete content rating questionnaire
   - Set target audience to 18+
   - Add app category as "Dating"

3. **Store Listing:**
   - Upload app icon and feature graphic
   - Write app description:
     ```
     FirstMove helps couples enhance their intimate communication through intelligent mood matching. Set your mood and get notified when your partner is feeling the same way.

     Features:
     • Real-time mood matching
     • Push notifications
     • Private and secure
     • Simple, discreet interface
     ```

4. **Upload AAB:**
   - Go to Release → Production
   - Create new release
   - Upload the AAB file from GitHub Actions

## Step 7: Review and Publish

1. **Complete All Sections:**
   - Ensure all required fields are filled
   - Green checkmarks on all sections

2. **Submit for Review:**
   - Click "Review release"
   - Submit to Google Play

3. **Review Process:**
   - Takes 1-3 days typically
   - Google will review for policy compliance
   - You'll get an email with results

## Step 8: Post-Publication

### Update Process:
1. Make changes in Replit
2. Update version code in `android/app/build.gradle`
3. Push to GitHub
4. Download new AAB from Actions
5. Upload to Play Console as new release

### Monitoring:
- Check Play Console for crash reports
- Monitor user reviews and ratings
- Track installation statistics

## Troubleshooting

### Common Issues:
1. **Build Fails:** Check GitHub Actions logs
2. **Signing Errors:** Verify all secrets are set correctly
3. **Play Store Rejection:** Usually content policy issues

### Support Resources:
- Google Play Console Help Center
- Android Developer Documentation
- GitHub Actions documentation

## Cost Breakdown:
- Google Play Developer: $25 (one-time)
- GitHub: Free (for public repos)
- Hosting: Free (Replit deployment)
- App Store presence: Free after initial fee

Your app will be available worldwide on Google Play Store with automatic updates through the GitHub Actions pipeline.