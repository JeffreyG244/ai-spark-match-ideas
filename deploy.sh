#!/bin/bash

# LuvLang Deployment Helper Script
# Usage: ./deploy.sh [quick|full|check]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check site health
check_health() {
    print_status "Checking site health..."

    echo "Main site (luvlang.org):"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://luvlang.org)
    if [[ "$HTTP_CODE" == "200" ]]; then
        print_success "luvlang.org is online (HTTP $HTTP_CODE)"
    else
        print_error "luvlang.org returned HTTP $HTTP_CODE"
    fi

    echo ""
    echo "Railway service:"
    if curl -s --max-time 10 https://58crefe0.up.railway.app/health | jq . 2>/dev/null; then
        print_success "Railway service is healthy"
    else
        print_warning "Railway service not responding (may be building or down)"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://58crefe0.up.railway.app 2>/dev/null || echo "timeout")
        echo "Railway HTTP status: $HTTP_CODE"
    fi
}

# Function to deploy with build
full_deploy() {
    print_status "Starting full deployment..."

    # Run linting
    print_status "Running linter..."
    npm run lint || print_warning "Linting failed, continuing anyway"

    # Build the project
    print_status "Building project..."
    npm run build

    # Git operations
    print_status "Committing changes..."
    git add .
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || print_warning "No changes to commit"

    print_status "Pushing to GitHub..."
    git push

    print_success "Deployment initiated! Check Railway logs for build progress."
    print_status "Run './deploy.sh check' in a few minutes to verify deployment."
}

# Function to quick deploy (no build)
quick_deploy() {
    print_status "Starting quick deployment..."

    git add .
    git commit -m "Quick deploy: $(date '+%Y-%m-%d %H:%M:%S')" || print_warning "No changes to commit"
    git push

    print_success "Quick deployment initiated!"
}

# Function to show railway logs
show_logs() {
    print_status "Fetching Railway logs..."
    if command -v railway &> /dev/null; then
        railway logs --service=58crefe0
    else
        print_error "Railway CLI not found. Install with: npm install -g @railway/cli"
    fi
}

# Main script logic
case "${1:-help}" in
    "full")
        full_deploy
        ;;
    "quick")
        quick_deploy
        ;;
    "check")
        check_health
        ;;
    "logs")
        show_logs
        ;;
    "help"|*)
        echo "LuvLang Deployment Helper"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  full    - Build, commit, and deploy (recommended)"
        echo "  quick   - Just commit and deploy (no build)"
        echo "  check   - Check health of both sites"
        echo "  logs    - Show Railway deployment logs"
        echo "  help    - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 full    # Full deployment with build"
        echo "  $0 quick   # Quick deploy without build"
        echo "  $0 check   # Check if sites are working"
        ;;
esac