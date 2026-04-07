#!/bin/bash
# 🚀 Lumina Analytics - Quick Deployment Script
# This script helps you deploy to Netlify and Render

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          LUMINA ANALYTICS - DEPLOYMENT ASSISTANT            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v git &> /dev/null; then
    echo "❌ Git not installed. Please install Git first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Git found: $(git --version)"
echo "✅ Node.js found: $(node --version)"
echo ""

# Git Setup
echo "📝 Git Setup"
echo "─────────────────────────────────────────────────────────────"

if [ -z "$(git config user.email)" ]; then
    echo "❌ Git user.email not configured"
    echo "Run: git config --global user.email 'your-email@example.com'"
    exit 1
fi

echo "✅ Git user configured: $(git config user.email)"

# Check if repo is already initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial deployment setup"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi

echo ""
echo "📤 GitHub Upload"
echo "─────────────────────────────────────────────────────────────"
echo "1. Create a new repository on GitHub: https://github.com/new"
echo "2. Name it: lumina-analytics"
echo "3. Do NOT initialize with README, .gitignore, or license"
echo "4. Copy the repository URL"
echo ""
echo "Then run these commands:"
echo "  git remote add origin YOUR_REPO_URL"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""

echo "📋 MongoDB Atlas Setup"
echo "─────────────────────────────────────────────────────────────"
echo "1. Go to: https://www.mongodb.com/cloud/atlas"
echo "2. Create account or login"
echo "3. Create a new cluster (M0 Free)"
echo "4. Create database user (save credentials!)"
echo "5. Allow network access: 0.0.0.0/0"
echo "6. Get connection string from 'Connect' → 'Drivers'"
echo "7. Save the connection string (with password replaced)"
echo ""

echo "🌐 Netlify Deployment"
echo "─────────────────────────────────────────────────────────────"
echo "1. Go to: https://app.netlify.com"
echo "2. Click 'Add new site' → 'Import an existing project'"
echo "3. Choose GitHub and select lumina-analytics"
echo "4. Base directory: client"
echo "5. Build command: npm run build"
echo "6. Publish directory: .next"
echo "7. Add environment variable:"
echo "   NEXT_PUBLIC_API_URL = https://lumina-backend.onrender.com"
echo ""

echo "🔧 Render Deployment"
echo "─────────────────────────────────────────────────────────────"
echo "1. Go to: https://dashboard.render.com"
echo "2. Click '+ New' → 'Web Service'"
echo "3. Connect GitHub repository"
echo "4. Root directory: server"
echo "5. Environment: Node"
echo "6. Build command: npm install"
echo "7. Start command: npm start"
echo "8. Add environment variables (see .env.production.example)"
echo ""

echo "✅ Setup Complete!"
echo "═════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Push code to GitHub"
echo "2. Connect Netlify for frontend"
echo "3. Connect Render for backend"
echo "4. Add environment variables"
echo "5. Test the deployed application"
echo ""
echo "For detailed instructions, see: DEPLOYMENT_NETLIFY_RENDER.md"
