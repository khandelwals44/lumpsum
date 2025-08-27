#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates environment variables at build time
 * and provides helpful error messages for missing or invalid variables.
 */

const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (color, message) => 
  console.log(`${color}${message}${colors.reset}`);

const logSuccess = (message) => log(colors.green, `✅ ${message}`);
const logError = (message) => log(colors.red, `❌ ${message}`);
const logInfo = (message) => log(colors.blue, `ℹ️  ${message}`);

const requiredEnvVars = [
  {
    name: 'DATABASE_URL',
    required: true,
    scope: 'server-only',
    description: 'PostgreSQL database connection URL',
    format: 'postgresql://user:pass@host:port/db?sslmode=require'
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    scope: 'server-only',
    description: 'NextAuth secret key',
    format: '32+ character random string'
  },
  {
    name: 'NEXTAUTH_URL',
    required: true,
    scope: 'server-only',
    description: 'Application base URL',
    format: 'http://localhost:3000 (local) or https://yourdomain.com (prod)'
  },
  {
    name: 'GOOGLE_CLIENT_ID',
    required: true,
    scope: 'server-only',
    description: 'Google OAuth client ID',
    format: '123456789-xxx.apps.googleusercontent.com'
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    required: true,
    scope: 'server-only',
    description: 'Google OAuth client secret',
    format: 'GOCSPX-xxxxxxxxxxxxxxxx'
  },
  {
    name: 'RECAPTCHA_SECRET_KEY',
    required: true,
    scope: 'server-only',
    description: 'reCAPTCHA secret key',
    format: '6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  {
    name: 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
    required: true,
    scope: 'client-safe',
    description: 'reCAPTCHA site key',
    format: '6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  }
];

const optionalEnvVars = [
  {
    name: 'JWT_SECRET',
    required: false,
    scope: 'server-only',
    description: 'JWT secret key (optional, falls back to NEXTAUTH_SECRET)',
    format: '32+ character random string'
  },
  {
    name: 'API_BASE_URL',
    required: false,
    scope: 'server-only',
    description: 'Backend API URL',
    format: 'http://localhost:3001 (local) or https://api.yourdomain.com (prod)'
  },
  {
    name: 'NEXT_PUBLIC_API_BASE_URL',
    required: false,
    scope: 'client-safe',
    description: 'Public API URL',
    format: 'http://localhost:3001 (local) or https://api.yourdomain.com (prod)'
  },
  {
    name: 'NEXT_PUBLIC_GA_ID',
    required: false,
    scope: 'client-safe',
    description: 'Google Analytics ID',
    format: 'G-XXXXXXXXXX'
  },
  {
    name: 'NEXT_PUBLIC_APP_NAME',
    required: false,
    scope: 'client-safe',
    description: 'Application name',
    format: 'Lumpsum.in'
  },
  {
    name: 'NEXT_PUBLIC_APP_VERSION',
    required: false,
    scope: 'client-safe',
    description: 'Application version',
    format: '1.0.0'
  },
  {
    name: 'NEXT_PUBLIC_APP_ENV',
    required: false,
    scope: 'client-safe',
    description: 'Environment identifier',
    format: 'development, preview, production'
  },
  {
    name: 'NEXT_PUBLIC_DEBUG_SAFE',
    required: false,
    scope: 'client-safe',
    description: 'Enable secure debug logging',
    format: '1 to enable, 0 or unset to disable'
  },
  {
    name: 'DEBUG_SAFE',
    required: false,
    scope: 'server-only',
    description: 'Enable secure debug logging',
    format: '1 to enable, 0 or unset to disable'
  },
  {
    name: 'PORT',
    required: false,
    scope: 'server-only',
    description: 'Server port',
    format: 'Port number (e.g., 3001)'
  },
  {
    name: 'NODE_ENV',
    required: false,
    scope: 'server-only',
    description: 'Node environment',
    format: 'development, production, test'
  }
];

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const content = readFileSync(filePath, 'utf8');
  const env = {};

  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    }
  });

  return env;
}

function validateEnvVars() {
  console.log('\n' + '='.repeat(60));
  logInfo('🔍 Validating Environment Variables');
  console.log('='.repeat(60));

  // Load environment files
  const frontendEnv = loadEnvFile('frontend/.env.local');
  const backendEnv = loadEnvFile('backend/.env');
  const rootEnv = loadEnvFile('.env');

  // Merge all environment variables
  const allEnv = { ...rootEnv, ...backendEnv, ...frontendEnv };

  let hasErrors = false;
  const missingRequired = [];
  const missingOptional = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!allEnv[envVar.name] || allEnv[envVar.name].trim() === '') {
      missingRequired.push(envVar);
      hasErrors = true;
    }
  }

  // Check optional variables (just for reporting)
  for (const envVar of optionalEnvVars) {
    if (!allEnv[envVar.name] || allEnv[envVar.name].trim() === '') {
      missingOptional.push(envVar);
    }
  }

  // Report results
  if (missingRequired.length > 0) {
    logError(`Missing ${missingRequired.length} required environment variables:`);
    console.log('');
    
    missingRequired.forEach(envVar => {
      logError(`${envVar.name} (${envVar.scope})`);
      logInfo(`   Description: ${envVar.description}`);
      logInfo(`   Format: ${envVar.format}`);
      
      if (envVar.scope === 'client-safe') {
        logInfo(`   Set in: frontend/.env.local (local) or Vercel Project Settings (prod/preview)`);
      } else {
        logInfo(`   Set in: backend/.env (local) or Vercel Project Settings (prod/preview)`);
      }
      console.log('');
    });

    console.log('='.repeat(60));
    logError('❌ Environment validation failed');
    logInfo('Fix the missing variables above before proceeding');
    console.log('');
    
    return false;
  }

  // Report optional variables
  if (missingOptional.length > 0) {
    logInfo(`⚠️  ${missingOptional.length} optional variables not set (this is OK):`);
    missingOptional.forEach(envVar => {
      logInfo(`   ${envVar.name} (${envVar.scope}) - ${envVar.description}`);
    });
    console.log('');
  }

  // Summary
  const presentRequired = requiredEnvVars.length - missingRequired.length;
  const presentOptional = optionalEnvVars.length - missingOptional.length;

  console.log('📊 Summary:');
  logSuccess(`   Required: ${presentRequired}/${requiredEnvVars.length} present`);
  logInfo(`   Optional: ${presentOptional}/${optionalEnvVars.length} present`);
  console.log('');

  logSuccess('✅ All required environment variables are present!');
  return true;
}

// Run validation
const isValid = validateEnvVars();
process.exit(isValid ? 0 : 1);

