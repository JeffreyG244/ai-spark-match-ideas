#!/bin/bash

# LuvLang Project Status Dashboard
# Shows comprehensive status of your deployment pipeline

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                    🚀 LUVLANG STATUS DASHBOARD               ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo -e "${CYAN}▶ $1${NC}"
    echo "────────────────────────────────────────"
}

check_git_status() {
    print_section "GIT STATUS"

    echo -n "Current branch: "
    git branch --show-current

    echo -n "Last commit: "
    git log -1 --pretty=format:"%h - %s (%cr)" --abbrev-commit
    echo ""

    if git status --porcelain | grep -q .; then
        echo -e "${YELLOW}⚠ Uncommitted changes detected${NC}"
        git status --short
    else
        echo -e "${GREEN}✓ Working directory clean${NC}"
    fi
    echo ""
}

check_site_health() {
    print_section "SITE HEALTH"

    # Main site
    echo -n "luvlang.org: "
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://luvlang.org 2>/dev/null || echo "timeout")
    if [[ "$HTTP_CODE" == "200" ]]; then
        echo -e "${GREEN}✓ ONLINE (HTTP $HTTP_CODE)${NC}"
        echo "  LuvLang Professional dating platform"
    else
        echo -e "${RED}✗ OFFLINE (HTTP $HTTP_CODE)${NC}"
    fi

    # Railway service
    echo -n "Railway (58crefe0): "
    if curl -s --max-time 10 https://58crefe0.up.railway.app/health | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✓ ONLINE${NC}"
        HEALTH=$(curl -s https://58crefe0.up.railway.app/health | jq -r '.status // "unknown"' 2>/dev/null)
        VERSION=$(curl -s https://58crefe0.up.railway.app/health | jq -r '.version // "unknown"' 2>/dev/null)
        echo "  Status: $HEALTH | Version: $VERSION"
    else
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://58crefe0.up.railway.app 2>/dev/null || echo "timeout")
        echo -e "${YELLOW}⚠ BUILDING/OFFLINE (HTTP $HTTP_CODE)${NC}"
    fi
    echo ""
}

check_dependencies() {
    print_section "DEPENDENCY STATUS"

    echo -n "Node.js: "
    if command -v node >/dev/null 2>&1; then
        echo -e "${GREEN}$(node --version)${NC}"
    else
        echo -e "${RED}✗ Not installed${NC}"
    fi

    echo -n "npm: "
    if command -v npm >/dev/null 2>&1; then
        echo -e "${GREEN}$(npm --version)${NC}"
    else
        echo -e "${RED}✗ Not installed${NC}"
    fi

    echo -n "Railway CLI: "
    if command -v railway >/dev/null 2>&1; then
        echo -e "${GREEN}$(railway --version 2>/dev/null || echo 'installed')${NC}"
    else
        echo -e "${YELLOW}⚠ Not installed (npm install -g @railway/cli)${NC}"
    fi

    echo -n "git: "
    if command -v git >/dev/null 2>&1; then
        echo -e "${GREEN}$(git --version | cut -d' ' -f3)${NC}"
    else
        echo -e "${RED}✗ Not installed${NC}"
    fi

    echo -n "jq: "
    if command -v jq >/dev/null 2>&1; then
        echo -e "${GREEN}$(jq --version)${NC}"
    else
        echo -e "${YELLOW}⚠ Not installed (brew install jq)${NC}"
    fi
    echo ""
}

check_project_structure() {
    print_section "PROJECT STRUCTURE"

    FILES=("package.json" "server.js" "vite.config.ts" "deploy.sh" ".env.production")

    for file in "${FILES[@]}"; do
        echo -n "$file: "
        if [[ -f "$file" ]]; then
            echo -e "${GREEN}✓ Present${NC}"
        else
            echo -e "${RED}✗ Missing${NC}"
        fi
    done
    echo ""
}

show_quick_commands() {
    print_section "QUICK COMMANDS"

    echo "Deployment:"
    echo "  ./deploy.sh full    - Full build and deploy"
    echo "  ./deploy.sh quick   - Quick deploy (no build)"
    echo "  ./deploy.sh check   - Health check only"
    echo ""
    echo "Development:"
    echo "  npm run dev         - Start development server"
    echo "  npm run build       - Build for production"
    echo "  npm run lint        - Run linter"
    echo ""
    echo "Monitoring:"
    echo "  ./deploy.sh logs    - View Railway logs"
    echo "  ./status.sh         - Show this dashboard"
    echo ""
}

# Main execution
print_header
check_git_status
check_site_health
check_dependencies
check_project_structure
show_quick_commands

echo -e "${PURPLE}Last updated: $(date)${NC}"