#!/usr/bin/env node

const { existsSync, copyFileSync, writeFileSync } = require("fs");
const { join } = require("path");

const FRONTEND_DIR = join(__dirname, "..", "frontend");
const ENV_LOCAL_PATH = join(FRONTEND_DIR, ".env.local");
const ENV_EXAMPLE_PATH = join(FRONTEND_DIR, "env.local.example");

function createBasicExample() {
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

function bootstrapEnv() {
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
    console.log("📋 Edit frontend/.env.local to configure your environment variables");
  } catch (error) {
    console.error("❌ Failed to create frontend/.env.local:", error);
    // Don't exit with error code - this should not fail CI
  }
}

// Run bootstrap
bootstrapEnv();
