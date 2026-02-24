# DigitalOcean Deployment Guide

This guide provides step-by-step instructions for deploying the Global Gaming Leaderboard API to DigitalOcean.

## Prerequisites

- DigitalOcean account
- GitHub repository with your code
- Basic understanding of Docker (for Droplet deployment)

## Deployment Options

### Option 1: DigitalOcean App Platform (Easiest, Recommended for Quick Start)

DigitalOcean App Platform is a Platform-as-a-Service (PaaS) that automatically builds and deploys your application.

#### Step 1: Create a New App

1. Log in to your DigitalOcean account
2. Click **Create** → **Apps**
3. Select **GitHub** as your source
4. Authorize DigitalOcean to access your repository
5. Select the `Pritiks23/Global-Gaming` repository
6. Select the branch (e.g., `main` or `copilot/build-global-gaming-leaderboard-api`)

#### Step 2: Configure Your App

1. **App Name**: `gaming-leaderboard-api`
2. **Region**: Choose the closest region to your users
3. **Build Settings**:
   - Source Directory: `/`
   - Build Command: `npm install`
   - Run Command: `npm start`
4. **HTTP Port**: `3000`
5. **Instance Size**: Basic ($5/month is sufficient for testing)

#### Step 3: Add Managed Databases

1. In the app configuration, click **Add Resource** → **Database**
2. Add **MongoDB** (Managed Database):
   - Name: `gaming-leaderboard-db`
   - Engine: MongoDB
   - Size: Start with the smallest size ($15/month)
3. Add **Redis** (if available) or use an external Redis provider like:
   - Redis Labs (free tier available)
   - Upstash (serverless Redis)

#### Step 4: Configure Environment Variables

In the App Platform dashboard, go to **Settings** → **Environment Variables** and add:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=${db.CONNECTION_STRING}
REDIS_HOST=<your-redis-host>
REDIS_PORT=6379
CACHE_TTL=300
```

Note: `${db.CONNECTION_STRING}` automatically references your managed database.

#### Step 5: Deploy

1. Click **Deploy**
2. Wait for the build and deployment to complete (5-10 minutes)
3. Your API will be available at: `https://your-app-name.ondigitalocean.app`

#### Step 6: Test Your Deployment

```bash
# Test the API
curl https://your-app-name.ondigitalocean.app/health

# Submit a score
curl -X POST https://your-app-name.ondigitalocean.app/scores \
  -H "Content-Type: application/json" \
  -d '{"userId":"player1","gameName":"tetris","score":5000}'
```

---

### Option 2: DigitalOcean Droplet with Docker (More Control)

This option gives you full control over your infrastructure using a VPS (Droplet).

#### Step 1: Create a Droplet

1. Log in to DigitalOcean
2. Click **Create** → **Droplets**
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic - $6/month (1GB RAM)
   - **Datacenter**: Closest to your users
   - **Authentication**: SSH keys (recommended) or password
   - **Hostname**: `gaming-leaderboard-api`
4. Click **Create Droplet**

#### Step 2: Initial Server Setup

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Update system packages
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get install docker-compose-plugin -y

# Verify installations
docker --version
docker compose version
```

#### Step 3: Setup Firewall

```bash
# Allow SSH, HTTP, and HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable
ufw status
```

#### Step 4: Clone and Deploy Application

```bash
# Clone your repository
git clone https://github.com/Pritiks23/Global-Gaming.git
cd Global-Gaming

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongodb:27017/gaming-leaderboard
REDIS_HOST=redis
REDIS_PORT=6379
CACHE_TTL=300
MAX_LEADERBOARD_SIZE=10000
EOF

# Start services with Docker Compose
docker compose up -d

# Check if containers are running
docker compose ps

# View logs
docker compose logs -f app
```

#### Step 5: Setup Nginx as Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
apt install nginx -y

# Create Nginx configuration
cat > /etc/nginx/sites-available/gaming-api << EOF
server {
    listen 80;
    server_name YOUR_DROPLET_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/gaming-api /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl reload nginx
```

#### Step 6: Setup SSL with Let's Encrypt (For Custom Domain)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure SSL and set up auto-renewal
```

#### Step 7: Setup Auto-restart on System Reboot

```bash
# Docker containers will auto-restart due to "restart: unless-stopped" in docker-compose.yml

# Verify
docker compose ps

# To manually restart all services
docker compose restart
```

---

### Option 3: DigitalOcean Kubernetes (For Production Scale)

For high-scale production deployments, consider using DigitalOcean Kubernetes (DOKS).

#### Quick Setup

1. Create a Kubernetes cluster in DigitalOcean
2. Install `kubectl` and `doctl` CLI tools
3. Build and push your Docker image to DigitalOcean Container Registry
4. Deploy using Kubernetes manifests

```bash
# Build and tag image
docker build -t registry.digitalocean.com/your-registry/gaming-leaderboard:latest .

# Push to DO Container Registry
docker push registry.digitalocean.com/your-registry/gaming-leaderboard:latest

# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

---

## Monitoring and Maintenance

### Check Application Health

```bash
# Using curl
curl http://YOUR_IP_OR_DOMAIN/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### View Logs

```bash
# Docker Compose
docker compose logs -f app

# View MongoDB logs
docker compose logs -f mongodb

# View Redis logs
docker compose logs -f redis
```

### Update Application

```bash
# Pull latest code
cd /root/Global-Gaming
git pull origin main

# Rebuild and restart containers
docker compose down
docker compose up -d --build

# Verify
docker compose ps
```

### Backup Data

```bash
# Backup MongoDB
docker compose exec mongodb mongodump --out=/data/backup

# Copy backup to host
docker cp gaming-leaderboard-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)

# Backup to DigitalOcean Spaces (optional)
# Install s3cmd first
apt install s3cmd -y
s3cmd put -r ./mongodb-backup-* s3://your-bucket/backups/
```

### Monitor Resources

```bash
# Check resource usage
docker stats

# Check disk space
df -h

# Check memory usage
free -h
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker compose logs app

# Check MongoDB connection
docker compose exec app node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e))"

# Check if ports are available
netstat -tulpn | grep 3000
```

### High Memory Usage

```bash
# Restart containers
docker compose restart

# Monitor resource usage
docker stats

# Consider upgrading droplet size
```

### Database Connection Issues

```bash
# Check MongoDB is running
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Test connection
docker compose exec mongodb mongosh
```

---

## Cost Estimation

### App Platform (Recommended for Beginners)
- Basic App: $5/month
- Managed MongoDB: $15/month
- Total: ~$20/month

### Droplet + Docker (More Control)
- Basic Droplet (1GB): $6/month
- MongoDB runs on same droplet: $0
- Redis runs on same droplet: $0
- Total: ~$6/month

### Production Setup
- App Platform Pro: $12/month
- Managed MongoDB (2GB): $30/month
- Managed Redis: $15/month
- Total: ~$57/month

---

## Next Steps

1. Set up monitoring (DigitalOcean Monitoring, or tools like Datadog, New Relic)
2. Configure backups (DigitalOcean Snapshots or automated backup scripts)
3. Set up CI/CD pipeline (GitHub Actions)
4. Add custom domain and SSL
5. Scale horizontally by adding more app instances

---

## Support

For deployment issues:
- DigitalOcean Community: https://www.digitalocean.com/community
- Documentation: https://docs.digitalocean.com
- Create an issue on GitHub

---

**Important Security Notes:**
- Always use environment variables for sensitive data
- Enable firewall (UFW)
- Keep system and packages updated
- Use SSH keys instead of passwords
- Regularly backup your data
- Monitor logs for suspicious activity
