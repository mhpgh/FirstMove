#!/bin/bash
# FirstMove Play Store Setup Script

echo "🚀 FirstMove Play Store Setup"
echo "================================"

# Check if we're in the right directory
if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ Run this script from the project root directory"
    exit 1
fi

# Build the app for production
echo "📱 Building production app..."
node capacitor-build.js

# Test Android build process
echo "🔧 Testing Android build..."
cd android

# Make gradlew executable
chmod +x gradlew

# Build debug APK to test the process
echo "🏗️ Building debug APK..."
./gradlew assembleDebug --no-daemon

if [ $? -eq 0 ]; then
    echo "✅ Debug APK built successfully!"
    echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
    
    # Copy to root for easy access
    cp app/build/outputs/apk/debug/app-debug.apk ../firstmove-debug.apk
    echo "📁 Copied to: firstmove-debug.apk"
    
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Test the debug APK on an Android device"
    echo "2. Push this project to GitHub"
    echo "3. Follow PLAY_STORE_GUIDE.md for complete setup"
    echo "4. Generate signing key and configure GitHub secrets"
    echo "5. GitHub Actions will build release APK and AAB automatically"
else
    echo "❌ Build failed. Check the error messages above."
    echo "💡 Common fixes:"
    echo "   - Ensure Android SDK is installed"
    echo "   - Check Java version (needs Java 17)"
    echo "   - Verify all dependencies are installed"
fi

cd ..