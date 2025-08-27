#!/usr/bin/env node

/**
 * Prisma Generate Script
 * Ensures Prisma generate runs from the correct directory with explicit schema path
 */

const { execSync } = require('child_process');
const { join } = require('path');

// Ensure we're in the frontend directory
const frontendDir = __dirname.replace('/scripts', '');
process.chdir(frontendDir);

console.log('🔧 Running Prisma generate from frontend directory...');
console.log(`📁 Working directory: ${process.cwd()}`);
console.log(`📄 Schema path: ./prisma/schema.prisma`);

try {
  execSync('npx prisma generate --schema ./prisma/schema.prisma', {
    stdio: 'inherit',
    cwd: frontendDir
  });
  console.log('✅ Prisma generate completed successfully');
} catch (error) {
  console.error('❌ Prisma generate failed:', error.message);
  process.exit(1);
}
