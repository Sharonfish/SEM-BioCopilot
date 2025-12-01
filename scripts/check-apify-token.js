#!/usr/bin/env node

/**
 * Check if Apify API token is properly configured
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

console.log('🔍 Checking Apify API token configuration...\n');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env.local file not found!');
  console.log('\n📝 Create a .env.local file with:');
  console.log('NEXT_PUBLIC_APIFY_API_TOKEN=your_actual_token_here\n');
  process.exit(1);
}

// Read .env.local
const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

// Find NEXT_PUBLIC_APIFY_API_TOKEN
let tokenLine = null;
let tokenValue = null;

for (const line of lines) {
  if (line.trim().startsWith('NEXT_PUBLIC_APIFY_API_TOKEN=')) {
    tokenLine = line;
    tokenValue = line.split('=')[1].trim();
    break;
  }
}

if (!tokenLine) {
  console.error('❌ Error: NEXT_PUBLIC_APIFY_API_TOKEN not found in .env.local');
  console.log('\n📝 Add this line to .env.local:');
  console.log('NEXT_PUBLIC_APIFY_API_TOKEN=your_actual_token_here\n');
  process.exit(1);
}

// Check if token is placeholder
if (tokenValue === 'your_apify_token_here' ||
    tokenValue === 'your_token_here' ||
    tokenValue === 'YOUR_TOKEN_HERE' ||
    tokenValue.length < 20) {
  console.error('❌ Error: Apify token is still a placeholder!');
  console.log('\n📝 Steps to fix:');
  console.log('1. Go to: https://console.apify.com/account/integrations');
  console.log('2. Copy your API token (starts with "apify_api_")');
  console.log('3. Replace in .env.local:');
  console.log('   NEXT_PUBLIC_APIFY_API_TOKEN=apify_api_YourActualToken\n');
  console.log('Current value:', tokenValue);
  process.exit(1);
}

// Check if token looks valid
if (!tokenValue.startsWith('apify_api_')) {
  console.warn('⚠️  Warning: Token doesn\'t start with "apify_api_"');
  console.log('   Make sure you copied the correct token\n');
}

console.log('✅ Apify token is configured!');
console.log('   Token: ' + tokenValue.substring(0, 15) + '...' + tokenValue.slice(-5));
console.log('\n🧪 Testing API connection...\n');

// Test the API
const token = tokenValue;
const testUrl = `https://api.apify.com/v2/acts/scrapestorm~google-scholar-scraper-cheap-affordable-rental?token=${token}`;

fetch(testUrl)
  .then(res => {
    if (res.ok) {
      console.log('✅ API connection successful!');
      console.log('✅ Your Apify token is working correctly\n');
      console.log('🚀 You can now use the citation network search feature!');
      console.log('   Navigate to: http://localhost:3000/citation-network\n');
    } else {
      console.error('❌ API connection failed!');
      console.log('   Status:', res.status, res.statusText);
      console.log('   Please check your token is correct\n');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Network error:', err.message);
    console.log('   Check your internet connection\n');
    process.exit(1);
  });
