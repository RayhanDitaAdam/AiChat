#!/bin/bash

# =============================================================================
# AiChat Auto-Deployment Script
# =============================================================================
# This script automates the process of pulling changes, building the frontend,
# and restarting the backend via PM2.
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# =============================================================================

echo "🚀 Starting Deployment Process..."

# 1. Pull latest changes from Git
echo "📥 [1/4] Stashing local changes and pulling from GitHub..."
git stash
git pull origin main
git stash pop || echo "⚠️ No local changes to re-apply or conflicts occurred during stash pop."

# 2. Frontend: Install dependencies and Build
echo "🏗️ [2/4] Building Frontend (generating new dist)..."
cd frontend
npm install
npm run build
cd ..

# 3. Backend: Install dependencies and Restart
echo "⚙️ [3/4] Updating Backend..."
cd backend
npm install
# We use PM2 to restart the backend process
echo "🔄 [4/4] Restarting PM2 process..."
pm2 restart aichat-backend || pm2 start ../ecosystem.config.cjs --only aichat-backend

echo "✨ Deployment successfully completed! Your UI should be updated now."
