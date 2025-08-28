#!/usr/bin/env node

/**
 * Database Setup Script for Vercel Deployment
 * 
 * This script helps set up the database for Vercel preview deployments.
 * Run this after setting up your database connection.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️  Setting up database for Vercel deployment...\n');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.log('\n📋 Please set up your database connection:');
  console.log('1. Go to your Vercel project dashboard');
  console.log('2. Navigate to Settings > Environment Variables');
  console.log('3. Add DATABASE_URL with your database connection string');
  console.log('\n💡 Recommended: Use Supabase (https://supabase.com) for easy setup');
  process.exit(1);
}

try {
  console.log('✅ DATABASE_URL is configured');
  
  // Generate Prisma client
  console.log('\n🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
  
  // Push schema to database
  console.log('\n📊 Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema updated');
  
  // Seed database if seed file exists
  const seedPath = path.join(__dirname, '..', 'prisma', 'seed.ts');
  if (fs.existsSync(seedPath)) {
    console.log('\n🌱 Seeding database...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('✅ Database seeded');
  }
  
  console.log('\n🎉 Database setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy your application to Vercel');
  console.log('2. Test the feedback form at /feedback');
  console.log('3. Check database connection at /api/health');
  
} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check your DATABASE_URL format');
  console.log('2. Ensure your database is accessible');
  console.log('3. Verify network connectivity');
  console.log('4. Check database credentials');
  process.exit(1);
}
