#!/usr/bin/env node

// Auto-deploy script for FirstMove to GitHub
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 FirstMove Auto-Deploy to GitHub');
console.log('===================================');

try {
  // Check if we're in a Replit environment
  const isReplit = process.env.REPL_ID !== undefined;
  
  if (isReplit) {
    console.log('📱 Detected Replit environment');
    console.log('🔄 Using Replit GitHub integration...');
    
    // In Replit, the easiest way is to use the Version Control panel
    console.log('');
    console.log('✅ To automatically sync with GitHub:');
    console.log('1. Click the "Version Control" tab (git icon) in the left sidebar');
    console.log('2. If not connected, click "Connect to GitHub"');
    console.log('3. Click "Push" to sync all files to your repository');
    console.log('');
    console.log('🎯 Once pushed, GitHub Actions will automatically:');
    console.log('   - Build your Android APK');
    console.log('   - Create Play Store AAB bundle');
    console.log('   - Make downloads available in Actions tab');
    
  } else {
    // Standard git operations for non-Replit environments
    console.log('📁 Preparing files for GitHub...');
    
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Deploy FirstMove Android app with Play Store configuration"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('✅ Code pushed to GitHub successfully!');
  }
  
  console.log('');
  console.log('🔗 Repository: https://github.com/mhpgh/FirstMove');
  console.log('📊 Check Actions tab for build status');
  
} catch (error) {
  console.error('❌ Deploy failed:', error.message);
  console.log('');
  console.log('💡 Manual alternative:');
  console.log('   Use Replit\'s Version Control panel to push changes');
}