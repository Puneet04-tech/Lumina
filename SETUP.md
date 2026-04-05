# Development Setup Guide

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Puneet04-tech/Lumina.git
cd Lumina
```

### 2. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/lumina
# OR MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lumina

# JWT
JWT_SECRET=your_super_secret_key_change_in_production

# Google Gemini (Free tier available)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Start development server
npm run dev

# Server will run on http://localhost:5000
```

### 4. Frontend Setup

Open new terminal:

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will run on http://localhost:3000
```

## Testing Features

### Create Test Account

1. Visit http://localhost:3000
2. Click Register
3. Fill in credentials (e.g., test@lumina.com / password123)

### Upload CSV File

1. Login with test account
2. Click "Upload File"
3. Select any CSV file (sample data)

Example CSV format:

```csv
Product,Region,Sales,Quantity
Laptop,North,50000,10
Mouse,South,5000,200
Keyboard,East,12000,100
```

### Generate Charts

1. Click "Analyze" on uploaded file
2. Click chart type buttons (Bar, Line, Pie, Area)
3. Ask AI questions in query box

### Save Dashboard

1. After analysis, click "Save Dashboard"
2. Enter name and insights
3. View in "Dashboards" page

## API Endpoints Reference

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Files

- `POST /api/files/upload` - Upload CSV
- `GET /api/files` - List user files
- `GET /api/files/:id` - Get file data
- `DELETE /api/files/:id` - Delete file

### Analysis

- `POST /api/analysis/query` - AI query analysis
- `GET /api/analysis/dashboards` - List dashboards
- `POST /api/analysis/dashboards` - Save dashboard
- `DELETE /api/analysis/dashboards/:id` - Delete dashboard

### Export

- `POST /api/export/pdf` - Export to PDF
- `POST /api/export/excel` - Export to Excel
- `POST /api/export/dashboard-pdf` - Export dashboard

## Database

### Models

**User**

```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: 'viewer' | 'analyst' | 'admin',
  createdAt: Date
}
```

**File**

```javascript
{
  name: String,
  originalName: String,
  data: Array,
  columns: Array,
  userId: ObjectId,
  createdAt: Date
}
```

**Dashboard**

```javascript
{
  name: String,
  insights: String,
  charts: Array,
  userId: ObjectId,
  fileId: ObjectId,
  createdAt: Date
}
```

## Useful Commands

### Backend

```bash
cd server

# Development with auto-reload
npm run dev

# Start production
npm start

# Check health
curl http://localhost:5000/api/health
```

### Frontend

```bash
cd client

# Development
npm run dev

# Build production
npm build

# Start production build
npm start

# Lint code
npm run lint
```

### Git

```bash
# Commit changes
git add -A
git commit -m "feat: your feature"

# Push to GitHub
git push origin main

# View logs
git log --oneline
```

## Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongod --version

# For Atlas, verify connection string in .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lumina
```

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Authentication Issues

```bash
# Clear localStorage
localStorage.clear()
# Refresh page
```

## Development Workflow

1. Create feature branch: `git checkout -b feat/feature-name`
2. Make changes and test locally
3. Commit: `git add -A && git commit -m "feat: description"`
4. Push: `git push origin feat/feature-name`
5. Create Pull Request on GitHub
6. Merge to main after review

## Next Steps

1. Add more chart types
2. Implement real-time collaboration
3. Add data source connectors
4. Create mobile app
5. Add advanced analytics

## Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/api.html)
- [MongoDB Docs](https://docs.mongodb.com)
- [Recharts Gallery](https://recharts.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

Happy coding! 🚀
