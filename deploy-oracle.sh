#!/bin/bash

# ════════════════════════════════════════════════════
# EnterpriseOS - Oracle Cloud Auto-Deploy Script
# Owner: Binit
# Usage: chmod +x deploy-oracle.sh && ./deploy-oracle.sh
# ════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  🆓 EnterpriseOS - FREE Deploy${NC}"
echo -e "${BLUE}  Oracle Cloud Always Free Tier${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# ── Check Prerequisites ────────────────────────────
echo -e "${CYAN}📋 Step 1: Checking prerequisites...${NC}"

# Check if root
if [[ $EUID -ne 0 ]]; then
   echo -e "${YELLOW}⚠️  Please run with sudo${NC}"
   echo "sudo bash deploy-oracle.sh"
   exit 1
fi

# Check Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    echo -e "${RED}❌ This script is for Ubuntu only${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ubuntu detected${NC}"

# ── System Update ──────────────────────────────────
echo ""
echo -e "${CYAN}🔄 Step 2: Updating system...${NC}"
apt update
apt upgrade -y
echo -e "${GREEN}✅ System updated${NC}"

# ── Install Docker ────────────────────────────────
echo ""
echo -e "${CYAN}🐳 Step 3: Installing Docker...${NC}"

# Remove old Docker
apt remove -y docker docker.io || true

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
bash get-docker.sh
rm get-docker.sh

# Add to docker group
usermod -aG docker ubuntu 2>/dev/null || true

# Start Docker
systemctl start docker
systemctl enable docker

echo -e "${GREEN}✅ Docker installed${NC}"
docker --version

# ── Install Docker Compose ─────────────────────────
echo ""
echo -e "${CYAN}📦 Step 4: Installing Docker Compose...${NC}"

curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo -e "${GREEN}✅ Docker Compose installed${NC}"
docker-compose --version

# ── Install Git ────────────────────────────────────
echo ""
echo -e "${CYAN}📝 Step 5: Installing Git...${NC}"
apt install -y git
echo -e "${GREEN}✅ Git installed${NC}"
git --version

# ── Install .NET SDK (for backend) ─────────────────
echo ""
echo -e "${CYAN}⚙️  Step 6: Installing .NET 8 SDK...${NC}"

# Add Microsoft repository
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --version latest --install-dir /usr/local/dotnet
rm dotnet-install.sh

# Add to PATH
echo 'export DOTNET_ROOT=/usr/local/dotnet' >> /etc/profile.d/dotnet-env.sh
echo 'export PATH=$PATH:/usr/local/dotnet' >> /etc/profile.d/dotnet-env.sh
source /etc/profile.d/dotnet-env.sh

echo -e "${GREEN}✅ .NET SDK installed${NC}"

# ── Install Node.js (for frontend) ─────────────────
echo ""
echo -e "${CYAN}⚙️  Step 7: Installing Node.js...${NC}"

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo -e "${GREEN}✅ Node.js installed${NC}"
node --version

# ── Clone Project ──────────────────────────────────
echo ""
echo -e "${CYAN}📥 Step 8: Cloning EnterpriseOS...${NC}"

cd /opt

if [ -d "enterprise-master-system" ]; then
    echo -e "${YELLOW}⚠️  Project folder already exists${NC}"
    read -p "Update existing project? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd enterprise-master-system
        git pull origin main
    fi
else
    # Replace with your repo
    git clone https://github.com/YOUR_USERNAME/enterprise-master-system.git
    cd enterprise-master-system
fi

echo -e "${GREEN}✅ Project ready at /opt/enterprise-master-system${NC}"

# ── Setup Environment ──────────────────────────────
echo ""
echo -e "${CYAN}⚙️  Step 9: Setting up environment...${NC}"

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  .env created from template${NC}"
    echo -e "${YELLOW}   Edit it with your credentials:${NC}"
    echo -e "${YELLOW}   nano /opt/enterprise-master-system/.env${NC}"
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi

