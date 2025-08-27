#!/usr/bin/env node

/**
 * Environment Variable Usage Checker
 * 
 * This script scans for improper process.env usage in client components.
 * It ensures that only NEXT_PUBLIC_* variables are used in client code.
 * 
 * Usage: node scripts/check-env-usage.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

// Configuration
const CLIENT_DIRS = ['app', 'components'];
const SERVER_DIRS = ['app/api'];
const ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const NEXT_PUBLIC_PREFIX = 'NEXT_PUBLIC_';

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Helper functions
const log = (color, message) => console.log(`${color}${message}${colors.reset}`);
const logError = (message) => log(colors.red, `❌ ${message}`);
const logSuccess = (message) => log(colors.green, `✅ ${message}`);
const logWarning = (message) => log(colors.yellow, `⚠️  ${message}`);
const logInfo = (message) => log(colors.blue, `ℹ️  ${message}`);

// Check if a file is in a client directory
const isClientFile = (filePath) => {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return CLIENT_DIRS.some(dir => normalizedPath.includes(`/${dir}/`)) &&
         !SERVER_DIRS.some(dir => normalizedPath.includes(`/${dir}/`));
};

// Check if a file is in a server directory
const isServerFile = (filePath) => {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return SERVER_DIRS.some(dir => normalizedPath.includes(`/${dir}/`));
};

// Extract process.env usage from file content
const extractEnvUsage = (content, filePath) => {
  const envRegex = /process\.env\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
  const matches = [];
  let match;
  
  while ((match = envRegex.exec(content)) !== null) {
    const envVar = match[1];
    const line = content.substring(0, match.index).split('\n').length;
    
    matches.push({
      variable: envVar,
      line,
      isPublic: envVar.startsWith(NEXT_PUBLIC_PREFIX),
      fullMatch: match[0]
    });
  }
  
  return matches;
};

// Check for server-only imports in client files
const checkServerImports = (content, filePath) => {
  const serverImportRegex = /from\s+['"]@\/lib\/env\.server['"]/g;
  const matches = [];
  let match;
  
  while ((match = serverImportRegex.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length;
    matches.push({
      line,
      fullMatch: match[0]
    });
  }
  
  return matches;
};

// Recursively scan directory for files
const scanDirectory = (dir, baseDir = '') => {
  const files = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const relativePath = join(baseDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...scanDirectory(fullPath, relativePath));
      } else if (ALLOWED_EXTENSIONS.includes(extname(item))) {
        files.push(relativePath);
      }
    }
  } catch (error) {
    logWarning(`Could not scan directory ${dir}: ${error.message}`);
  }
  
  return files;
};

// Main checking function
const checkEnvironmentUsage = () => {
  logInfo('🔍 Checking environment variable usage...');
  
  let hasErrors = false;
  let hasWarnings = false;
  const errors = [];
  const warnings = [];
  
  // Determine the base directory (frontend or current)
  let baseDir = '.';
  try {
    if (statSync('frontend').isDirectory()) {
      baseDir = 'frontend';
    }
  } catch (error) {
    // We're already in the frontend directory
    baseDir = '.';
  }
  
  // Scan all relevant directories
  const allFiles = [];
  for (const dir of CLIENT_DIRS) {
    const fullPath = join(baseDir, dir);
    if (statSync(fullPath).isDirectory()) {
      allFiles.push(...scanDirectory(fullPath, dir));
    }
  }
  
  logInfo(`Found ${allFiles.length} files to check`);
  
  // Check each file
  for (const file of allFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      const envUsage = extractEnvUsage(content, file);
      const serverImports = checkServerImports(content, file);
      
      // Check for non-public environment variables in client files
      const nonPublicUsage = envUsage.filter(usage => !usage.isPublic && usage.variable !== 'NODE_ENV');
      if (nonPublicUsage.length > 0) {
        hasErrors = true;
        errors.push({
          file,
          type: 'non-public-env',
          details: nonPublicUsage
        });
      }
      
      // Check for server imports in client files (but allow in API routes)
      const isApiRoute = file.includes('/api/');
      if (serverImports.length > 0 && !isApiRoute) {
        hasErrors = true;
        errors.push({
          file,
          type: 'server-import',
          details: serverImports
        });
      }
      
      // Warn about public environment variables (should use env.client.ts)
      const publicUsage = envUsage.filter(usage => usage.isPublic);
      if (publicUsage.length > 0) {
        hasWarnings = true;
        warnings.push({
          file,
          type: 'public-env-direct',
          details: publicUsage
        });
      }
      
    } catch (error) {
      logWarning(`Could not read file ${file}: ${error.message}`);
    }
  }
  
  // Report results
  console.log('\n' + '='.repeat(60));
  
  if (errors.length > 0) {
    logError(`Found ${errors.length} critical issues:`);
    console.log();
    
    for (const error of errors) {
      logError(`File: ${error.file}`);
      
      if (error.type === 'non-public-env') {
        logError('  Non-public environment variables found:');
        for (const detail of error.details) {
          logError(`    Line ${detail.line}: ${detail.fullMatch}`);
        }
      } else if (error.type === 'server-import') {
        logError('  Server-only imports found:');
        for (const detail of error.details) {
          logError(`    Line ${detail.line}: ${detail.fullMatch}`);
        }
      }
      
      console.log();
    }
  }
  
  if (warnings.length > 0) {
    logWarning(`Found ${warnings.length} warnings:`);
    console.log();
    
    for (const warning of warnings) {
      logWarning(`File: ${warning.file}`);
      logWarning('  Direct usage of NEXT_PUBLIC_ variables (should use @/lib/env.client):');
      for (const detail of warning.details) {
        logWarning(`    Line ${detail.line}: ${detail.fullMatch}`);
      }
      console.log();
    }
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    logSuccess('No environment variable issues found!');
  }
  
  console.log('='.repeat(60));
  
  // Summary
  if (hasErrors) {
    logError('❌ Environment variable check failed');
    logInfo('Fix the errors above before proceeding');
    process.exit(1);
  } else if (hasWarnings) {
    logWarning('⚠️  Environment variable check passed with warnings');
    logInfo('Consider using @/lib/env.client for better type safety');
    process.exit(0);
  } else {
    logSuccess('✅ Environment variable check passed');
    process.exit(0);
  }
};

// Run the check
if (import.meta.url === `file://${process.argv[1]}`) {
  checkEnvironmentUsage();
}
