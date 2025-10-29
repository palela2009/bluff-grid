# 🚀 Quick Netlify Deployment Guide

## ✅ Prerequisites Checklist

Before deploying to Netlify, make sure you have:

- [x] MongoDB Atlas account with connection string
- [x] GitHub repository pushed with latest changes
- [x] netlify.toml file created (already done!)
- [x] Environment variables ready

---

## 📋 Step-by-Step Deployment

### Step 1: Deploy Backend to Railway (Required First!)

**Why first?** Frontend needs to know the backend URL!

1. Go to https://railway.app and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your **`bluff-grid`** repository
4. Railway auto-detects Node.js ✅

**Configure Railway:**

- Click on the service → **"Settings"**
- **Root Directory**: `backend`
- **Start Command**: `npm start` (should be auto-detected)

**Add Environment Variables:**

- Click **"Variables"** tab
- Add these:
  ```
  MONGO_URI = mongodb+srv://your-connection-string
  PORT = 3000
  NODE_ENV = production
  ```

**Get Your Backend URL:**

- Click **"Settings"** → Find the deployment URL
- Copy it! Looks like: `https://bluff-grid-production-xxxx.up.railway.app`

---

### Step 2: Deploy Frontend to Netlify

1. Go to https://netlify.com and sign in with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Select your **`bluff-grid`** repository
5. Netlify should auto-detect settings from `netlify.toml` ✅

**If not auto-detected, configure:**

```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

**Add Environment Variable:**

- Go to **"Site settings"** → **"Environment variables"**
- Click **"Add a variable"**
- Key: `VITE_API_URL`
- Value: `https://your-railway-backend-url.railway.app` (from Step 1)

6. Click **"Deploy site"**
7. Wait 2-3 minutes for build ⏳
8. Get your site URL: `https://bluff-grid.netlify.app` or similar

---

### Step 3: Update Backend with Netlify URL

After deployment, you need to add your Netlify URL to backend CORS:

1. Open `backend/server.js`
2. Find `allowedOrigins` array
3. Add your Netlify URL:
   ```javascript
   const allowedOrigins = [
     "http://localhost:5173",
     "https://your-actual-site.netlify.app", // Add your URL here
     /\.netlify\.app$/, // Already added - allows all Netlify domains
   ];
   ```
4. Push changes to GitHub
5. Railway will auto-redeploy ✅

---

### Step 4: Test Your Deployed Game!

Visit your Netlify URL and test:

- [ ] Site loads
- [ ] Can sign up/login
- [ ] Can create grids
- [ ] Can create/join rooms
- [ ] Multiplayer works
- [ ] Game finishes correctly
- [ ] Leaderboard shows

---

## 🔧 Common Issues & Fixes

### ❌ "Failed to fetch" or CORS errors

- **Fix**: Make sure you added your Netlify URL to `allowedOrigins` in backend
- Railway auto-redeploys when you push to GitHub

### ❌ "Cannot connect to backend"

- **Fix**: Check `VITE_API_URL` environment variable in Netlify
- Should be your Railway backend URL

### ❌ "404 Page Not Found" on refresh

- **Fix**: `netlify.toml` file should handle this (already created!)
- Make sure redirects rule is in the file

### ❌ MongoDB connection error

- **Fix**:
  1. Check `MONGO_URI` in Railway environment variables
  2. In MongoDB Atlas, whitelist Railway's IP (or use 0.0.0.0/0 for all IPs)

### ❌ Build fails

- **Fix**: Check Netlify build logs
- Make sure `frontend/package.json` has correct dependencies
- Try building locally first: `cd frontend && npm run build`

---

## 💰 Costs

- **Netlify**: FREE (100GB bandwidth/month)
- **Railway**: FREE ($5 credit/month, enough for small traffic)
- **MongoDB Atlas**: FREE (512MB storage)
- **Total**: $0/month! 🎉

When you need to scale:

- Railway Pro: ~$5-20/month for more resources
- MongoDB paid: $9/month for more storage
- Custom domain: ~$12/year

---

## 🎯 After Deployment

### Want a custom domain? (bluffgrid.com)

**In Netlify:**

1. Go to **"Domain settings"**
2. Click **"Add custom domain"**
3. Enter: `bluffgrid.com`
4. Netlify shows DNS records to add

**In your domain registrar (Namecheap, GoDaddy):**

1. Add these DNS records:

   ```
   Type: A
   Host: @
   Value: 75.2.60.5 (Netlify's IP)

   Type: CNAME
   Host: www
   Value: your-site.netlify.app
   ```

2. Wait 24-48 hours for DNS propagation

---

## 📊 Monitoring Your Deployment

**Netlify:**

- Check deploy logs: Site overview → Deploys
- View analytics: Analytics tab
- Set up deploy notifications

**Railway:**

- Check backend logs: Service → Logs tab
- Monitor resource usage: Metrics tab

---

## 🔄 Updating Your Game

**Automatic Deployment:**
Both Netlify and Railway auto-deploy when you push to GitHub!

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Netlify and Railway automatically rebuild and deploy! 🚀
```

---

## ✅ Deployment Checklist

Before you consider it "done":

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Netlify
- [ ] Environment variables set correctly
- [ ] CORS configured in backend
- [ ] MongoDB connection working
- [ ] Test signup/login
- [ ] Test multiplayer with 2 devices
- [ ] Test on mobile
- [ ] Share with friends!

---

## 🆘 Need Help?

Check:

1. Netlify build logs (in Netlify dashboard)
2. Railway application logs (in Railway dashboard)
3. Browser console (F12)
4. Network tab for failed requests

---

Good luck with your deployment! 🎮🚀

Your game will be live at:

- Frontend: `https://bluff-grid.netlify.app`
- Backend: `https://bluff-grid-production.up.railway.app`
