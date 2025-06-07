#!/bin/bash
# Cloud-based Android Build for Chromebook
echo "🔨 Building FirstMove Android App for Chromebook..."

# Ensure we have the latest build
node capacitor-build.js

# Create APK build configuration
echo "📱 Preparing APK build..."

# Generate gradle wrapper if needed
if [ ! -f "android/gradlew" ]; then
    cd android
    gradle wrapper
    cd ..
fi

# Make gradlew executable
chmod +x android/gradlew

# Build the APK using Gradle
echo "🔧 Building APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ APK build successful!"
    echo "📦 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    
    # Copy APK to root for easy access
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
        cp app/build/outputs/apk/debug/app-debug.apk ../firstmove-debug.apk
        echo "📁 APK copied to: firstmove-debug.apk"
    fi
else
    echo "❌ APK build failed"
    echo "💡 You can also use GitHub Actions or other cloud build services"
fi

cd ..