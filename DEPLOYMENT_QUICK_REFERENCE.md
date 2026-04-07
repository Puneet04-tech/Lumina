# ⚡ Deployment Quick Reference

## 🎯 One-Minute Overview

| Component | Platform | Cost | Auto-Deploy | URL |
|-----------|----------|------|------------|-----|
| **Frontend** (Next.js) | Netlify | FREE | ✅ Git Push | `*.netlify.app` |
| **Backend** (Express) | Render | FREE | ✅ Git Push | `*.onrender.com` |
| **Database** (MongoDB) | Atlas | FREE | ✅ Auto | Included |

---

## 📋 3-Step Deployment Checklist

### ✅ Step 1: Prepare (5 minutes)

- [ ] Create GitHub account (https://github.com)
- [ ] Create MongoDB Atlas account (https://mongodb.com/cloud/atlas)
- [ ] Create Netlify account (https://netlify.com)
- [ ] Create Render account (https://render.com)

### ✅ Step 2: Configure (15 minutes)

**MongoDB Atlas**:
```
1. Create M0 cluster
2. Create user: lumina_user / PASSWORD
3. Whitelist 0.0.0.0/0
4. Copy connection string
```

**GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```

### ✅ Step 3: Deploy (10 minutes)

**Netlify (Frontend)**:
- Connect GitHub → lumina-analytics
- Base dir: `client`
- Build: `npm run build`
- Publish: `.next`
- Env var: `NEXT_PUBLIC_API_URL=https://lumina-backend.onrender.com`

**Render (Backend)**:
- Connect GitHub → lumina-analytics
- Root dir: `server`
- Build: `npm install`
- Start: `npm start`
- Environment variables: (see table below)

---

## 🔐 Environment Variables

### Render (Backend)

```env
NODE_ENV=production
PORT=3500
MONGODB_URI=mongodb+srv://lumina_user:PASSWORD@cluster.mongodb.net/lumina?retryWrites=true
JWT_SECRET=(generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRY=7d
GEMINI_API_KEY=(optional)
CORS_ORIGIN=https://your-site.netlify.app
```

### Netlify (Frontend)

```env
NEXT_PUBLIC_API_URL=https://lumina-backend.onrender.com
```

---

## 🧪 Testing

After deployment:

```bash
# Test Frontend
curl https://YOUR-SITE.netlify.app

# Test Backend Health
curl https://lumina-backend.onrender.com/api/health

# Test Login
POST https://lumina-backend.onrender.com/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

---

## 🔄 Continuous Deployment

```bash
# Any git push automatically deploys both:
git add .
git commit -m "Feature: improved analytics"
git push origin main

# Frontend updates on Netlify ✅
# Backend updates on Render ✅
```

---

## 📊 URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | `https://lumina-XXXXX.netlify.app` |
| Backend | `https://lumina-backend.onrender.com` |
| API Health | `https://lumina-backend.onrender.com/api/health` |
| Login | `https://lumina-XXXXX.netlify.app/login` |
| Dashboard | `https://lumina-XXXXX.netlify.app/dashboard` |

---

## 🆘 Common Issues

| Issue | Fix |
|-------|-----|
| 500 Error on Login | Check CORS_ORIGIN matches Netlify URL |
| Can't upload files | Verify MongoDB connection string |
| Frontend blank | Check NEXT_PUBLIC_API_URL in Netlify env |
| Backend timeout | Increase Render timeout setting |

---

## ⬆️ Upgrading from Free

**When you need more capacity:**

- **Netlify Pro**: $19/month (more build minutes)
- **Render Starter**: $7/month (always-on server, no sleep)
- **MongoDB M2**: $57/month (10GB storage, higher limits)

---

## 📚 Full Documentation

For detailed step-by-step instructions, see: **DEPLOYMENT_NETLIFY_RENDER.md**

---

## ✨ You're Live!

```
Frontend: https://lumina-yoursite.netlify.app
Backend: https://lumina-backend.onrender.com

🚀 Production ready!
```
