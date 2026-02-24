# Automated Deployment Setup Guide

This guide explains how to set up automated deployments to DigitalOcean so that your Swagger UI and other code changes automatically deploy when you push to the main branch.

## Why Automated Deployment?

Without automated deployment, changes to your code (like Swagger UI updates) are committed to GitHub but don't automatically update your live DigitalOcean application. You would need to manually redeploy each time. This workflow automates that process.

## Setup Instructions

### For DigitalOcean App Platform

1. **Get your DigitalOcean Access Token:**
   - Go to https://cloud.digitalocean.com/account/api/tokens
   - Click "Generate New Token"
   - Name it "GitHub Actions" and give it Read & Write permissions
   - Copy the token (you won't see it again!)

2. **Get your App ID:**
   - Go to https://cloud.digitalocean.com/apps
   - Click on your app
   - The App ID is in the URL: `https://cloud.digitalocean.com/apps/YOUR_APP_ID`
   - Or run: `doctl apps list` (if you have doctl installed)

3. **Add GitHub Secrets and Variables:**
   - Go to your GitHub repository
   - Click **Settings** → **Secrets and variables** → **Actions**
   
   **Add these secrets:**
   - Name: `DIGITALOCEAN_ACCESS_TOKEN`
   - Value: Your DigitalOcean access token from step 1
   
   **Add these variables:**
   - Name: `DIGITALOCEAN_APP_ID`
   - Value: Your App ID from step 2

4. **Done!** Every push to the main branch will now automatically deploy to DigitalOcean App Platform.

### For DigitalOcean Droplet

1. **Generate SSH Key (if you don't have one):**
   ```bash
   ssh-keygen -t ed25519 -C "github-actions"
   cat ~/.ssh/id_ed25519  # Copy this private key
   ```

2. **Add GitHub Secrets and Variables:**
   - Go to your GitHub repository
   - Click **Settings** → **Secrets and variables** → **Actions**
   
   **Add these secrets:**
   - Name: `DROPLET_HOST`
   - Value: Your droplet IP address
   
   - Name: `DROPLET_USERNAME`
   - Value: Usually `root`
   
   - Name: `DROPLET_SSH_KEY`
   - Value: Your private SSH key (from step 1)
   
   **Add these variables:**
   - Name: `DEPLOY_TO_DROPLET`
   - Value: `true`

3. **Done!** Every push to the main branch will now automatically deploy to your Droplet.

## Manual Deployment

You can also trigger deployments manually without pushing code:

1. Go to your GitHub repository
2. Click **Actions** → **Deploy to DigitalOcean**
3. Click **Run workflow** → **Run workflow**

This is useful when you want to redeploy without making code changes.

## How to Deploy Your Current Swagger UI Changes

Since you've already made Swagger UI changes but they haven't deployed yet, here are your options:

### Option A: Merge and Auto-Deploy (Recommended)
1. Merge your Swagger UI PR to the main branch
2. The GitHub Actions workflow will automatically deploy within 2-5 minutes
3. Check the Actions tab to see deployment progress

### Option B: Manual Deployment via GitHub Actions
1. Set up the GitHub secrets/variables as described above
2. Go to Actions → Deploy to DigitalOcean
3. Click "Run workflow"
4. Wait for deployment to complete

### Option C: Manual Deployment via CLI

**For App Platform:**
```bash
# Install doctl if you haven't already
brew install doctl  # macOS
# or
snap install doctl  # Linux

# Authenticate
doctl auth init

# List your apps
doctl apps list

# Deploy
doctl apps create-deployment YOUR_APP_ID
```

**For Droplet:**
```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Pull latest changes
cd /root/Global-Gaming
git pull origin main

# Rebuild and restart
docker compose down
docker compose up -d --build

# Verify deployment
docker compose ps
curl http://localhost:3000/health
```

## Verifying Deployment

After deployment, verify that your changes are live:

1. **Check Swagger UI:**
   - App Platform: `https://your-app-name.ondigitalocean.app/api-docs`
   - Droplet: `http://YOUR_DROPLET_IP:3000/api-docs`

2. **Check API Health:**
   ```bash
   curl https://your-app-name.ondigitalocean.app/health
   ```

3. **Check GitHub Actions:**
   - Go to your repository
   - Click the **Actions** tab
   - Look for green checkmarks ✓

## Troubleshooting

### Deployment fails with "App not found"
- Check that `DIGITALOCEAN_APP_ID` is set correctly
- Verify your access token has the right permissions

### SSH connection fails for Droplet
- Verify `DROPLET_HOST` is correct
- Make sure your SSH key is correctly formatted (include BEGIN and END lines)
- Check that the repository is cloned at `/root/Global-Gaming` on your droplet

### Changes deployed but not showing up
- Clear your browser cache
- Check that you merged to the `main` branch, not a feature branch
- For App Platform, check the deployment logs in DigitalOcean console
- For Droplet, SSH in and check: `cd /root/Global-Gaming && git log -1`

## Best Practices

1. **Always deploy to main:** Only the main branch triggers automatic deployment
2. **Use PRs:** Make changes in feature branches, then merge to main
3. **Monitor deployments:** Check the Actions tab after merging
4. **Test locally first:** Use `docker compose up` to test before pushing
5. **Keep secrets safe:** Never commit access tokens or SSH keys to the repository

## Environment Variables

Make sure these environment variables are set in your DigitalOcean deployment:

```
NODE_ENV=production
PORT=3000
DB_STORAGE=/app/data/leaderboard.sqlite
MAX_LEADERBOARD_SIZE=10000
```

For App Platform, set these in Settings → Environment Variables.
For Droplet, they're already configured in `docker-compose.yml`.

## Need Help?

- Check deployment logs in GitHub Actions
- For App Platform: Check DigitalOcean Console → Apps → Your App → Logs
- For Droplet: SSH in and run `docker compose logs -f app`
- Create an issue on GitHub with deployment logs
