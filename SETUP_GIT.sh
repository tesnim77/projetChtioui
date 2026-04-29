# Git configuration
git init
git add .
git commit -m "Initial project setup - bornes de recharge platform"

# Create .env files locally (git ignored)
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