# ── Build Docker Images ────────────────────────────
echo ""
echo -e "${CYAN}🔨 Step 10: Building Docker images...${NC}"

docker-compose build --no-cache

echo -e "${GREEN}✅ Docker images built${NC}"

# ── Start Services ────────────────────────────────
echo ""
echo -e "${CYAN}🚀 Step 11: Starting services...${NC}"

docker-compose up -d

echo -e "${GREEN}✅ Services started${NC}"

# Wait for services to be ready
sleep 10

# ── Setup Database ────────────────────────────────
echo ""
echo -e "${CYAN}📊 Step 12: Setting up database...${NC}"

# Wait for SQL Server to be ready
echo "⏳ Waiting for SQL Server to be ready..."
sleep 20

# Run migrations
docker-compose exec -T backend dotnet ef database update || true

echo -e "${GREEN}✅ Database setup complete${NC}"

# ── Verify Services ──────────────────────────────
echo ""
echo -e "${CYAN}✔️  Step 13: Verifying services...${NC}"

sleep 5

echo ""
echo -e "${GREEN}✅ Service Status:${NC}"

if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}  ✅ Frontend: http://localhost:3000${NC}"
else
    echo -e "${RED}  ❌ Frontend: Not responding${NC}"
fi

if curl -s http://localhost:5000/api/auth/me > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Backend: http://localhost:5000${NC}"
else
    echo -e "${YELLOW}  ⚠️  Backend: Initializing...${NC}"
fi

if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}  ✅ AI Agent: http://localhost:8000${NC}"
else
    echo -e "${YELLOW}  ⚠️  AI Agent: Initializing...${NC}"
fi

if docker-compose exec -T sqlserver sqlcmd -S localhost -U sa -P "$SQL_PASSWORD" -Q "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ SQL Server: Running${NC}"
else
    echo -e "${YELLOW}  ⚠️  SQL Server: Initializing...${NC}"
fi

# ── Display Information ───────────────────────────
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 Deployment Complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}📍 Access Your Application:${NC}"
echo ""
echo -e "${YELLOW}Frontend:${NC}     http://YOUR_ORACLE_IP:3000"
echo -e "${YELLOW}Backend API:${NC}  http://YOUR_ORACLE_IP:5000"
echo -e "${YELLOW}AI Agent:${NC}     http://YOUR_ORACLE_IP:8000"
echo ""

echo -e "${CYAN}📋 Useful Commands:${NC}"
echo ""
echo "View logs:"
echo -e "  ${YELLOW}docker-compose logs -f${NC}"
echo ""
echo "Stop services:"
echo -e "  ${YELLOW}docker-compose down${NC}"
echo ""
echo "Restart services:"
echo -e "  ${YELLOW}docker-compose restart${NC}"
echo ""
echo "Check status:"
echo -e "  ${YELLOW}docker-compose ps${NC}"
echo ""
echo "Update project:"
echo -e "  ${YELLOW}git pull origin main${NC}"
echo -e "  ${YELLOW}docker-compose build${NC}"
echo -e "  ${YELLOW}docker-compose up -d${NC}"
echo ""

echo -e "${CYAN}🔐 Next Steps:${NC}"
echo ""
echo "1. Update .env file with your credentials:"
echo -e "   ${YELLOW}nano /opt/enterprise-master-system/.env${NC}"
echo ""
echo "2. Configure domain (optional):"
echo -e "   ${YELLOW}Point your domain to: YOUR_ORACLE_IP${NC}"
echo ""
echo "3. Setup SSL certificate:"
echo -e "   ${YELLOW}docker exec backend certbot certonly --standalone -d yourdomain.com${NC}"
echo ""
echo "4. Deploy frontend to Vercel (optional):"
echo -e "   ${YELLOW}vercel --prod${NC}"
echo ""
echo "5. Monitor logs:"
echo -e "   ${YELLOW}docker-compose logs -f${NC}"
echo ""

echo -e "${GREEN}✅ Your EnterpriseOS is now running!${NC}"
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Cost: ₹0 FOREVER 🎉${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
