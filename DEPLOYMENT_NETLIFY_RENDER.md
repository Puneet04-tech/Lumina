# 🚀 Deployment Guide - Netlify & Render

This guide walks you through deploying the Lumina Analytics Dashboard on **Netlify** (Frontend) and **Render** (Backend).

---

## 📋 Prerequisites

1. **GitHub Account** - Repository must be pushed to GitHub
2. **Netlify Account** - https://netlify.com (free tier available)
3. **Render Account** - https://render.com (free tier available)
4. **MongoDB Atlas Account** - https://www.mongodb.com/cloud/atlas (free tier: M0 cluster)

---

## Phase 1: Prepare MongoDB Atlas

### Step 1.1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://account.mongodb.com/account/login)
2. Create a new project or use existing
3. Click **"Create a Database"**
4. Select **"M0 Free"** tier
5. Choose your region (closest to your users)
6. Create a database user:
   - Username: `lumina_user`
   - Password: Generate strong password (save it!)
7. Allow network access: Add **0.0.0.0/0** (allows all IPs)
8. Click **"Finish and Close"**

### Step 1.2: Get Connection String

1. In MongoDB Atlas, click **"Connect"**
2. Select **"Drivers"**
3. Copy the connection string (looks like: `mongodb+srv://username:password@...`)
4. Replace `<password>` with your actual password
5. **Save this** - you'll need it for Render

---

## Phase 2: Deploy Frontend to Netlify

### Step 2.1: Push Code to GitHub

```bash
cd d:\Lumina

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment setup"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/lumina-analytics.git
git branch -M main
git push -u origin main
```

### Step 2.2: Connect Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authenticate
4. Select your **lumina-analytics** repository
5. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Click **"Deploy site"**

### Step 2.3: Set Environment Variables (Netlify)

1. Go to your Netlify site **Settings** → **Build & Deploy** → **Environment**
2. Add these environment variables:
   ```
   NEXT_PUBLIC_API_URL = https://lumina-backend.onrender.com
   NODE_ENV = production
   ```
3. Redeploy: Click **"Deploys"** → **"Trigger deploy"** → **"Deploy site"**

### Step 2.4: Get Your Netlify URL

- Your site will have a URL like: `https://lumina-xxxxx.netlify.app`
- Save this URL for Render CORS configuration

---

## Phase 3: Deploy Backend to Render

### Step 3.1: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"+ New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `lumina-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
   - **Region**: Choose closest to MongoDB

### Step 3.2: Add Environment Variables (Render)

In Render dashboard, go to **Environment**:

```
PORT = 3500
NODE_ENV = production
MONGODB_URI = mongodb+srv://lumina_user:YOUR_PASSWORD@cluster.mongodb.net/lumina?retryWrites=true&w=majority
JWT_SECRET = (Generate random 32+ char string)
JWT_EXPIRY = 7d
GEMINI_API_KEY = (Optional - your Gemini API key)
GEMINI_MODEL = gemini-pro
CORS_ORIGIN = https://your-netlify-site.netlify.app
FRONTEND_URL = https://your-netlify-site.netlify.app
```

**To generate JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3.3: Deploy

1. Click **"Create Web Service"**
2. Render will auto-deploy when code is pushed to main
3. Your backend URL will be: `https://lumina-backend.onrender.com`

### Step 3.4: Verify Backend

Once deployed:
```
https://lumina-backend.onrender.com/api/health
```
Should return: `{ status: "Server is running", timestamp: "..." }`

---

## Phase 4: Update URLs

### Update Frontend API URL

If you need to change the API URL later:

1. In Netlify: **Site Settings** → **Build & Deploy** → **Environment**
2. Update `NEXT_PUBLIC_API_URL` to your Render backend URL
3. Trigger redeploy

### Update Backend CORS

If frontend URL changed:

1. In Render: **Environment** → Edit `CORS_ORIGIN`
2. Set to your Netlify URL
3. Service auto-restarts

---

## 🧪 Testing After Deployment

### 1. Test Frontend Loading
```
https://your-site.netlify.app
```
Should load the login page without errors.

### 2. Test Backend API
```
GET https://lumina-backend.onrender.com/api/health
```
Should return status 200.

### 3. Test Login
- Email: `test@example.com`
- Password: `password123`

### 4. Test File Upload
- Upload a CSV file
- Verify it processes without errors

### 5. Test Analysis Query
- Run query on uploaded data
- Check ultra-advanced insights generate

---

## 📊 Database Backups

### Enable MongoDB Backups (Atlas)

1. Go to MongoDB Atlas
2. Select your cluster → **Backup**
3. Enable **Automated Backups**
4. Set retention to 7 days (free tier)

### Export Data Manually

```bash
# Install mongodump (part of MongoDB tools)
# Then run:
mongodump --uri "your_connection_string" --out ./backups
```

---

## 🔐 Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Strong JWT_SECRET generated
- [ ] Environment variables set on Render
- [ ] CORS origin configured correctly
- [ ] Frontend URL environment variable set
- [ ] Backend health check passing
- [ ] Test account login working
- [ ] File upload working
- [ ] Analysis queries returning data
- [ ] Backups enabled on MongoDB

---

## 🚨 Common Issues & Solutions

### Issue: 500 Error on Login
**Solution**: Check CORS_ORIGIN in Render environment matches your Netlify URL exactly

### Issue: MongoDB Connection Timeout
**Solution**: 
1. Check MongoDB URI is correct
2. Verify credentials haven't changed
3. Check IP whitelist in MongoDB Atlas (should be 0.0.0.0/0)

### Issue: Frontend Can't Reach Backend
**Solution**: 
1. Verify `NEXT_PUBLIC_API_URL` in Netlify matches Render URL
2. Trigger Netlify redeploy to update build

### Issue: CSV Upload Fails
**Solution**: 
1. Check file size limit (should be 50MB)
2. Verify CSV format is valid
3. Check server logs on Render

---

## 📈 Scaling & Optimization

### When You're Ready to Upgrade

**Frontend (Netlify)**:
- Free tier is great for MVP
- Pro plan ($19/mo) for more build minutes

**Backend (Render)**:
- Free tier has 15-minute inactivity sleep
- Starter plan ($7/mo) for always-on server
- PostgreSQL/MongoDB databases available

**Database (MongoDB Atlas)**:
- Free M0 cluster: 512 MB storage
- M2 ($57/month): 10 GB storage, 3 AZs
- Auto-scaling available on paid tiers

---

## 🔄 Continuous Deployment

Both Netlify and Render automatically deploy on `git push to main`:

```bash
git add .
git commit -m "Feature: improved analytics"
git push origin main
# Both services auto-deploy! ✨
```

---

## 📞 Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Help**: https://docs.atlas.mongodb.com
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## ✅ Deployment Complete!

Once all steps are complete:
- Frontend running on Netlify
- Backend running on Render
- Database backed by MongoDB Atlas
- Automatic deployments on git push
- Production-ready application! 🎉

For questions or issues, check the respective documentation or contact support.
