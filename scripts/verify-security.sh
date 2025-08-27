#!/bin/bash

# =============================================================================
# LUMPSUM.IN SECURITY VERIFICATION SCRIPT
# =============================================================================
# 
# This script runs a comprehensive security verification to ensure:
# - No secrets are leaked in the repository
# - Environment variables are used correctly
# - Code quality and type safety
# - Build process works correctly
# 
# Usage: bash scripts/verify-security.sh [--full-scan]
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Parse arguments
FULL_SCAN=false
if [[ "$1" == "--full-scan" ]]; then
    FULL_SCAN=true
fi

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "\n${BLUE}🔍 $1${NC}"
    echo "============================================================"
}

# Check if required tools are installed
check_dependencies() {
    log_step "Checking dependencies"
    
    local missing_deps=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    else
        log_success "Node.js $(node --version)"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    else
        log_success "npm $(npm --version)"
    fi
    
    # Check TruffleHog (optional)
    if ! command -v trufflehog &> /dev/null; then
        log_warning "TruffleHog not found. Install with: brew install trufflesecurity/trufflehog/trufflehog"
        log_warning "Secret scanning will be skipped"
    else
        log_success "TruffleHog $(trufflehog --version)"
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_error "Please install missing dependencies and try again"
        exit 1
    fi
}

# Secret scanning
run_secret_scan() {
    log_step "Running secret scanning"
    
    if ! command -v trufflehog &> /dev/null; then
        log_warning "Skipping secret scan (TruffleHog not installed)"
        return 0
    fi
    
    # Quick scan of staged files
    log_info "Quick scan of staged files..."
    STAGED_FILES=$(git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx|json|md|txt|yml|yaml)$' || true)
    
    if [ -z "$STAGED_FILES" ]; then
        log_info "No staged files to scan"
        return 0
    fi
    
    SECRETS_FOUND=false
    for file in $STAGED_FILES; do
        if [ -f "$file" ]; then
            if trufflehog --config .trufflehog.yaml --no-update "$file" 2>/dev/null; then
                log_error "Potential secrets found in $file"
                SECRETS_FOUND=true
            fi
        fi
    done
    
    if [ "$SECRETS_FOUND" = true ]; then
        log_error "Please review and remove any secrets before committing"
        return 1
    fi
    
    log_success "No secrets found in staged files"
    
    # Full scan if requested
    if [ "$FULL_SCAN" = true ]; then
        log_info "Running full repository scan..."
        if trufflehog --config .trufflehog.yaml --no-update . 2>/dev/null; then
            log_error "Potential secrets found in repository!"
            log_error "Please review and remove any secrets"
            return 1
        fi
        
        log_success "No secrets found in repository"
    else
        log_info "Skipping full scan (use --full-scan for complete repository scan)"
    fi
}

# Environment variable usage check
check_env_usage() {
    log_step "Checking environment variable usage"
    
    cd "$FRONTEND_DIR"
    
    if node ../scripts/check-env-usage.mjs; then
        log_success "Environment variable usage is correct"
    else
        log_error "Environment variable usage issues found"
        log_error "Please fix the issues above and try again"
        return 1
    fi
}

# ESLint check
run_eslint() {
    log_step "Running ESLint"
    
    cd "$FRONTEND_DIR"
    
    if npm run lint; then
        log_success "ESLint passed"
    else
        log_error "ESLint failed"
        log_error "Please fix linting issues and try again"
        return 1
    fi
}

# TypeScript type check
run_typescript_check() {
    log_step "Running TypeScript type check"
    
    cd "$FRONTEND_DIR"
    
    if npx tsc --noEmit; then
        log_success "TypeScript type check passed"
    else
        log_error "TypeScript type check failed"
        log_error "Please fix type errors and try again"
        return 1
    fi
}

# Next.js build check
run_nextjs_build() {
    log_step "Running Next.js build check"
    
    cd "$FRONTEND_DIR"
    
    # Set dummy environment variables for build
    export DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
    export NEXTAUTH_SECRET="dummy-secret-for-build-test-only"
    export NEXTAUTH_URL="http://localhost:3000"
    export GOOGLE_CLIENT_ID="dummy-client-id"
    export GOOGLE_CLIENT_SECRET="dummy-client-secret"
    export RECAPTCHA_SECRET_KEY="dummy-recaptcha-secret"
    export NEXT_PUBLIC_RECAPTCHA_SITE_KEY="dummy-recaptcha-site-key"
    
    if npm run build; then
        log_success "Next.js build passed"
    else
        log_error "Next.js build failed"
        log_error "Please fix build issues and try again"
        return 1
    fi
}

