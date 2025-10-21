# API Configuration Guide

## API URL Structure

The backend API follows RESTful conventions with all endpoints prefixed with `/api/v1/`:

### Backend Endpoints

| Resource | Endpoint Pattern | Example |
|----------|-----------------|---------|
| Orders | `/api/v1/orders` | GET /api/v1/orders |
| Order Documents | `/api/v1/orders/{order_id}/documents/` | GET /api/v1/orders/123/documents/ |
| Drivers | `/api/v1/drivers` | GET /api/v1/drivers |
| Trucks | `/api/v1/trucks` | GET /api/v1/trucks |
| Trailers | `/api/v1/trailers` | GET /api/v1/trailers |
| Terminals | `/api/v1/terminals` | GET /api/v1/terminals |
| Health | `/api/v1/health` | GET /api/v1/health |

## Frontend API Configuration

The frontend automatically configures the API URL based on environment variables.

### Configuration File: `frontend/demo-app/src/utils/config.ts`

```typescript
api: {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  ...
}
```

## Running Scenarios

### 1. Full Docker Stack (Recommended)

```bash
docker-compose up --build
```

**URLs:**
- Frontend: http://localhost (via nginx)
- API (via nginx): http://localhost/api/v1/
- API (direct): http://localhost:8000/api/v1/

**Frontend uses:** `/api/v1` (relative URL, proxied by nginx)

### 2. Frontend Development with Docker Backend

```bash
# Terminal 1: Start backend with Docker
docker-compose up backend database redis

# Terminal 2: Start frontend dev server
cd frontend/demo-app
npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- API: http://localhost:8000/api/v1/

**Frontend uses:** `http://localhost:8000/api/v1` (from .env.development)

### 3. Production Deployment

When building for production, the frontend is configured to use relative URLs:

```dockerfile
# In frontend/demo-app/Dockerfile
ENV VITE_API_BASE_URL=/api/v1
```

This allows the frontend to work with any domain when served behind nginx.

## Environment Files

### `.env` (Default)
```env
VITE_API_BASE_URL=http://localhost/api/v1
```

### `.env.development` (Local Development)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### `.env.production` (Production Build)
```env
VITE_API_BASE_URL=/api/v1
```

## nginx Proxy Configuration

The nginx configuration in `nginx/nginx.conf` handles routing:

```nginx
# Frontend requests
location / {
    proxy_pass http://frontend:80;
}

# API requests
location /api/ {
    proxy_pass http://backend:8000/api/;
}
```

## CORS Configuration

The backend is configured to accept requests from multiple origins:

```python
# backend/app/main.py
allow_origins=[
    "http://localhost:3000",  # Frontend dev server
    "http://localhost",       # Frontend via nginx
    "http://localhost:80",    # Frontend via nginx (explicit)
    ...
]
```

## Troubleshooting

### API Connection Issues

1. **Check the API URL in browser DevTools:**
   ```javascript
   // Open console and run:
   console.log(import.meta.env.VITE_API_BASE_URL)
   ```

2. **Verify backend is running:**
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

3. **Test via nginx proxy:**
   ```bash
   curl http://localhost/api/v1/health
   ```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS errors | Frontend URL not in CORS whitelist | Update `allow_origins` in backend/app/main.py |
| 404 on API calls | Wrong API URL configuration | Check VITE_API_BASE_URL in .env files |
| Connection refused | Backend not running | Ensure docker-compose services are up |
| API timeout | Slow backend response | Increase timeout in frontend config.ts |

## API Client Usage

### Example: Fetching Orders

```typescript
import { orderApi } from '@/domains/orders/api/orderService';

// Get all orders
const orders = await orderApi.getAll();

// Get single order
const order = await orderApi.getById('order-id');

// Create order
const newOrder = await orderApi.create({
  reference: 'ORD-001',
  service: 1,
  terminal_id: 'terminal-123',
  // ... other fields
});
```

### Example: Uploading Documents

```typescript
import { orderDocumentApi } from '@/domains/orders/api/orderDocumentService';

// Upload documents
const response = await orderDocumentApi.uploadDocuments(
  orderId,
  files,
  metadata
);

// Get document URL
const viewUrl = orderDocumentApi.getDocumentViewUrl(orderId, documentId);
```

## Testing API Endpoints

### Using curl

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Get orders
curl http://localhost:8000/api/v1/orders

# Create order
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "TEST-001",
    "service": 1,
    "terminal_id": "terminal-uuid"
  }'
```

### Using the API Documentation

- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## Summary

✅ **All frontend API URLs are correctly configured** to match the backend endpoints
✅ **Environment-specific configurations** handle different deployment scenarios
✅ **nginx proxy** correctly routes API requests
✅ **CORS settings** allow frontend access from all necessary origins