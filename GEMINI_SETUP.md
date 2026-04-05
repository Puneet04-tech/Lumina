# Gemini AI Integration Setup Guide

## Overview
Lumina uses Google's Gemini Pro API for intelligent natural language data analysis. This guide walks through the configuration.

## Step 1: Get Your Gemini API Key

### Quick Start (Free)
1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Click **"Get API Key"** → **"Create API key in new project"**
3. Copy the generated API key
4. **⚠️ Keep this secret! Never commit it to GitHub**

### Requirements
- Free Gemini API allows up to **60 requests/minute**
- No credit card required for free tier
- Supports `gemini-pro` model (text analysis)

---

## Step 2: Configure Environment Variables

### For Development

**File:** `server/.env`

```bash
# Replace YOUR_GOOGLE_GEMINI_API_KEY with your actual key
GOOGLE_GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-pro
```

**Example (don't use):**
```bash
GOOGLE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_MODEL=gemini-pro
```

### For Production (Render)

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your service → **Environment**
3. Add environment variables:
   - Key: `GOOGLE_GEMINI_API_KEY`
   - Value: `YOUR_API_KEY_HERE`
4. Deploy again

---

## Step 3: Test the Integration

### Test via API
```bash
curl -X POST http://localhost:3500/api/analysis/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "Show top 5 products by revenue",
    "fileId": "YOUR_FILE_ID"
  }'
```

### Test in UI
1. Upload a CSV file
2. Type query: **"Show top 5 products by revenue"**
3. Click **"Analyze"**
4. Should see chart generated with AI recommendations

---

## Step 4: Verify It's Working

✅ **Working indicators:**
- Query results appear with chart
- Statistics are calculated
- No error messages in console
- PDF/Excel export works

❌ **Troubleshooting:**

| Issue | Solution |
|-------|----------|
| "Gemini API key not configured" | Add `GOOGLE_GEMINI_API_KEY` to `.env` and restart server |
| 429 Too Many Requests | You've exceeded rate limit. Wait a minute or upgrade plan |
| Invalid API key | Double-check key from https://aistudio.google.com/app/apikey |
| 401 Unauthorized | API key format incorrect. Copy fresh key from AI Studio |

---

## Step 5: Query Examples

Try these in the "Ask a Question" field:

**Aggregation:**
- "Show sales by category"
- "Top 10 products by revenue"
- "Total sales by region"

**Analytics:**
- "What is the average order value?"
- "Show trend over time"
- "Compare B2B vs B2C sales"

**Insights:**
- "Which region performed best?"
- "What products have highest rating?"
- "Show correlation between quantity and rating"

---

## Rate Limits & Free Tier

**Free Plan:** 60 requests/minute
- ✅ Good for: Development, testing, small teams
- ❌ Not for: Production with high traffic

**Scale Up:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable billing
3. Increase rate limits
4. Update API key in `.env`

---

## Security Best Practices

⚠️ **NEVER:**
- Commit API key to GitHub
- Share key in chat/email
- Use same key across multiple projects

✅ **DO:**
- Store in `.env` file (already in `.gitignore`)
- Regenerate key if compromised
- Use different keys per environment (dev/prod)
- Rotate keys quarterly

---

## Advanced: Fallback Behavior

If Gemini API unavailable:
- Falls back to rule-based analysis ✅
- Still generates charts ✅
- Still exports data ✅

See `server/src/utils/aiHelper.js` for implementation.

---

## Support

**Issues?**
1. Check `.env` has `GOOGLE_GEMINI_API_KEY`
2. Verify key at https://aistudio.google.com/app/apikey
3. Check server logs: `npm run dev`
4. See `server/src/controllers/analysisController.js`

