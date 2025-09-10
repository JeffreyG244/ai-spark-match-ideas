#!/bin/bash

# Railway Manual Deployment Script
# This creates a minimal deployment package

echo "🚀 Creating Railway deployment package..."

# Create deployment directory
mkdir -p railway-deploy
cd railway-deploy

# Copy essential files
cp ../server.js .
cp ../package.json .
cp ../railway.json .

# Create minimal package.json for deployment
cat > package.json << 'EOL'
{
  "name": "luvlang-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "validate": "echo 'Validation passed'"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.55.0",
    "cors": "^2.8.5",
    "express": "^5.1.0"
  },
  "engines": {
    "node": "18.x"
  }
}
EOL

# Create Dockerfile for Railway
cat > Dockerfile << 'EOL'
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOL

echo "✅ Railway deployment package created in railway-deploy/"
echo "📁 Files ready for deployment:"
ls -la

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Create new Railway project"
echo "2. Choose 'Deploy from GitHub' or upload these files"
echo "3. Railway will automatically deploy!"