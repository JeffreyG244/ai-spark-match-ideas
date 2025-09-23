#!/bin/bash

# CLI Power Tools Setup for LuvLang Development
echo "🚀 Setting up powerful CLI tools for LuvLang development..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install essential CLI tools
echo "Installing CLI tools..."

# JSON processor
brew install jq

# Better grep
brew install ripgrep

# Better find
brew install fd

# HTTP client
brew install httpie

# Railway CLI
npm install -g @railway/cli

# Add helpful aliases to shell profile
SHELL_PROFILE=""
if [[ -f ~/.zshrc ]]; then
    SHELL_PROFILE=~/.zshrc
elif [[ -f ~/.bashrc ]]; then
    SHELL_PROFILE=~/.bashrc
elif [[ -f ~/.bash_profile ]]; then
    SHELL_PROFILE=~/.bash_profile
fi

if [[ -n "$SHELL_PROFILE" ]]; then
    echo "Adding helpful aliases to $SHELL_PROFILE..."
    cat >> "$SHELL_PROFILE" << 'EOF'

# LuvLang Development Aliases
alias lv-status='./status.sh'
alias lv-deploy='./deploy.sh full'
alias lv-quick='./deploy.sh quick'
alias lv-check='./deploy.sh check'
alias lv-logs='./deploy.sh logs'
alias lv-dev='npm run dev'
alias lv-build='npm run build'
alias lv-health='curl -s https://luvlang.org/health | jq .'

# General productivity aliases
alias ll='ls -la'
alias gs='git status'
alias gc='git commit -m'
alias gp='git push'
alias ga='git add'
alias gd='git diff'
alias gl='git log --oneline -10'

EOF

    echo "✅ Aliases added! Run 'source $SHELL_PROFILE' or restart your terminal."
fi

echo ""
echo "🎉 CLI setup complete!"
echo ""
echo "New commands available:"
echo "  lv-status   - Show project dashboard"
echo "  lv-deploy   - Full deployment"
echo "  lv-quick    - Quick deployment"
echo "  lv-check    - Health check"
echo "  lv-logs     - Show logs"
echo "  lv-dev      - Start dev server"
echo "  lv-build    - Build project"
echo "  lv-health   - Check main site health"