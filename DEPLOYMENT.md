# 🚀 Bluff Grid Deployment Guide

## Prerequisites

- ✅ Domain: **bluffgrid.com** (purchase from Namecheap/GoDaddy)
- ✅ MongoDB Atlas account (free)
- ✅ Vercel account (free)
- ✅ Railway/Render account (free)

---

## 📋 Step-by-Step Deployment

### 1. Setup MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a new cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. **Save this** - you'll need it as `MONGO_URI`

### 2. Deploy Backend to Railway

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `bluff-grid` repository
5. Railway will auto-detect Node.js

**Environment Variables to Set:**

```
MONGO_URI=mongodb+srv://your-connection-string
PORT=3000
NODE_ENV=production
```

**Important Settings:**

- Root Directory: `/backend`
- Start Command: `npm start`
- Port: Railway will provide a URL like `https://bluff-grid-backend.up.railway.app`

6. **Copy the Railway URL** - you'll need it for frontend

### 3. Deploy Frontend to Vercel

1. Go to https://vercel.com/
2. Sign up with GitHub
3. Click "New Project"
4. Import your `bluff-grid` repository
5. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

**Environment Variables:**

```
VITE_API_URL=https://your-railway-backend-url.railway.app
```

### 4. Update Backend CORS

After deploying frontend, update `backend/server.js`:

```javascript
// Change line 23-24 from:
origin: "http://localhost:5173",

// To:
origin: ["https://bluffgrid.com", "https://www.bluffgrid.com"],
```

Then push changes to GitHub (Railway will auto-redeploy).

### 5. Update Frontend Socket Connection

Update `frontend/src/socket.js`:

```javascript
// Change from:
const socket = io("http://localhost:3000", {

// To:
const socket = io(import.meta.env.VITE_API_URL || "https://your-railway-backend-url.railway.app", {
```

### 6. Update Frontend API URL

Update `frontend/src/lib/axiosInstance.js`:

```javascript
// Change from:
baseURL: "http://localhost:3000",

// To:
baseURL: import.meta.env.VITE_API_URL || "https://your-railway-backend-url.railway.app",
```

### 7. Connect Custom Domain

**In Vercel:**

1. Go to your project → Settings → Domains
2. Add `bluffgrid.com` and `www.bluffgrid.com`
3. Vercel will show you DNS records to add

**In your domain registrar (Namecheap/GoDaddy):**

1. Go to DNS settings
2. Add these records:

   ```
   Type: A
   Host: @
   Value: 76.76.21.21 (Vercel's IP)

   Type: CNAME
   Host: www
   Value: cname.vercel-dns.com
   ```

3. Wait 24-48 hours for DNS propagation

---

## 🔒 Security Checklist Before Going Live

- [ ] Add `.env` files to `.gitignore` (never commit secrets!)
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS (Vercel/Railway do this automatically)
- [ ] Set up MongoDB user with limited permissions
- [ ] Update Firebase security rules

---

## 📦 Files to Update Before Deployment

### 1. Create `frontend/.env.production`:

```
VITE_API_URL=https://your-railway-backend-url.railway.app
```

### 2. Create `backend/.env`:

```
MONGO_URI=mongodb+srv://your-atlas-connection-string
PORT=3000
NODE_ENV=production
```

### 3. Add to `.gitignore`:

```
.env
.env.local
.env.production
```

---

## 🧪 Testing Checklist

After deployment, test:

- [ ] Homepage loads
- [ ] User can sign up/login
- [ ] User can create grids
- [ ] User can create rooms
- [ ] Multiplayer works (test with 2 devices)
- [ ] Voting system works
- [ ] Leaderboard displays correctly
- [ ] About page shows correctly

---

## 💰 Costs

- **Domain (bluffgrid.com)**: ~$10-15/year
- **MongoDB Atlas**: Free (500MB storage)
- **Vercel**: Free (hobby tier)
- **Railway**: Free ($5 credit/month, should cover small traffic)

**Total: ~$10-15/year** (just the domain!)

---

## 📈 Scaling Later (When You Get Popular)

If your game gets lots of traffic:

1. Upgrade Railway to paid plan (~$5-20/month)
2. Upgrade MongoDB Atlas if needed
3. Add CDN for faster loading
4. Add analytics (Google Analytics)

---

## 🆘 Need Help?

Common issues:

- **500 errors**: Check Railway logs for backend errors
- **CORS errors**: Make sure backend allows your frontend domain
- **Can't connect to MongoDB**: Check connection string and IP whitelist
- **Domain not working**: DNS takes time, wait 24-48 hours

---

## ✅ Quick Start Commands

**Before deploying, commit all changes:**

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

**Test production build locally:**

```bash
# Frontend
cd frontend
npm run build
npm run preview

# Backend
cd backend
npm start
```

Good luck with your deployment! 🎮🚀