# Environment variable verification
verify_env_vars() {
    log_step "Verifying environment variables"
    
    cd "$PROJECT_ROOT"
    
    if node scripts/verify-env.mjs; then
        log_success "Environment variables are properly configured"
    else
        log_warning "Environment variables verification failed"
        log_warning "This is expected if running locally without .env.local"
        log_info "For production, ensure all required environment variables are set"
    fi
}

# Check for common security issues
check_security_issues() {
    log_step "Checking for common security issues"
    
    local issues_found=false
    
    # Check for actual hardcoded secrets in workflow files (exclude documentation and comments)
    WORKFLOW_SECRETS=$(grep -r "password\|secret\|token\|key" .github/workflows/ 2>/dev/null | grep -v "secrets\." | grep -v "NEXT_PUBLIC_" | grep -v "#" | grep -v "regex:" | grep -v "testsecret" | grep -v "dummy" | grep -v "secret-scan" | grep -v "secret-scan-REPORT" | grep -v "This PR contains" | grep -v "Remove secrets" | grep -v "Rotate exposed" | grep -v "Update .env" | grep -v "Re-run scan" | grep -v "No secrets found" | grep -v "Run secret scan" | grep -v "Fail on secrets found" | grep -v "Security scan failed" | grep -v "Please review" | grep -v "Rotate any exposed" || true)
    
    if [ -n "$WORKFLOW_SECRETS" ]; then
        log_error "Potential hardcoded secrets found in workflow files:"
        echo "$WORKFLOW_SECRETS"
        issues_found=true
    fi
    
    # Check for .env files in git
    if git ls-files | grep -E "\.env$|\.env\." | grep -v "\.env\.example$"; then
        log_error "Environment files found in git repository"
        log_error "Please remove .env files from git tracking"
        issues_found=true
    fi
    
    # Check for console.log in production code
    if grep -r "console\.log" "$FRONTEND_DIR/app" "$FRONTEND_DIR/components" 2>/dev/null | grep -v "logSafe\|logError\|logWarning"; then
        log_warning "console.log found in production code"
        log_warning "Consider using secure logging utilities"
    fi
    
    if [ "$issues_found" = false ]; then
        log_success "No obvious security issues found"
    else
        log_error "Security issues found. Please address them before proceeding"
        return 1
    fi
}

# Main verification function
main() {
    echo -e "${BLUE}"
    echo "============================================================================="
    echo "🔒 LUMPSUM.IN SECURITY VERIFICATION"
    echo "============================================================================="
    echo -e "${NC}"
    
    log_info "Starting comprehensive security verification..."
    log_info "Project root: $PROJECT_ROOT"
    log_info "Full scan: $FULL_SCAN"
    
    # Run all checks
    local exit_code=0
    
    check_dependencies || exit_code=1
    run_secret_scan || exit_code=1
    check_env_usage || exit_code=1
    run_eslint || exit_code=1
    run_typescript_check || exit_code=1
    run_nextjs_build || exit_code=1
    verify_env_vars || exit_code=1
    check_security_issues || exit_code=1
    
    # Final summary
    echo -e "\n${BLUE}============================================================================="
    echo "📊 VERIFICATION SUMMARY"
    echo "=============================================================================${NC}"
    
    if [ $exit_code -eq 0 ]; then
        log_success "All security checks passed!"
        echo -e "\n${GREEN}🎉 Your code is ready for deployment!${NC}"
        echo -e "\n${BLUE}Next steps:${NC}"
        echo "1. Commit your changes"
        echo "2. Push to repository"
        echo "3. Monitor CI/CD pipeline"
        echo "4. Deploy to production"
    else
        log_error "Security verification failed!"
        echo -e "\n${RED}🚨 Please fix the issues above before proceeding${NC}"
        echo -e "\n${BLUE}Common fixes:${NC}"
        echo "1. Remove any hardcoded secrets"
        echo "2. Fix environment variable usage"
        echo "3. Resolve linting errors"
        echo "4. Fix TypeScript errors"
        echo "5. Address build issues"
        echo -e "\n${YELLOW}For help, check:${NC}"
        echo "- DEPLOY_ENV.md for environment setup"
        echo "- ENVIRONMENT_SECURITY_SUMMARY.md for security guidelines"
        echo "- .eslintrc.json for linting rules"
    fi
    
    exit $exit_code
}

# Run main function
main "$@"
