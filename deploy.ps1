# 🚀 Lumina Analytics - Quick Deployment Script (Windows PowerShell)
# This script helps you deploy to Netlify and Render

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          LUMINA ANALYTICS - DEPLOYMENT ASSISTANT            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

$gitVersion = & git --version 2>$null
if ($gitVersion) {
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Git not installed. Please install Git first." -ForegroundColor Red
    exit
}

$nodeVersion = & node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not installed. Please install Node.js first." -ForegroundColor Red
    exit
}

Write-Host ""

# Git Setup
Write-Host "📝 Git Setup" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────"

$gitEmail = & git config user.email
if ([string]::IsNullOrEmpty($gitEmail)) {
    Write-Host "❌ Git user.email not configured" -ForegroundColor Red
    Write-Host "Run: git config --global user.email 'your-email@example.com'" -ForegroundColor Yellow
    exit
}

Write-Host "✅ Git user configured: $gitEmail" -ForegroundColor Green

# Check if repo is already initialized
if (Test-Path ".git") {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
} else {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    & git init
    & git add .
    & git commit -m "Initial deployment setup"
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "📤 GitHub Upload" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────"
Write-Host "1. Create a new repository on GitHub: https://github.com/new" -ForegroundColor Cyan
Write-Host "2. Name it: lumina-analytics" -ForegroundColor Cyan
Write-Host "3. Do NOT initialize with README, .gitignore, or license" -ForegroundColor Cyan
Write-Host "4. Copy the repository URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then run these commands:" -ForegroundColor Yellow
Write-Host "  git remote add origin YOUR_REPO_URL" -ForegroundColor Gray
Write-Host "  git branch -M main" -ForegroundColor Gray
Write-Host "  git push -u origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 MongoDB Atlas Setup" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────"
Write-Host "1. Go to: https://www.mongodb.com/cloud/atlas" -ForegroundColor Cyan
Write-Host "2. Create account or login" -ForegroundColor Cyan
Write-Host "3. Create a new cluster (M0 Free)" -ForegroundColor Cyan
Write-Host "4. Create database user (save credentials!)" -ForegroundColor Cyan
Write-Host "5. Allow network access: 0.0.0.0/0" -ForegroundColor Cyan
Write-Host "6. Get connection string from 'Connect' → 'Drivers'" -ForegroundColor Cyan
Write-Host "7. Save the connection string (with password replaced)" -ForegroundColor Cyan
Write-Host ""

Write-Host "🌐 Netlify Deployment" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────"
Write-Host "1. Go to: https://app.netlify.com" -ForegroundColor Cyan
Write-Host "2. Click 'Add new site' → 'Import an existing project'" -ForegroundColor Cyan
Write-Host "3. Choose GitHub and select lumina-analytics" -ForegroundColor Cyan
Write-Host "4. Base directory: client" -ForegroundColor Cyan
Write-Host "5. Build command: npm run build" -ForegroundColor Cyan
Write-Host "6. Publish directory: .next" -ForegroundColor Cyan
Write-Host "7. Add environment variable:" -ForegroundColor Cyan
Write-Host "   NEXT_PUBLIC_API_URL = https://lumina-backend.onrender.com" -ForegroundColor Gray
Write-Host ""

Write-Host "🔧 Render Deployment" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────"
Write-Host "1. Go to: https://dashboard.render.com" -ForegroundColor Cyan
Write-Host "2. Click '+ New' → 'Web Service'" -ForegroundColor Cyan
Write-Host "3. Connect GitHub repository" -ForegroundColor Cyan
Write-Host "4. Root directory: server" -ForegroundColor Cyan
Write-Host "5. Environment: Node" -ForegroundColor Cyan
Write-Host "6. Build command: npm install" -ForegroundColor Cyan
Write-Host "7. Start command: npm start" -ForegroundColor Cyan
Write-Host "8. Add environment variables (see .env.production.example)" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "═════════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Push code to GitHub" -ForegroundColor Cyan
Write-Host "2. Connect Netlify for frontend" -ForegroundColor Cyan
Write-Host "3. Connect Render for backend" -ForegroundColor Cyan
Write-Host "4. Add environment variables" -ForegroundColor Cyan
Write-Host "5. Test the deployed application" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed instructions, see: DEPLOYMENT_NETLIFY_RENDER.md" -ForegroundColor Yellow
