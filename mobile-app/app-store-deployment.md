# FirstMove Android App - Complete Deployment Guide

## Quick Start for Play Store Deployment

### 1. Prerequisites Setup

Install required tools:
```bash
npm install -g @expo/cli eas-cli
```

Create accounts:
- Expo account: https://expo.dev
- Google Play Console: https://play.google.com/console ($25 one-time fee)

### 2. Configure Your App

Update `mobile-app/src/services/ApiService.ts` with your production backend URL when you deploy to a permanent domain.

### 3. Build Production App

```bash
cd mobile-app
npm install
eas login
eas build --platform android --profile production
```

This creates an AAB (Android App Bundle) file for Play Store submission.

### 4. Google Play Console Setup

#### Store Listing Requirements:
- **App name**: FirstMove
- **Short description**: "Private mood matching for couples"
- **Full description**: 
  "FirstMove helps couples connect intimately through private mood matching. Set your mood, get notified when your partner is feeling the same way, and strengthen your relationship through better communication. Features real-time notifications, privacy controls, and connection tracking."

#### Required Assets:
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG  
- Screenshots: 2-8 phone screenshots (16:9 ratio)

#### Content Rating:
- Target audience: Adults (18+)
- Content: May contain mature themes
- No violence, gambling, or inappropriate content

### 5. Privacy Policy

Create a privacy policy covering:
- Account data collection (usernames, preferences)
- Mood data usage (matching only, not shared)
- Push notification permissions
- Data deletion rights
- No third-party sharing

### 6. Release Process

1. Upload AAB to Play Console
2. Complete all store listing sections
3. Set pricing (free recommended)
4. Choose release track (internal testing first)
5. Submit for review (typically 1-3 days)

### 7. Post-Launch Monitoring

- Monitor crash reports in Play Console
- Respond to user reviews
- Track user engagement metrics
- Plan feature updates

## Alternative: Expo Application Services (EAS)

For easier deployment, use EAS Build which handles signing and building automatically:

```bash
eas build --platform android
eas submit --platform android
```

## Cost Breakdown

- Google Play Console: $25 (one-time)
- Expo EAS (optional): Free tier available, $29/month for production features
- Domain/hosting: Your existing Replit deployment works

## Timeline

- App build: 10-30 minutes
- Play Store review: 1-3 days
- Total time to launch: 1-7 days

## Technical Requirements Met

Your FirstMove app already includes:
✓ User authentication
✓ Real-time notifications  
✓ Partner pairing system
✓ Mood matching functionality
✓ Privacy controls
✓ Data tracking options
✓ Responsive mobile design

## Next Steps

1. Test the mobile app with your current web backend
2. Create app store assets (icons, screenshots)
3. Write privacy policy
4. Build production APK/AAB
5. Submit to Google Play Store

The mobile app is now ready for deployment to the Android App Store.