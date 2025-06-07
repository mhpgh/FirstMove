#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Building FirstMove Android App...');

try {
  // Create dist directory if it doesn't exist
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Copy public files to dist for Capacitor
  console.log('📁 Preparing assets...');
  if (fs.existsSync('public')) {
    const publicFiles = fs.readdirSync('public');
    publicFiles.forEach(file => {
      fs.copyFileSync(path.join('public', file), path.join('dist', file));
    });
  }

  // Copy client files to dist
  if (fs.existsSync('client/index.html')) {
    fs.copyFileSync('client/index.html', 'dist/index.html');
  }

  // Create a simple index.html if it doesn't exist
  if (!fs.existsSync('dist/index.html')) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FirstMove</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 400px; margin: 0 auto; text-align: center; padding-top: 50px; }
        .logo { width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #FF6B9D, #4ECDC4); border-radius: 20px; }
        h1 { color: #FF6B9D; margin-bottom: 10px; }
        p { color: #666; margin-bottom: 30px; }
        .button { background: linear-gradient(135deg, #FF6B9D, #4ECDC4); color: white; border: none; padding: 15px 30px; border-radius: 25px; font-size: 16px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"></div>
        <h1>FirstMove</h1>
        <p>Enhance intimate communication between partners</p>
        <button class="button" onclick="window.location.href='https://6654dd72-2db1-449d-8c50-76996ae1b1d0-00-31bgwtp0zk1q0.riker.replit.dev/'">Open App</button>
    </div>
</body>
</html>`;
    fs.writeFileSync('dist/index.html', html);
  }

  // Sync with Capacitor
  console.log('🔄 Syncing with Capacitor...');
  execSync('npx cap sync android', { stdio: 'inherit' });

  console.log('✅ Android build preparation complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: npx cap open android');
  console.log('2. Build APK in Android Studio');
  console.log('3. Or run: ./build-android.sh');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}