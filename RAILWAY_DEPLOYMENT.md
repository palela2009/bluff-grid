# 🚀 Deploy EVERYTHING to Railway (Easiest Method!)

Railway can host BOTH frontend and backend in one place - much simpler than Netlify!

---

## 📋 Prerequisites

1. **MongoDB Atlas account** (free)
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a cluster
   - Get your connection string

2. **GitHub repository** (you have this ✅)
   - Your code is already on GitHub

3. **Railway account** (free)
   - Sign up at https://railway.app with GitHub

---

## 🎯 Step-by-Step Deployment (15 minutes)

### Step 1: Setup MongoDB Atlas (5 minutes)

1. Go to https://cloud.mongodb.com/
2. Sign in → Create new cluster (FREE M0 tier)
3. Choose **AWS** provider (fastest)
4. Create cluster (takes 2-3 minutes)
5. Click **"Connect"** → **"Connect your application"**
6. Copy connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/
   ```
7. **Important**: Replace `<password>` with your actual password!
8. **Whitelist all IPs**: Network Access → Add IP → `0.0.0.0/0` (allow from anywhere)

✅ Save your connection string - you'll need it!

---

### Step 2: Deploy Backend to Railway (5 minutes)

1. Go to https://railway.app/
2. Click **"Login"** → Sign in with GitHub
3. Click **"New Project"**
4. Click **"Deploy from GitHub repo"**
5. Select **"bluff-grid"** repository
6. Railway detects Node.js automatically ✅

**Configure Backend Service:**

7. Railway creates a service - click on it
8. Click **"Settings"** tab
9. Set **Root Directory**: `backend`
10. Set **Start Command**: `npm start` (should be auto-detected)

**Add Environment Variables:**

11. Click **"Variables"** tab
12. Click **"New Variable"**
13. Add these three variables:

   ```
   MONGO_URI
   Value: mongodb+srv://your-connection-string-from-step-1
   
   PORT
   Value: 3000
   
   NODE_ENV
   Value: production
   ```

14. Click **"Deploy"** (Railway auto-deploys)
15. Wait 2-3 minutes for deployment
16. Click **"Settings"** → **"Networking"** → **"Generate Domain"**
17. **COPY THIS URL!** (like: `https://bluff-grid-production-xxxx.up.railway.app`)

✅ Backend is live!

---

### Step 3: Deploy Frontend to Railway (5 minutes)

Now add the frontend to the SAME project:

1. In Railway dashboard, click **"New"** → **"GitHub Repo"** (in the same project)
2. Select **"bluff-grid"** again
3. Railway creates a second service

**Configure Frontend Service:**

4. Click on the NEW service (the second one)
5. Click **"Settings"** tab
6. Set **Root Directory**: `frontend`
7. Set **Build Command**: `npm run build`
8. Set **Start Command**: `npm run preview`

**Add Environment Variable:**

9. Click **"Variables"** tab
10. Add this variable:
    ```
    VITE_API_URL
    Value: https://your-backend-url-from-step-2.railway.app
    ```

11. Click **"Settings"** → **"Networking"** → **"Generate Domain"**
12. **COPY YOUR FRONTEND URL!** (like: `https://bluff-grid-frontend-xxxx.up.railway.app`)

✅ Frontend is live!

---

### Step 4: Update Backend CORS (2 minutes)

Your frontend URL needs to be allowed in backend:

1. In Railway, go to your **backend service**
2. Click **"Variables"**
3. Add one more variable:
   ```
   FRONTEND_URL
   Value: https://your-frontend-url.railway.app
   ```
4. Railway auto-redeploys

Or manually update `server.js` and push to GitHub:
```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "https://your-frontend-url.railway.app", // Add your Railway frontend URL
  /\.railway\.app$/ // Allow all Railway domains
];
```

---

## 🎮 Test Your Deployed Game!

1. Visit your frontend URL: `https://bluff-grid-frontend-xxxx.up.railway.app`
2. Test everything:
   - [ ] Site loads
   - [ ] Can sign up/login
   - [ ] Can create grids
   - [ ] Can create/join rooms
   - [ ] Multiplayer works (test with 2 devices/browsers)
   - [ ] Game completes
   - [ ] Leaderboard shows

---

## 🎯 Connect Custom Domain (Optional)

If you have **bluffgrid.com**:

1. In Railway → Frontend service → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Add: `bluffgrid.com`
4. Railway shows you DNS records

In your domain registrar:
```
Type: CNAME
Name: @
Value: your-app.railway.app
```

Wait 24-48 hours for DNS propagation.

---

## 💰 Cost

- **Railway**: FREE ($5 credit/month)
  - Enough for ~500 hours of backend runtime
  - Perfect for small traffic
  - When you grow: $5-20/month
- **MongoDB**: FREE (512MB)
- **Total**: $0/month! 🎉

---

## 🔄 Updating Your Game

Railway auto-deploys when you push to GitHub!

```bash
git add .
git commit -m "Update game"
git push origin main
```

Railway automatically rebuilds and deploys both services! 🚀

---

## 🐛 Troubleshooting

### Backend won't start:
- Check Railway logs: Backend service → "Deployments" → Click on deployment → "View Logs"
- Verify MONGO_URI is correct
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)

### Frontend can't connect to backend:
- Verify VITE_API_URL is set correctly
- Check backend CORS allows your frontend URL
- Check browser console for errors

### "Cannot connect to MongoDB":
- MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0
- Check MONGO_URI format
- Make sure password doesn't have special characters (or URL encode them)

---

## 📊 Railway Dashboard

**Monitor your app:**
- **Deployments**: See build logs
- **Metrics**: CPU/Memory usage
- **Logs**: Real-time application logs
- **Variables**: Update environment variables

---

## ✅ Complete Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Connection string copied
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Railway
- [ ] Environment variables set
- [ ] Both services have generated domains
- [ ] CORS updated with frontend URL
- [ ] Game tested and working
- [ ] Custom domain connected (optional)

---

## 🎉 Your Game is Live!

**Frontend**: https://your-frontend.railway.app  
**Backend**: https://your-backend.railway.app

Share with friends and have fun! 🎮

---

## 📝 Notes

- Railway free tier gives you $5/month credit
- Each service uses ~$0.01/hour when active
- Sleep mode activates after inactivity (free tier)
- Upgrade to Hobby plan ($5/month) for always-on services

---

Need help? Check Railway logs or open the browser console (F12) for errors!
