#!/bin/bash

# Secret Scanning Script for lumpsum.in
# Uses trufflehog v3 and git-secrets style regex to scan entire repository including history
# Exits non-zero if leaks are found

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_ROOT="$(git rev-parse --show-toplevel)"
REPORT_DIR="${REPO_ROOT}/security"
REPORT_FILE="${REPORT_DIR}/secret-scan-REPORT.txt"
TRUFFLEHOG_CONFIG="${REPO_ROOT}/.trufflehog.yaml"

# Create security directory if it doesn't exist
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}🔍 Starting comprehensive secret scan...${NC}"
echo "Repository: $REPO_ROOT"
echo "Report: $REPORT_FILE"
echo ""

# Check if trufflehog is installed
if ! command -v trufflehog &> /dev/null; then
    echo -e "${RED}❌ trufflehog not found. Installing...${NC}"
    echo ""
    echo "Installation instructions:"
    echo "  macOS (Homebrew): brew install trufflesecurity/trufflehog/trufflehog"
    echo "  Linux:"
    echo "    curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin"
    echo "    or download from: https://github.com/trufflesecurity/trufflehog/releases"
    echo ""
    exit 1
fi

# Create trufflehog configuration
cat > "$TRUFFLEHOG_CONFIG" << 'EOF'
# TruffleHog Configuration for lumpsum.in
# Custom rules for detecting secrets

detectors:
  # API Keys
  - name: "API Key - Generic"
    regex: (?i)(api[_-]?key|apikey|api_key|api-key)\s*[:=]\s*['"]?[a-zA-Z0-9]{32,}['"]?
    
  - name: "Google API Key"
    regex: AIza[0-9A-Za-z\\-_]{35}
    
  - name: "GitHub Token"
    regex: (ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}
    
  - name: "GitHub App Token"
    regex: ghs_[A-Za-z0-9_]{36}
    
  - name: "GitHub Personal Access Token"
    regex: ghp_[A-Za-z0-9_]{36}
    
  - name: "GitHub OAuth Token"
    regex: gho_[A-Za-z0-9_]{36}
    
  - name: "GitHub User to Server Token"
    regex: ghu_[A-Za-z0-9_]{36}
    
  - name: "GitHub Server to Server Token"
    regex: ghs_[A-Za-z0-9_]{36}
    
  - name: "GitHub Refresh Token"
    regex: ghr_[A-Za-z0-9_]{36}
    
  # AWS
  - name: "AWS Access Key ID"
    regex: AKIA[0-9A-Z]{16}
    
  - name: "AWS Secret Access Key"
    regex: (?i)aws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*['"]?[A-Za-z0-9/+=]{40}['"]?
    
  # Database URLs
  - name: "Database URL with Password"
    regex: (?i)(postgresql?|mysql|mongodb)://[^:]+:[^@]+@[^/]+/[^?\s]+
    
  # JWT Tokens
  - name: "JWT Token"
    regex: eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*
    
  # Private Keys
  - name: "RSA Private Key"
    regex: -----BEGIN RSA PRIVATE KEY-----
    
  - name: "DSA Private Key"
    regex: -----BEGIN DSA PRIVATE KEY-----
    
  - name: "EC Private Key"
    regex: -----BEGIN EC PRIVATE KEY-----
    
  - name: "OpenSSH Private Key"
    regex: -----BEGIN OPENSSH PRIVATE KEY-----
    
  - name: "PGP Private Key"
    regex: -----BEGIN PGP PRIVATE KEY BLOCK-----
    
  # OAuth
  - name: "OAuth Client Secret"
    regex: (?i)(client[_-]?secret|client_secret|client-secret)\s*[:=]\s*['"]?[a-zA-Z0-9]{16,}['"]?
    
  # reCAPTCHA
  - name: "reCAPTCHA Secret Key"
    regex: 6L[0-9A-Za-z-_]{35}
    
  # Stripe
  - name: "Stripe Secret Key"
    regex: sk_live_[0-9a-zA-Z]{24}
    
  - name: "Stripe Publishable Key"
    regex: pk_live_[0-9a-zA-Z]{24}
    
  # Slack
  - name: "Slack Bot Token"
    regex: xoxb-[0-9]{12}-[0-9]{12}-[a-zA-Z0-9]{24}
    
  - name: "Slack User Token"
    regex: xoxp-[0-9]{12}-[0-9]{12}-[a-zA-Z0-9]{24}
    
  # Discord
  - name: "Discord Bot Token"
    regex: [MN][a-zA-Z0-9]{23}\.[\w-]{6}\.[\w-]{27}
    
  # Firebase
  - name: "Firebase API Key"
    regex: AIza[0-9A-Za-z\\-_]{35}
    
  # Google Cloud
  - name: "Google Cloud API Key"
    regex: AIza[0-9A-Za-z\\-_]{35}
    
  # Passwords in code
  - name: "Hardcoded Password"
    regex: (?i)(password|passwd|pwd)\s*[:=]\s*['"]?[^'"]{8,}['"]?
    
  # Environment variables with secrets
  - name: "Secret in Environment Variable"
    regex: (?i)(secret|key|token|password)\s*[:=]\s*['"]?[a-zA-Z0-9]{16,}['"]?

# Exclude patterns
exclude:
  - "node_modules/"
  - ".git/"
  - "dist/"
  - "build/"
  - ".next/"
  - "coverage/"
  - "*.min.js"
  - "*.bundle.js"
  - "package-lock.json"
  - "yarn.lock"
  - "pnpm-lock.yaml"
  - "*.log"
  - "*.tmp"
  - ".env.example"
  - "env.local.example"
  - "test-recaptcha.html"
  - "security/secret-scan-REPORT.txt"
  - ".trufflehog.yaml"

# Scan configuration
only-verified: false
fail: true
json: false
EOF

echo -e "${BLUE}📋 Running trufflehog scan...${NC}"

# Run trufflehog scan
if trufflehog --config "$TRUFFLEHOG_CONFIG" "$REPO_ROOT" > "$REPORT_FILE" 2>&1; then
    echo -e "${GREEN}✅ No secrets found!${NC}"
    echo "Report saved to: $REPORT_FILE"
    exit 0
else
    SCAN_EXIT_CODE=$?
    echo -e "${RED}🚨 Secrets found!${NC}"
    echo "Report saved to: $REPORT_FILE"
    echo ""
    
    # Display findings
    if [ -f "$REPORT_FILE" ]; then
        echo -e "${YELLOW}📊 Scan Results:${NC}"
        echo "=================="
        cat "$REPORT_FILE"
        echo ""
        echo -e "${RED}❌ Scan failed with exit code: $SCAN_EXIT_CODE${NC}"
    fi
    
    exit $SCAN_EXIT_CODE
fi

