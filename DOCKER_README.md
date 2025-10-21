# Docker Setup

## Quick Start

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

## Services & Ports

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| nginx | 80 | Main entry point (routes to frontend/backend) | http://localhost |
| Frontend | via nginx | React application | http://localhost |
| Backend | 8000 | FastAPI (direct access) | http://localhost:8000 |
| PostgreSQL | 5432 | Database | - |
| Redis | - | Cache & Celery broker | - |
| pgAdmin | 333 | Database admin | http://localhost:333 |
| Flower | 5555 | Celery monitoring | http://localhost:5555 |

## API Access

- **Via nginx**: http://localhost/api/v1/[endpoint]
- **Direct**: http://localhost:8000/api/v1/[endpoint]
- **API Docs**: http://localhost:8000/docs or http://localhost/docs
- **ReDoc**: http://localhost:8000/redoc or http://localhost/redoc

## Common Commands

```bash
# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Rebuild a specific service
docker-compose build [service_name]

# Access backend shell
docker-compose exec backend /bin/sh

# Run database migrations
docker-compose exec backend alembic upgrade head

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "description"
```

## File Structure

```
├── docker-compose.yaml       # Single configuration file
├── nginx/
│   └── nginx.conf           # Reverse proxy configuration
├── frontend/
│   └── demo-app/
│       ├── Dockerfile       # Frontend build
│       └── nginx.conf       # Frontend nginx config
└── backend/
    ├── Dockerfile           # Backend build
    └── .env                 # Environment variables
```

## Environment Setup

Create `backend/.env` file:
```env
POSTGRES_DB=your_db
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=database
POSTGRES_PORT=5432
REDIS_URL=redis://redis:6379/0

# pgAdmin credentials
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin
```

## Troubleshooting

### Port conflicts
If port 80 is in use:
```bash
# Stop local nginx/apache
sudo service nginx stop
# Or change port in docker-compose.yaml
```

### Database issues
```bash
# Check database logs
docker-compose logs database

# Reset database
docker-compose down -v
docker-compose up -d
```

### Frontend not updating
```bash
# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```