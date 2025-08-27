#!/bin/bash

# Secret scanning script for lumpsum.in
# Uses trufflehog to detect secrets in the codebase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_ROOT="$(pwd)"
REPORT_FILE="$REPO_ROOT/security/secret-scan-REPORT.txt"

echo -e "${BLUE}🔍 Starting comprehensive secret scan...${NC}"
echo "Repository: $REPO_ROOT"
echo "Report: $REPORT_FILE"

# Create security directory if it doesn't exist
mkdir -p "$(dirname "$REPORT_FILE")"

echo -e "${BLUE}📋 Running trufflehog scan...${NC}"

# Run trufflehog scan with default detectors
if trufflehog filesystem . > "$REPORT_FILE" 2>&1; then
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

