#!/usr/bin/env ts-node

import { existsSync, copyFileSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const FRONTEND_DIR = join(__dirname, "..", "frontend");
const ENV_LOCAL_PATH = join(FRONTEND_DIR, ".env.local");
const ENV_EXAMPLE_PATH = join(FRONTEND_DIR, "env.local.example");

function bootstrapEnv(): void {
  // Check if .env.local already exists
  if (existsSync(ENV_LOCAL_PATH)) {
    console.log("✅ frontend/.env.local already exists");
    return;
  }

  // Check if example file exists
  if (!existsSync(ENV_EXAMPLE_PATH)) {
    console.log("⚠️  frontend/env.local.example not found, creating basic template...");
    createBasicExample();
  }

  // Copy example to .env.local
  try {
    copyFileSync(ENV_EXAMPLE_PATH, ENV_LOCAL_PATH);
    console.log("✅ Created frontend/.env.local from template");
    
    // Show checklist
    showChecklist();
  } catch (error) {
    console.error("❌ Failed to create frontend/.env.local:", error);
    // Don't exit with error code - this should not fail CI
  }
}

function createBasicExample(): void {
  const basicTemplate = `# Copy this file to frontend/.env.local and fill in your values
# Never commit real values to version control!

# reCAPTCHA (optional for local development)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-min-10-chars

# OAuth providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=

# reCAPTCHA server key (optional)
RECAPTCHA_SECRET_KEY=

# Database (required)
DATABASE_URL=file:./dev.db

# App configuration (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_GA_ID=
`;

  writeFileSync(ENV_EXAMPLE_PATH, basicTemplate);
  console.log("✅ Created frontend/env.local.example");
}

function showChecklist(): void {
  console.log(`
📋 Environment Setup Checklist:

🔧 Required for basic functionality:
  □ DATABASE_URL (set to "file:./dev.db" for local SQLite)
  □ NEXTAUTH_SECRET (generate a random string, min 10 chars)

🔧 Optional but recommended:
  □ NEXTAUTH_URL (set to "http://localhost:3000" for local dev)
  □ NEXT_PUBLIC_APP_URL (set to "http://localhost:3000" for local dev)

🔐 OAuth providers (optional):
  □ GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
  □ GITHUB_ID & GITHUB_SECRET

🛡️ reCAPTCHA (optional for local dev):
  □ NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  □ RECAPTCHA_SECRET_KEY

📊 Analytics (optional):
  □ NEXT_PUBLIC_GA_ID

💡 Quick start:
  1. Edit frontend/.env.local
  2. Set DATABASE_URL="file:./dev.db"
  3. Generate a random NEXTAUTH_SECRET
  4. Restart your dev server

🚀 Your app will work with just the required fields!
`);
}

// Run bootstrap
bootstrapEnv();