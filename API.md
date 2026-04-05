# Lumina API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://lumina-api.onrender.com/api
```

## Authentication

All requests (except auth endpoints) require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## Auth Endpoints

### Register User

**POST** `/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "analyst"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "email": "john@example.com",
    "role": "analyst"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User

**GET** `/auth/me`

**Response:**

```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "analyst"
  }
}
```

### Logout

**POST** `/auth/logout`

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## File Endpoints

### Upload CSV File

**POST** `/files/upload`

- Content-Type: `multipart/form-data`
- Field name: `file`
- Supported: CSV files only, max 50MB

**Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "_id": "file_id",
    "originalName": "sales_data.csv",
    "size": 215430,
    "columns": ["Product", "Region", "Sales", "Quantity"],
    "rowCount": 500
  }
}
```

### Get Files List

**GET** `/files`

**Response:**

```json
{
  "success": true,
  "files": [
    {
      "_id": "file_id",
      "originalName": "sales_data.csv",
      "size": 215430,
      "columns": ["Product", "Region", "Sales"],
      "rowCount": 500,
      "uploadedAt": "2024-04-05T10:30:00Z"
    }
  ]
}
```

### Get File Data

**GET** `/files/:id`

**Response:**

```json
{
  "success": true,
  "file": {
    "_id": "file_id",
    "originalName": "sales_data.csv",
    "columns": ["Product", "Region", "Sales"],
    "data": [
      { "Product": "Laptop", "Region": "North", "Sales": 50000 },
      { "Product": "Mouse", "Region": "South", "Sales": 5000 }
    ]
  }
}
```

### Delete File

**DELETE** `/files/:id`

**Response:**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## Analysis Endpoints

### Query Analysis

**POST** `/analysis/query`

```json
{
  "query": "Top 5 products by sales",
  "fileId": "file_id"
}
```

**Response:**

```json
{
  "success": true,
  "results": {
    "query": "Top 5 products by sales",
    "processed": {
      "operation": "top",
      "limit": 5,
      "targetColumn": "Product"
    },
    "ai": {
      "success": true,
      "analysis": {
        "insight": "Products show strong sales variation",
        "recommendation": "Focus on high performers",
        "chartType": "bar",
        "confidence": 0.95
      }
    },
    "charts": [
      {
        "type": "bar",
        "data": [
          { "name": "Laptop", "value": 250000 },
          { "name": "Desktop", "value": 180000 }
        ],
        "title": "Sales by Product"
      }
    ]
  }
}
```

### Save Dashboard

**POST** `/analysis/dashboards`

```json
{
  "name": "Q1 Sales Analysis",
  "fileId": "file_id",
  "charts": [
    {
      "type": "bar",
      "data": [],
      "title": "Sales by Region"
    }
  ],
  "insights": "Strong Q1 performance across all regions"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Dashboard saved successfully",
  "dashboard": {
    "_id": "dashboard_id",
    "name": "Q1 Sales Analysis",
    "insights": "Strong Q1 performance",
    "charts": [],
    "createdAt": "2024-04-05T10:30:00Z"
  }
}
```

### Get Dashboards

**GET** `/analysis/dashboards`

**Response:**

```json
{
  "success": true,
  "dashboards": [
    {
      "_id": "dashboard_id",
      "name": "Q1 Sales Analysis",
      "insights": "Strong performance",
      "charts": []
    }
  ]
}
```

### Delete Dashboard

**DELETE** `/analysis/dashboards/:id`

**Response:**

```json
{
  "success": true,
  "message": "Dashboard deleted successfully"
}
```

---

## Export Endpoints

### Export to PDF

**POST** `/export/pdf`

```json
{
  "fileId": "file_id"
}
```

### Export to Excel

**POST** `/export/excel`

```json
{
  "fileId": "file_id"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid input data"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

- API is rate-limited to 100 requests per minute per IP
- Exceeding limit returns 429 Too Many Requests

---

## Webhooks (Coming Soon)

- File upload completion
- Dashboard creation
- Analysis completion

---

## SDK & Client Libraries

### JavaScript/Node.js

```javascript
import api from '@/utils/api';

// Login
const login = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});

// Upload file
const formData = new FormData();
formData.append('file', file);
const upload = await api.post('/files/upload', formData);

// Query analysis
const analysis = await api.post('/analysis/query', {
  query: 'Show top products',
  fileId: 'file_id'
});
```

---

## Rate Limits

- Standard: 100 req/min
- Premium: 1000 req/min
- Enterprise: Unlimited

---

## Support

For API support:
- Email: api-support@lumina.dev
- Discord: [Join Server]
- GitHub Issues: [Report Bug]

---

## Changelog

### v1.0.0 (Current)

- ✓ Authentication
- ✓ File upload
- ✓ Analysis
- ✓ Export
- 🔄 Webhooks (Coming)
- 🔄 Real-time (Coming)

---

Last Updated: April 5, 2024
