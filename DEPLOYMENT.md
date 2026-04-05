# Lumina Deployment Guide

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key
- Vercel account (for frontend)
- Render/Railway account (for backend)

## Backend Deployment (Render)

### 1. Prepare Repository

```bash
# Push all changes to GitHub
git push origin main
```

### 2. Deploy to Render

1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create new Web Service
4. Configure:
   - **Name**: lumina-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `server`

### 3. Environment Variables

Add in Render dashboard:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lumina
JWT_SECRET=your_secret_key_here
GOOGLE_GEMINI_API_KEY=your_api_key_here
NODE_ENV=production
PORT=5000
```

### 4. Deploy

Push to GitHub, Render will automatically deploy.

---

## Frontend Deployment (Vercel)

### 1. Prepare Repository

```bash
cd client
# All files are already in place
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Import project
4. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Environment Variables

Add in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

### 4. Deploy

Vercel will automatically build and deploy on GitHub push.

---

## MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create cluster
3. Create database user with password
4. Get connection string
5. Update in `.env` files:

```
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/lumina
```

---

## Google Gemini API Setup

1. Go to [ai.google.dev](https://ai.google.dev)
2. Create project
3. Generate API key
4. Add to environment variables

---

## Verification Checklist

- [ ] Backend deploying without errors
- [ ] Frontend connecting to backend API
- [ ] MongoDB connections working
- [ ] Authentication flowing properly
- [ ] File uploads working
- [ ] AI queries returning results
- [ ] Dashboards saving and loading

---

## Troubleshooting

### Backend Issues

```bash
# Check logs
pm logs backend

# Test connection
curl https://your-backend-url.onrender.com/api/health
```

### Frontend Issues

```bash
# Clear cache
rm -rf .next
npm run build
```

### Database Issues

```bash
# Verify connection string
echo $MONGODB_URI
```

---

## Performance Optimization

- Enable CORS for frontend domain only
- Use MongoDB indexing for frequently queried fields
- Cache API responses in frontend
- Implement pagination for large datasets
- Use CDN for static assets

---

## Security Checklist

- [ ] JWT secret is strong (>32 characters)
- [ ] CORS configured properly
- [ ] Environment variables not exposed
- [ ] Rate limiting enabled
- [ ] Input validation on server
- [ ] HTTPS enabled everywhere
- [ ] MongoDB access restricted by IP

---

## Support

For issues, check logs at:
- Backend: Render dashboard
- Frontend: Vercel dashboard
- Database: MongoDB Atlas dashboard
