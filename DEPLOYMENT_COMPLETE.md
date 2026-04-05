# Complete Deployment Guide - Lumina AI Dashboard

## Overview
Deploy Lumina to production in **30 minutes** with Vercel (frontend) + Render (backend).

---

## Prerequisites

✅ GitHub account
✅ Vercel account (free - https://vercel.com)
✅ Render account (free - https://render.com)
✅ MongoDB Atlas account (completed ✅)
✅ Google Gemini API key (see GEMINI_SETUP.md)

---

## Part 1: Deploy Frontend to Vercel

### Step 1: Connect GitHub to Vercel

1. Go to **https://vercel.com**
2. Click **"New Project"**
3. Select **"Import Git Repository"**
4. Search for **"Lumina"** repo
5. Click **"Import"**

### Step 2: Configure Environment Variables

On the Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add:

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

Replace `your-backend` with your Render service name.

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. ✅ Frontend live at: `https://lumina-yourname.vercel.app`

---

## Part 2: Deploy Backend to Render

### Step 1: Create Render Web Service

1. Go to **https://render.com**
2. Click **"New"** → **"Web Service"**
3. Select **"Deploy from GitHub"**
4. Search for **"Lumina"** repo
5. Click **"Connect"**

### Step 2: Configure Service

Set these options:

| Setting | Value |
|---------|-------|
| **Name** | lumina-backend |
| **Environment** | Node |
| **Region** | Choose closest to you |
| **Branch** | main |
| **Build Command** | `cd server && npm install` |
| **Start Command** | `cd server && npm run dev` |

### Step 3: Add Environment Variables

1. Go to **Environment** tab
2. Add variables:

```
PORT=3500
MONGODB_URI=mongodb+srv://...  (copy from .env)
JWT_SECRET=your_secret_key_change_in_production_12345
JWT_EXPIRY=7d
GOOGLE_GEMINI_API_KEY=your_gemini_key_from_ai_studio
GEMINI_MODEL=gemini-pro
NODE_ENV=production
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. ✅ Backend live at: `https://lumina-backend.onrender.com`
4. Copy URL for Vercel step 2 above

---

## Part 3: Update and Verify

### Update Frontend with Backend URL

1. Go to Vercel dashboard
2. **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to match Render service URL
4. Redeploy: **Deployments** → **Redeploy** latest

### Test Production

1. Go to: `https://lumina-yourname.vercel.app`
2. Test workflow:
   - ✅ Register account
   - ✅ Login
   - ✅ Upload CSV
   - ✅ Generate charts
   - ✅ Try AI query
   - ✅ Export PDF/Excel
   - ✅ Save dashboard

---

## Verification Checklist

- [ ] Frontend loads without errors
- [ ] Can login/register
- [ ] CSV upload works
- [ ] Charts generate
- [ ] AI queries process
- [ ] PDF/Excel export works
- [ ] Dashboards save
- [ ] No console errors
- [ ] API calls use correct domain

---

## Troubleshooting

### "Backend connection failed"
```
❌ Error: CORS / API 404
✅ Fix: Verify NEXT_PUBLIC_API_URL in Vercel environment variables
       Ensure it includes /api suffix
```

### "CSV upload fails"
```
❌ Error: 413 Payload Too Large
✅ Fix: Backend multipart limit is 50MB, upload smaller files
```

### "Gemini API not working"
```
❌ Error: "API key not configured"
✅ Fix: Add GOOGLE_GEMINI_API_KEY to Render environment
       Restart service after adding
```

### "Database connection error"
```
❌ Error: "MongoNetworkError"
✅ Fix: Check MONGODB_URI IP whitelist on MongoDB Atlas
       Add 0.0.0.0/0 if using Render
```

---

## Performance Optimization

### Frontend (Vercel)

- Image optimization: ✅ Built-in
- Code splitting: ✅ Automatic
- Edge caching: ✅ Auto 1 year for static

### Backend (Render)

- Database: Use MongoDB Atlas (cloud)
- Scaling: Upgrade plan as needed
- Monitoring: Free basic monitoring included

---

## Cost Breakdown

| Service | Free Tier | Suitable For |
|---------|-----------|--------------|
| **Vercel** | ✅ Yes | Up to 100GB bandwidth/month |
| **Render** | ✅ Yes (auto-spins down) | Dev/testing (shared CPU) |
| **MongoDB Atlas** | ✅ Yes | Up to 512MB data |
| **Gemini API** | ✅ Yes | 60 req/min |
| **TOTAL** | **$0/month** | Small team/startup |

**To handle production traffic, upgrade to Paid:**
- Render: $12/month → dedicated CPU
- Vercel: Already includes generous free tier
- MongoDB: $9/month → 10GB, dedicated

---

## Security Checklist

- [ ] JWT_SECRET is strong (change from default)
- [ ] GOOGLE_GEMINI_API_KEY is secret (not in git)
- [ ] MongoDB user/password is unique
- [ ] Production environment variables set
- [ ] CORS configured correctly
- [ ] API uses HTTPS (automatic with Vercel/Render)

---

## Monitoring & Maintenance

### Weekly
- Check Vercel logs for errors
- Check Render logs for crashes
- Monitor MongoDB usage

### Monthly
- Review analytics
- Update dependencies: `npm update`
- Backup MongoDB (Atlas auto-backups)

### Quarterly
- Rotate JWT_SECRET
- Audit user permissions
- Review API logs for abuse

---

## Next Steps (After Deployment)

1. **Add Custom Domain**
   - Vercel: Settings → Domains
   - Render: Settings → Custom Domain
   
2. **Enable CORS for specific domain**
   ```javascript
   // server/src/index.js
   app.use(cors({
     origin: process.env.FRONTEND_URL || '*',
     credentials: true
   }));
   ```

3. **Set up daily monitoring**
   - Vercel: Alerts for failed deployments
   - Render: Alert for service down

4. **Implement user feedback flow**
   - Add bug report form
   - Set up email notifications

---

## Support Resources

**Documentation:**
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs
- MongoDB: https://docs.mongodb.com
- Gemini: https://ai.google.dev/docs

**Issues?**
1. Check logs: Vercel/Render dashboard
2. Check environment variables
3. Check MongoDB Atlas connection
4. Review CORS settings

---

## Quick Reference

**Frontend URL:** `https://lumina-[your-name].vercel.app`
**Backend URL:** `https://lumina-backend.onrender.com`
**MongoDB:** `mongodb+srv://...` (from Atlas)
**Gemini Key:** Get from https://aistudio.google.com/app/apikey

---

**🎉 Congratulations! Lumina is now live in production!**

Next: Share with users, collect feedback, iterate.

