# DigitalOcean Deployment Guide

This guide provides step-by-step instructions for deploying the Global Gaming Leaderboard API to DigitalOcean in under 15 minutes!

## Prerequisites

- DigitalOcean account
- GitHub repository with your code
- That's it! No database setup needed!

## Deployment Options

### Option 1: DigitalOcean App Platform (Easiest - 5-10 minutes)

DigitalOcean App Platform is a Platform-as-a-Service (PaaS) that automatically builds and deploys your application.

#### Step 1: Create a New App

1. Log in to your DigitalOcean account
2. Click **Create** → **Apps**
3. Select **GitHub** as your source
4. Authorize DigitalOcean to access your repository
5. Select the `Pritiks23/Global-Gaming` repository
6. Select the branch (e.g., `main`)

#### Step 2: Configure Your App

1. **App Name**: `gaming-leaderboard-api`
2. **Region**: Choose the closest region to your users
3. **Build Settings**:
   - Source Directory: `/`
   - Build Command: `npm install`
   - Run Command: `npm start`
4. **HTTP Port**: `3000`
5. **Instance Size**: Basic ($5/month is sufficient for most use cases)

#### Step 3: Add Persistent Storage (Optional but Recommended)

To persist your database across deployments:

1. Add a persistent volume:
   - Mount Path: `/app/data`
   - This will ensure your SQLite database persists across deployments

#### Step 4: Configure Environment Variables (Optional)

In the App Platform dashboard, go to **Settings** → **Environment Variables**:

```
NODE_ENV=production
PORT=3000
DB_STORAGE=/app/data/leaderboard.sqlite
MAX_LEADERBOARD_SIZE=10000
```

These are optional - the app works with sensible defaults!

#### Step 5: Deploy

1. Click **Deploy**
2. Wait for the build and deployment to complete (3-5 minutes)
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

**Total Time: 5-10 minutes!**

---

### Option 2: DigitalOcean Droplet with Docker (10-15 minutes)

This option gives you full control over your infrastructure using a VPS (Droplet).

#### Step 1: Create a Droplet

1. Log in to DigitalOcean
2. Click **Create** → **Droplets**
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic - $6/month (1GB RAM is sufficient)
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

# Start the service with Docker Compose
docker compose up -d

# Check if container is running
docker compose ps

# View logs
docker compose logs -f app
```

**That's it! Your API is now live at `http://YOUR_DROPLET_IP:3000`**

#### Step 5: Test Your Deployment

```bash
# Test from your local machine
curl http://YOUR_DROPLET_IP:3000/health

# Submit a score
curl -X POST http://YOUR_DROPLET_IP:3000/scores \
  -H "Content-Type: application/json" \
  -d '{"userId":"player1","gameName":"tetris","score":5000}'
```

**Total Time: 10-15 minutes!**

#### Optional: Setup Nginx as Reverse Proxy

If you want to use port 80 instead of 3000:

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

#### Optional: Setup SSL with Let's Encrypt (For Custom Domain)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure SSL and set up auto-renewal
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

# View last 100 lines
docker compose logs --tail=100 app
```

### Update Application

```bash
# Pull latest code
cd /root/Global-Gaming
git pull origin main

# Rebuild and restart container
docker compose down
docker compose up -d --build

# Verify
docker compose ps
```

### Backup Database

```bash
# The SQLite database is in the data directory
# Create a backup
cp data/leaderboard.sqlite data/leaderboard-backup-$(date +%Y%m%d).sqlite

# Or copy to your local machine
scp root@YOUR_DROPLET_IP:/root/Global-Gaming/data/leaderboard.sqlite ./backup.sqlite
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

# Check if port is available
netstat -tulpn | grep 3000

# Restart container
docker compose restart app
```

### Database Issues

```bash
# Check if database file exists
ls -lh data/

# Check database file permissions
chmod 644 data/leaderboard.sqlite

# Restart the application
docker compose restart app
```

### High Memory Usage

```bash
# Restart containers
docker compose restart

# Monitor resource usage
docker stats

# Consider upgrading droplet size if needed
```

---

## Cost Estimation

### App Platform (Easiest)
- Basic App: $5/month
- **Total: $5/month** (No separate database costs!)

### Droplet + Docker (Most Cost-Effective)
- Basic Droplet (1GB): $6/month
- Database runs in same container: $0
- **Total: $6/month**

### Production Setup with Larger Droplet
- Standard Droplet (2GB): $12/month
- **Total: $12/month**

**Cost Comparison**: Using SQLite instead of managed databases (MongoDB $15/month + Redis $15/month) can save $30/month or more, making it ideal for budget-conscious deployments and quick prototypes.

---

## Quick Deployment Checklist

### For App Platform (5-10 minutes):
- [ ] Create App in DigitalOcean
- [ ] Connect GitHub repository
- [ ] Configure build settings (npm install, npm start)
- [ ] (Optional) Add persistent volume for /app/data
- [ ] Deploy
- [ ] Test endpoints

### For Droplet (10-15 minutes):
- [ ] Create Droplet (Ubuntu 22.04, 1GB RAM)
- [ ] SSH into droplet
- [ ] Install Docker & Docker Compose
- [ ] Setup firewall (UFW)
- [ ] Clone repository
- [ ] Run `docker compose up -d`
- [ ] Test endpoints

---

## Next Steps

1. **Monitor Usage**: Keep an eye on resource usage in the first few days
2. **Setup Backups**: Schedule regular backups of the SQLite database file
3. **Custom Domain**: Point a domain to your deployment (optional)
4. **SSL Certificate**: Add HTTPS with Let's Encrypt (optional, but recommended)
5. **CI/CD**: Set up GitHub Actions for automated deployments (optional)

---

## Support

For deployment issues:
- DigitalOcean Community: https://www.digitalocean.com/community
- Documentation: https://docs.digitalocean.com
- Create an issue on GitHub

---

**Important Notes:**
- The SQLite database is file-based and stored in the `data/` directory
- For App Platform, use persistent volumes to keep data across deployments
- For Droplet deployments, the data persists automatically in the mounted volume
- Regular backups are recommended (just copy the SQLite file)
- No external database services needed = Lower costs and simpler deployment!

---

**🚀 Deploy in under 15 minutes! No database setup required!**
