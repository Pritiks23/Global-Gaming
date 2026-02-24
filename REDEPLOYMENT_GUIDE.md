# Quick Fix: Deploy Swagger UI Changes to DigitalOcean

Your Swagger UI changes are in the code but haven't been deployed to DigitalOcean yet. Here's how to fix that immediately.

## Immediate Solutions (Pick One)

### Option 1: Redeploy via DigitalOcean Console (Fastest - 2 minutes)

**For App Platform:**
1. Go to https://cloud.digitalocean.com/apps
2. Find your gaming leaderboard app
3. Click on it
4. Click **Actions** → **Force Rebuild and Deploy**
5. Wait 3-5 minutes
6. Visit `https://your-app-name.ondigitalocean.app/api-docs` to see your Swagger UI!

**For Droplet:**
```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Go to the app directory
cd /root/Global-Gaming

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose up -d --build

# Verify
curl http://localhost:3000/health
```

Then visit: `http://YOUR_DROPLET_IP:3000/api-docs`

### Option 2: Set Up Automated Deployment (Best Long-Term)

Follow the [AUTOMATED_DEPLOYMENT.md](./AUTOMATED_DEPLOYMENT.md) guide to:
1. Set up GitHub Actions
2. Add your DigitalOcean credentials as GitHub secrets
3. Push to main and auto-deploy!

This takes 10-15 minutes to set up but saves you time forever.

## Why This Happened

When you make code changes (like adding Swagger UI):
1. ✅ Changes are committed to GitHub
2. ❌ DigitalOcean doesn't automatically know about them
3. ❌ You need to manually redeploy OR set up automated deployment

## Preventing This in the Future

**Set up automated deployment** (see [AUTOMATED_DEPLOYMENT.md](./AUTOMATED_DEPLOYMENT.md)) so that:
- Every push to `main` automatically deploys to DigitalOcean
- You can trigger manual deployments from GitHub Actions
- Your live app always matches your code

## Verify It Worked

After redeploying, check:

1. **Swagger UI is live:**
   - Visit `/api-docs` on your app
   - You should see the interactive API documentation

2. **API is working:**
   ```bash
   curl https://your-app-name.ondigitalocean.app/health
   ```

3. **Check the build logs:**
   - App Platform: DigitalOcean Console → Apps → Your App → Logs
   - Droplet: `docker compose logs -f app`

## Still Not Working?

1. **Clear your browser cache** - Old files might be cached
2. **Check you're on the right URL** - `/api-docs` not `/api-doc`
3. **Verify main branch** - Make sure changes are in the main branch
4. **Check deployment logs** - Look for errors during deployment
5. **Verify environment** - Check that your app is using the latest code:
   ```bash
   # For droplet, SSH in and run:
   cd /root/Global-Gaming
   git log -1
   # Should show your latest Swagger UI commit
   ```

## Need Help?

- Check GitHub Issues
- Review deployment logs in DigitalOcean Console
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide
- See [AUTOMATED_DEPLOYMENT.md](./AUTOMATED_DEPLOYMENT.md) for automation setup
