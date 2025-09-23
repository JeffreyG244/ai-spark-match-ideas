#!/bin/bash

# Netlify Environment Variables Setup Script
echo "🚀 Setting up Netlify environment variables..."

echo ""
echo "Copy and paste these variables into your Netlify dashboard:"
echo "Site Settings → Environment variables → Add environment variable"
echo ""
echo "========================================"

echo "Variable: VITE_SUPABASE_URL"
echo "Value: https://tzskjzkolyiwhijslqmq.supabase.co"
echo ""

echo "Variable: VITE_SUPABASE_ANON_KEY"
echo "Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw"
echo ""

echo "Variable: VITE_APP_NAME"
echo "Value: LuvLang"
echo ""

echo "Variable: VITE_APP_VERSION"
echo "Value: 1.0.0-staging"
echo ""

echo "Variable: VITE_ENVIRONMENT"
echo "Value: staging"
echo ""

echo "Variable: VITE_ENABLE_ANALYTICS"
echo "Value: false"
echo ""

echo "Variable: VITE_ENABLE_PWA"
echo "Value: false"
echo ""

echo "Variable: VITE_ENABLE_SENTRY"
echo "Value: false"
echo ""

echo "Variable: NODE_VERSION"
echo "Value: 18"
echo ""

echo "Variable: NPM_VERSION"
echo "Value: 9"
echo ""

echo "========================================"
echo ""
echo "After adding these variables, trigger a new deploy in Netlify"
echo "or push a new commit to GitHub to rebuild with the variables."
echo ""
echo "✅ Your staging environment will then work correctly!"