#!/bin/bash

# Environment Usage Checker
# This script checks if client-side code is trying to access server-side environment variables

set -e

echo "🔍 Checking for server environment variable usage in client code..."

# Define directories to check (client-side code only)
CLIENT_DIRS=("frontend/components" "frontend/pages")

# Define server-side directories and files (API routes, etc.) - these are excluded from checks
SERVER_DIRS=("frontend/app/api")
SERVER_FILES=("frontend/src/env.server.ts" "frontend/lib/auth.ts" "frontend/lib/env.server.ts")

# Note: frontend/app directory contains both client and server code, so we exclude it entirely
# and only check specific client-side directories above

# Define server-side environment variable patterns (without NEXT_PUBLIC_)
SERVER_ENV_PATTERNS=(
    "process\.env\.DATABASE_URL"
    "process\.env\.JWT_SECRET"
    "process\.env\.RECAPTCHA_SECRET"
    "process\.env\.SMTP_"
    "process\.env\.STRIPE_"
    "process\.env\.SECRET"
    "process\.env\.KEY"
    "process\.env\.PASSWORD"
    "process\.env\.TOKEN"
    "process\.env\.NEXTAUTH_URL"
    "process\.env\.NEXTAUTH_SECRET"
)

# Check for server environment variable usage in client code
FOUND_VIOLATIONS=false

for dir in "${CLIENT_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "Checking directory: $dir"
        
        for pattern in "${SERVER_ENV_PATTERNS[@]}"; do
            # Search for server env usage, excluding server directories and NEXT_PUBLIC_ patterns
            violations=$(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec grep -l "$pattern" {} \; 2>/dev/null || true)
            
            if [ -n "$violations" ]; then
                echo "❌ Found server environment variable usage in client code:"
                echo "$violations"
                FOUND_VIOLATIONS=true
            fi
        done
    fi
done

# Additional check for any process.env usage that's not NEXT_PUBLIC_ or NODE_ENV
echo "Checking for non-NEXT_PUBLIC_ process.env usage..."
for dir in "${CLIENT_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        # Find all process.env usage that's not NEXT_PUBLIC_ or NODE_ENV
        while IFS= read -r -d '' file; do
            if [ -f "$file" ]; then
                # Check for process.env usage that's not NEXT_PUBLIC_ or NODE_ENV
                violations=$(grep -n "process\.env\." "$file" | grep -v "NEXT_PUBLIC_\|NODE_ENV" || true)
                if [ -n "$violations" ]; then
                    echo "❌ Found non-NEXT_PUBLIC_ environment variable usage in $file:"
                    echo "$violations"
                    FOUND_VIOLATIONS=true
                fi
            fi
        done < <(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -print0 2>/dev/null)
    fi
done

if [ "$FOUND_VIOLATIONS" = true ]; then
    echo "❌ Environment usage check failed!"
    echo "Client code should only access NEXT_PUBLIC_ environment variables."
    echo "Server-side environment variables must be accessed only in server-side code."
    exit 1
else
    echo "✅ Environment usage check passed!"
    echo "No server environment variables found in client code."
fi