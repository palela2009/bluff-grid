# 🚀 Quick Deployment Checklist

## ✅ Files Prepared
- [x] Updated `socket.js` to use environment variables
- [x] Updated `axiosInstance.js` to use environment variables
- [x] Updated CORS in `server.js` to allow production domains
- [x] Created `.env.example` files for both frontend and backend
- [x] Updated `.gitignore` to protect secrets

## 📝 Before You Deploy

### 1. Test Locally
```bash
# Make sure everything works
cd frontend
npm run dev

cd backend
npm start
```

### 2. Create Production Environment Files

**Backend `.env`:**
```env
MONGO_URI=your-mongodb-atlas-connection-string
PORT=3000
NODE_ENV=production
```

**Frontend `.env.production`:**
```env
VITE_API_URL=https://your-railway-backend-url.railway.app
```

### 3. Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment to bluffgrid.com"
git push origin main
```

## 🌐 Deployment Steps

### Step 1: MongoDB Atlas (5 minutes)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Save as `MONGO_URI`

### Step 2: Deploy Backend to Railway (10 minutes)
1. Go to https://railway.app
2. Deploy from GitHub
3. Set environment variables:
   - `MONGO_URI` = your MongoDB connection string
   - `PORT` = 3000
   - `NODE_ENV` = production
4. Copy your Railway URL (e.g., `https://bluff-grid-backend.up.railway.app`)

### Step 3: Deploy Frontend to Vercel (10 minutes)
1. Go to https://vercel.com
2. Import from GitHub
3. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable:
   - `VITE_API_URL` = your Railway backend URL

### Step 4: Connect Domain (24-48 hours)
1. Buy `bluffgrid.com` from Namecheap/GoDaddy
2. In Vercel: Add custom domain
3. Update DNS records at your registrar
4. Wait for DNS propagation

## 🧪 Post-Deployment Testing

After deployment, test these:
- [ ] Can visit https://bluffgrid.com
- [ ] Can sign up/login
- [ ] Can create grids
- [ ] Can create and join rooms
- [ ] Multiplayer works (test with phone)
- [ ] Game finishes correctly
- [ ] Leaderboard shows
- [ ] About page works

## 💰 Expected Costs

- Domain: $10-15/year
- MongoDB: Free
- Vercel: Free
- Railway: Free (with $5/month credit)

**Total: ~$12/year**

## 🆘 Troubleshooting

**Can't connect to backend:**
- Check Railway logs
- Verify `VITE_API_URL` is correct
- Check CORS settings

**Database errors:**
- Verify MongoDB connection string
- Check IP whitelist (allow all: 0.0.0.0/0)

**Domain not working:**
- Wait 24-48 hours for DNS
- Check DNS records are correct
- Try clearing browser cache

## 📞 Support

If you get stuck:
1. Check Railway/Vercel logs
2. Check browser console for errors
3. Review the full DEPLOYMENT.md guide

Good luck! 🎮
