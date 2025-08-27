#!/usr/bin/env node

/**
 * Environment Variable Bootstrap Script
 * 
 * This script automatically creates missing environment files from templates
 * and provides helpful guidance for setting up environment variables.
 */

const { existsSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (color, message) => 
  console.log(`${color}${message}${colors.reset}`);

const logSuccess = (message) => log(colors.green, `✅ ${message}`);
const logWarning = (message) => log(colors.yellow, `⚠️  ${message}`);
const logError = (message) => log(colors.red, `❌ ${message}`);
const logInfo = (message) => log(colors.blue, `ℹ️  ${message}`);
const logBold = (message) => log(colors.bold, message);

const envConfigs = [
  {
    file: 'frontend/.env.local',
    template: 'frontend/env.example',
    required: [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
      'RECAPTCHA_SECRET_KEY'
    ],
    description: 'Frontend environment variables'
  }
];

function checkEnvFile(config) {
  if (!existsSync(config.file)) {
    logWarning(`${config.description} file missing: ${config.file}`);
    
    if (existsSync(config.template)) {
      try {
        const template = readFileSync(config.template, 'utf8');
        writeFileSync(config.file, template);
        logSuccess(`Created ${config.file} from template`);
        logInfo(`📝 Open ${config.file} and fill in the required values`);
        logInfo(`🚀 For production/preview, set them in Vercel → Project → Settings → Environment Variables`);
        return false;
      } catch (error) {
        logError(`Failed to create ${config.file}: ${error}`);
        return false;
      }
    } else {
      logError(`Template file missing: ${config.template}`);
      return false;
    }
  }

  // Check if required variables are set
  const envContent = readFileSync(config.file, 'utf8');
  const missingVars = [];
  
  for (const requiredVar of config.required) {
    const regex = new RegExp(`^${requiredVar}=`, 'm');
    if (!regex.test(envContent)) {
      missingVars.push(requiredVar);
    }
  }

  if (missingVars.length > 0) {
    logWarning(`${config.description} missing required variables:`);
    missingVars.forEach(varName => {
      logWarning(`  - ${varName}`);
    });
    logInfo(`📝 Edit ${config.file} to add the missing variables`);
    return false;
  }

  logSuccess(`${config.description} properly configured`);
  return true;
}

function main() {
  console.log('\n' + '='.repeat(60));
  logBold('🔧 Environment Variable Bootstrap');
  console.log('='.repeat(60));

  let allConfigured = true;

  for (const config of envConfigs) {
    const isConfigured = checkEnvFile(config);
    if (!isConfigured) {
      allConfigured = false;
    }
    console.log('');
  }

  if (allConfigured) {
    logSuccess('All environment files are properly configured!');
    logInfo('You can now run: npm run dev');
  } else {
    console.log('\n' + '='.repeat(60));
    logBold('📋 Next Steps:');
    console.log('='.repeat(60));
    logInfo('1. Fill in the required environment variables in the .env.local files');
    logInfo('2. For production, set variables in Vercel Project Settings');
    logInfo('3. Run: npm run dev to start development');
    logInfo('4. Run: npm run build to test the build process');
    console.log('');
    logWarning('⚠️  Never commit .env.local files to version control');
    logInfo('   They are already in .gitignore for security');
  }

  console.log('');
}

// Run the script
main();

