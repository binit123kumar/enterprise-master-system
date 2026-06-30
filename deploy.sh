#!/bin/bash
# ════════════════════════════════════════════════════
# EnterpriseOS — Complete Deploy Script
# Owner: Binit
# Usage: chmod +x deploy.sh && ./deploy.sh
# ════════════════════════════════════════════════════

set -e  # Exit on any error

# ── Colors ────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ── Config ────────────────────────────────────────────
PROJECT_NAME="EnterpriseOS"
VERSION="v4.0.0"
BRANCH="main"
GITHUB_USERNAME="YOUR_GITHUB_USERNAME"
GITHUB_REPO="enterprise-os"
RENDER_API_KEY="YOUR_RENDER_API_KEY"
RENDER_FRONTEND_ID="YOUR_FRONTEND_SERVICE_ID"
RENDER_BACKEND_ID="YOUR_BACKEND_SERVICE_ID"

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   🛡️  EnterpriseOS Deploy Script ${VERSION}${NC}"
echo -e "${BLUE}   Owner: Binit${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# ── STEP 1: Pre-checks ────────────────────────────────
echo -e "${CYAN}📋 Step 1: Pre-deployment checks...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ Node.js $(node --version)${NC}"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ Git $(git --version)${NC}"

# Check .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}  ⚠️  .env not found — copying from .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}  ⚠️  Please update .env with your real values!${NC}"
fi
echo -e "${GREEN}  ✅ .env file found${NC}"

# ── STEP 2: Install & Build Frontend ─────────────────
echo ""
echo -e "${CYAN}🔵 Step 2: Building React frontend...${NC}"
npm install --silent
npm run build
echo -e "${GREEN}  ✅ Frontend build successful → dist/${NC}"

# ── STEP 3: Security check ────────────────────────────
echo ""
echo -e "${CYAN}🔐 Step 3: Security scan...${NC}"

# Check no secrets in code
if grep -r "sk-ant\|ghp_\|rnd_" ./src --include="*.jsx" --include="*.js" 2>/dev/null | grep -v ".env"; then
    echo -e "${RED}  ❌ SECURITY ALERT: Possible API keys in source code!${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ No secrets exposed in source code${NC}"

# ── STEP 4: Git Push ──────────────────────────────────
echo ""
echo -e "${CYAN}🔀 Step 4: Pushing to GitHub...${NC}"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "  Initializing git repository..."
    git init
    git remote add origin "https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"
fi

# Stage all files
git add -A

# Commit
COMMIT_MSG="deploy: ${PROJECT_NAME} ${VERSION} - $(date '+%d %b %Y %H:%M')"
git commit -m "${COMMIT_MSG}" || echo -e "${YELLOW}  ⚠️  Nothing to commit${NC}"

# Push
echo -e "  Pushing to ${BRANCH}..."
git push -u origin ${BRANCH}
echo -e "${GREEN}  ✅ Pushed to GitHub → ${GITHUB_USERNAME}/${GITHUB_REPO}${NC}"

# ── STEP 5: Deploy to Render ──────────────────────────
echo ""
echo -e "${CYAN}🚀 Step 5: Deploying to Render.com...${NC}"

# Deploy Frontend
echo -e "  Deploying frontend..."
FRONTEND_RESPONSE=$(curl -s -X POST \
    "https://api.render.com/v1/services/${RENDER_FRONTEND_ID}/deploys" \
    -H "Authorization: Bearer ${RENDER_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"clearCache":"do_not_clear"}')

if echo "$FRONTEND_RESPONSE" | grep -q '"id"'; then
    DEPLOY_ID=$(echo $FRONTEND_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('id','unknown'))" 2>/dev/null || echo "triggered")
    echo -e "${GREEN}  ✅ Frontend deploy triggered (ID: ${DEPLOY_ID})${NC}"
else
    echo -e "${YELLOW}  ⚠️  Frontend deploy response: ${FRONTEND_RESPONSE}${NC}"
fi

# Deploy Backend
echo -e "  Deploying backend..."
BACKEND_RESPONSE=$(curl -s -X POST \
    "https://api.render.com/v1/services/${RENDER_BACKEND_ID}/deploys" \
    -H "Authorization: Bearer ${RENDER_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"clearCache":"do_not_clear"}')

if echo "$BACKEND_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}  ✅ Backend deploy triggered${NC}"
else
    echo -e "${YELLOW}  ⚠️  Backend deploy response: ${BACKEND_RESPONSE}${NC}"
fi

# ── STEP 6: Health Check ──────────────────────────────
echo ""
echo -e "${CYAN}🏥 Step 6: Health checks (waiting 30s for deploy)...${NC}"
sleep 30

# Check frontend
FRONTEND_URL="https://${GITHUB_REPO}.onrender.com"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}  ✅ Frontend is UP → ${FRONTEND_URL}${NC}"
else
    echo -e "${YELLOW}  ⚠️  Frontend returning HTTP ${HTTP_STATUS} (may still be deploying)${NC}"
fi

# ── SUMMARY ───────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}   🎉 Deploy Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "  📦 Version:   ${VERSION}"
echo -e "  🌐 Frontend:  https://${GITHUB_REPO}.onrender.com"
echo -e "  🔧 Backend:   https://${GITHUB_REPO}-api.onrender.com"
echo -e "  📊 GitHub:    https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}"
echo -e "  📅 Time:      $(date '+%d %b %Y %H:%M:%S')"
echo ""
echo -e "${CYAN}  Next steps:${NC}"
echo -e "  1. Open Render dashboard to monitor deployment"
echo -e "  2. Check GitHub Actions for CI/CD status"
echo -e "  3. Run SQL migration: 002_CompleteSetup.sql"
echo ""
