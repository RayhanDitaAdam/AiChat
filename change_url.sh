#!/bin/bash

# =============================================================================
# AiChat URL Migration Script
# =============================================================================
# Usage:
#   chmod +x change_url.sh
#   ./change_url.sh http://your-production-ip-or-domain
# =============================================================================

NEW_URL=$1

if [ -z "$NEW_URL" ]; then
    echo "❌ Error: Please provide the new URL."
    echo "Usage: ./change_url.sh http://panggaleh.com"
    exit 1
fi

# Remove trailing slash if provided
NEW_URL="${NEW_URL%/}"

echo "🔄 Migrating URLs to: $NEW_URL"

# Define targets
TARGET_DIRS=("backend/src" "frontend/src")
ENV_FILES=("backend/.env" "frontend/.env.local")

# Helper to escape slashes for sed
OLD_BASE="http://localhost"
NEW_BASE="$NEW_URL"

# 1. Replace in Source Files
echo "📝 Updating source files..."
for dir in "${TARGET_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        # Replace variations of localhost with ports
        # Note: We keep the ports if they are part of the target, 
        # but the user might want them gone if using Nginx as reverse proxy.
        # Based on typical Nginx setup (port 80), we might need to be smart.
        
        # Replace http://localhost:5173 and http://localhost:4000 with NEW_URL (assuming Nginx handles routing)
        find "$dir" -type f -name "*.js" -o -name "*.jsx" | xargs sed -i "s|http://localhost:[0-9]\+|$NEW_URL|g"
        find "$dir" -type f -name "*.js" -o -name "*.jsx" | xargs sed -i "s|http://127.0.0.1:[0-9]\+|$NEW_URL|g"
        find "$dir" -type f -name "*.js" -o -name "*.jsx" | xargs sed -i "s|http://localhost|$NEW_URL|g"
    fi
done

# 2. Replace in .env files
echo "🔐 Updating .env files..."
for file in "${ENV_FILES[@]}"; do
    if [ -f "$file" ]; then
        sed -i "s|http://localhost:[0-9]\+|$NEW_URL|g" "$file"
        sed -i "s|http://127.0.0.1:[0-9]\+|$NEW_URL|g" "$file"
        sed -i "s|http://localhost|$NEW_URL|g" "$file"
    fi
done

echo "✅ URL Migration completed!"
echo "⚠️ Note: You may need to rebuild your frontend (npm run build) for changes to take effect on the VPS."
