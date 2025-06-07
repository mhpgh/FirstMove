#!/bin/bash
# Android Build Script for FirstMove
echo "Building FirstMove Android App..."

# Build the web assets for Capacitor
npm run build

# Copy built assets to the correct location for Capacitor
if [ -d "dist/public" ]; then
  mv dist/public/* dist/
  rmdir dist/public 2>/dev/null || true
fi

# Sync Capacitor
npx cap sync android

echo "Android build preparation complete!"
echo "To continue:"
echo "1. Run: npx cap open android"
echo "2. Build APK in Android Studio"

