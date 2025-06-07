# Upload FirstMove to GitHub

## Quick Upload Instructions

1. **Download this project:**
   - In Replit, click the three dots menu (⋮) next to "FirstMove"
   - Select "Download as zip"
   - Extract the zip file on your computer

2. **Upload to your GitHub repository:**
   - Go to https://github.com/mhpgh/FirstMove
   - Click "uploading an existing file" link
   - Drag ALL extracted files into the upload area
   - Important: Make sure these key files are included:
     - `.github/workflows/android-build.yml`
     - `android/` folder (entire directory)
     - `capacitor.config.ts`
     - `PLAY_STORE_GUIDE.md`
     - All other project files

3. **Commit the upload:**
   - Scroll down to "Commit changes"
   - Title: "Add FirstMove Android app with Play Store build"
   - Click "Commit changes"

4. **Verify the upload:**
   - Go to Actions tab in your repository
   - You should see "Build Android APK for Play Store" workflow starting
   - Wait 5-10 minutes for it to complete
   - Download the AAB file from workflow artifacts

## Alternative: Create New Repository

If upload fails:
1. Create a new repository named "firstmove-android"
2. Make it public (required for free GitHub Actions)
3. Upload all files there instead

The GitHub Actions workflow will automatically build your Play Store-ready AAB file once the code is uploaded.