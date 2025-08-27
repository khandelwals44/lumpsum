#!/usr/bin/env node

/**
 * Environment Variable Verification Script
 * 
 * This script verifies that all required environment variables are set
 * without exposing their actual values for security.
 */

const requiredEnvVars = {
  // Server-only variables (required)
  DATABASE_URL: {
    required: true,
    scope: 'server-only',
    description: 'PostgreSQL database connection URL',
    format: 'postgresql://user:pass@host:port/db?sslmode=require'
  },
  NEXTAUTH_SECRET: {
    required: true,
    scope: 'server-only',
    description: 'NextAuth secret key',
    format: '32+ character random string'
  },
  NEXTAUTH_URL: {
    required: true,
    scope: 'server-only',
    description: 'Application base URL',
    format: 'http://localhost:3000 (local) or https://yourdomain.com (prod)'
  },
  GOOGLE_CLIENT_ID: {
    required: true,
    scope: 'server-only',
    description: 'Google OAuth client ID',
    format: '123456789-xxx.apps.googleusercontent.com'
  },
  GOOGLE_CLIENT_SECRET: {
    required: true,
    scope: 'server-only',
    description: 'Google OAuth client secret',
    format: 'GOCSPX-xxxxxxxxxxxxxxxx'
  },
  RECAPTCHA_SECRET_KEY: {
    required: true,
    scope: 'server-only',
    description: 'reCAPTCHA secret key',
    format: '6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: {
    required: true,
    scope: 'client-safe',
    description: 'reCAPTCHA site key',
    format: '6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  
  // Optional variables
  JWT_SECRET: {
    required: false,
    scope: 'server-only',
    description: 'JWT secret key (optional, falls back to NEXTAUTH_SECRET)',
    format: '32+ character random string'
  },
  API_BASE_URL: {
    required: false,
    scope: 'server-only',
    description: 'Backend API URL',
    format: 'http://localhost:3001 (local) or https://api.yourdomain.com (prod)'
  },
  NEXT_PUBLIC_API_BASE_URL: {
    required: false,
    scope: 'client-safe',
    description: 'Public API URL',
    format: 'http://localhost:3001 (local) or https://api.yourdomain.com (prod)'
  },
  NEXT_PUBLIC_GA_ID: {
    required: false,
    scope: 'client-safe',
    description: 'Google Analytics ID',
    format: 'G-XXXXXXXXXX'
  },
  NEXT_PUBLIC_APP_NAME: {
    required: false,
    scope: 'client-safe',
    description: 'Application name',
    format: 'Lumpsum.in'
  },
  NEXT_PUBLIC_APP_VERSION: {
    required: false,
    scope: 'client-safe',
    description: 'Application version',
    format: '1.0.0'
  },
  NEXT_PUBLIC_APP_ENV: {
    required: false,
    scope: 'client-safe',
    description: 'Environment identifier',
    format: 'development, preview, production'
  },
  NEXT_PUBLIC_DEBUG_SAFE: {
    required: false,
    scope: 'client-safe',
    description: 'Enable secure debug logging',
    format: '1 to enable, 0 or unset to disable'
  },
  DEBUG_SAFE: {
    required: false,
    scope: 'server-only',
    description: 'Enable secure debug logging',
    format: '1 to enable, 0 or unset to disable'
  },
  PORT: {
    required: false,
    scope: 'server-only',
    description: 'Server port',
    format: 'Port number (e.g., 3001)'
  },
  NODE_ENV: {
    required: false,
    scope: 'server-only',
    description: 'Node environment',
    format: 'development, production, test'
  }
};

function maskValue(value) {
  if (!value) return 'null';
  const str = String(value);
  if (str.length <= 4) return '*'.repeat(str.length);
  return '*'.repeat(str.length - 4) + str.slice(-4);
}

function verifyEnvironmentVariables() {
  console.log('🔍 Verifying environment variables...\n');
  
  const results = {
    required: { present: [], missing: [] },
    optional: { present: [], missing: [] },
    errors: []
  };
  
  for (const [varName, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[varName];
    const isPresent = value && value.trim() !== '';
    
    if (config.required) {
      if (isPresent) {
        results.required.present.push({
          name: varName,
          maskedValue: maskValue(value),
          scope: config.scope,
          description: config.description
        });
      } else {
        results.required.missing.push({
          name: varName,
          scope: config.scope,
          description: config.description,
          format: config.format
        });
      }
    } else {
      if (isPresent) {
        results.optional.present.push({
          name: varName,
          maskedValue: maskValue(value),
          scope: config.scope,
          description: config.description
        });
      } else {
        results.optional.missing.push({
          name: varName,
          scope: config.scope,
          description: config.description,
          format: config.format
        });
      }
    }
  }
  
  // Display results
  console.log('📋 Required Environment Variables:');
  if (results.required.present.length > 0) {
    console.log('✅ Present:');
    results.required.present.forEach(({ name, maskedValue, scope, description }) => {
      console.log(`   ${name}=${maskedValue} (${scope}) - ${description}`);
    });
  }
  
  if (results.required.missing.length > 0) {
    console.log('❌ Missing:');
    results.required.missing.forEach(({ name, scope, description, format }) => {
      console.log(`   ${name} (${scope}) - ${description}`);
      console.log(`      Format: ${format}`);
    });
    results.errors.push(`Missing ${results.required.missing.length} required environment variables`);
  }
  
  console.log('\n📋 Optional Environment Variables:');
  if (results.optional.present.length > 0) {
    console.log('✅ Present:');
    results.optional.present.forEach(({ name, maskedValue, scope, description }) => {
      console.log(`   ${name}=${maskedValue} (${scope}) - ${description}`);
    });
  }
  
  if (results.optional.missing.length > 0) {
    console.log('⚠️  Not set (optional):');
    results.optional.missing.forEach(({ name, scope, description, format }) => {
      console.log(`   ${name} (${scope}) - ${description}`);
      console.log(`      Format: ${format}`);
    });
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Required: ${results.required.present.length}/${results.required.present.length + results.required.missing.length} present`);
  console.log(`   Optional: ${results.optional.present.length}/${results.optional.present.length + results.optional.missing.length} present`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
    console.log('\n💡 To fix missing variables:');
    console.log('   1. Copy env.example to .env.local');
    console.log('   2. Fill in the required values');
    console.log('   3. For production, set variables in Vercel dashboard');
    process.exit(1);
  } else {
    console.log('\n✅ All required environment variables are present!');
    process.exit(0);
  }
}

// Run verification
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyEnvironmentVariables();
}

