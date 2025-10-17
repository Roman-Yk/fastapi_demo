# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a full-stack application for managing logistics orders, built with FastAPI (backend) and React (frontend). The system handles orders, drivers, vehicles (trucks/trailers), terminals, and document management with OCR capabilities. It uses Celery for async task processing and Redis for caching.

## Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with async/await support
- **Database**: PostgreSQL with SQLAlchemy (async) and Alembic for migrations
- **Task Queue**: Celery with Redis broker for async document processing
- **Caching**: Redis cache for terminal data (populated on startup)
- **File Processing**: OCR support via tesseract, PDF/image handling for order documents
- **Testing**: pytest with testcontainers for PostgreSQL integration tests

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **UI Libraries**: Mantine (primary) + Material-UI (data grid)
- **Build Tool**: Vite
- **State Management**: Local state with React hooks
- **Routing**: React Router v7

### Key Patterns

1. **Class-Based Views (CBV)**: API routes use `fastapi-utils` CBV pattern with dependency injection
   - `InferringRouter` for type-safe routing
   - `@cbv` decorator for class-based resource handlers
   - Database session injected via `Depends(get_db)`

2. **Service Layer**: Business logic separated into service classes (e.g., `OrderService`, `DriverService`)
   - Services handle database operations and business rules
   - Located in `backend/app/api/<resource>/service.py`

3. **Schema Separation**: Three schema types per resource
   - `BaseSchemas.py`: Base classes for Create/Update/Response patterns
   - `schemas.py`: Resource-specific schemas and query parameters
   - Pydantic models for validation and serialization

4. **Database Context Manager**: Custom `AsyncSessionContext` for session management
   - Handles commits, rollbacks, and proper cleanup
   - Used in `get_db()` dependency

5. **Shared Components**: Common code in `_shared` directories
   - API schemas: `backend/app/api/_shared/schema/`
   - API tasks: `backend/app/api/_shared/tasks/`
   - Utils: `backend/app/utils/` for queries, parsing, file handling

## Development Commands

### Backend

```bash
# Start all services (backend, database, redis, celery, flower)
docker-compose up --build

# Backend runs on: http://localhost:8000
# API docs: http://localhost:8000/api/v1/docs
# Flower (Celery monitor): http://localhost:5555
# pgAdmin: http://localhost:333
```

**Running in backend directory (`cd backend`):**

```bash
# Install dependencies
pip install -r requirements.txt

# Run backend directly (requires PostgreSQL and Redis running)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Database migrations
alembic revision --autogenerate -m "description"  # Create migration
alembic upgrade head                               # Apply migrations
alembic downgrade -1                              # Rollback one migration

# Run all tests
pytest

# Run specific test markers
pytest -m unit              # Unit tests only
pytest -m integration       # Integration tests only
pytest -m orders           # Order-related tests
pytest -m api              # API endpoint tests

# Run specific test file
pytest tests/api/test_orders.py

# Run with coverage
pytest --cov=app --cov-report=html

# Celery worker (for async tasks)
celery -A app.modules.celery multi start cpu -c:cpu 2 -Q:cpu cpu -l INFO
```

**Test Configuration:**
- Tests use testcontainers to spin up PostgreSQL container
- Docker must be running for tests to work
- Test database is automatically created and cleaned up
- Fixtures in `backend/tests/conftest.py` provide sample data

### Frontend

**Running in frontend directory (`cd frontend/demo-app`):**

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
npm run lint:fix
```

## Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app entry point
│   ├── api/                       # API routes (orders, drivers, trucks, trailers, terminals)
│   │   ├── _shared/              # Shared API components
│   │   │   ├── schema/          # Common schemas
│   │   │   └── tasks/           # Celery tasks
│   │   └── <resource>/          # Resource-specific modules
│   │       ├── api.py           # Route handlers (CBV)
│   │       ├── service.py       # Business logic
│   │       ├── schemas.py       # Pydantic schemas
│   │       └── BaseSchemas.py   # Base schema classes
│   ├── core/
│   │   ├── settings.py          # Config via pydantic-settings
│   │   └── configs/             # Additional configs
│   ├── database/
│   │   ├── conn.py              # DB session dependency
│   │   ├── base_model.py        # SQLAlchemy base
│   │   ├── models/              # SQLAlchemy models
│   │   └── scripts/             # DB utility scripts
│   ├── modules/                  # Domain modules
│   │   ├── cache/               # Redis caching (terminal cache)
│   │   ├── celery/              # Celery config and tasks
│   │   ├── db/                  # DB session contexts
│   │   └── redis/               # Redis connection
│   ├── utils/                    # Utilities
│   │   ├── files.py             # File handling
│   │   ├── parsing/             # Document parsing (OCR)
│   │   ├── queries/             # Query builders
│   │   └── models/              # Model utilities
│   └── alembic/                 # Database migrations
├── tests/
│   ├── conftest.py              # Pytest fixtures (testcontainers setup)
│   └── api/                     # API tests by resource
├── entrypoints/                 # Docker entrypoints
│   ├── celery_worker.sh        # Celery worker startup
│   └── flower.sh               # Flower monitoring
└── files/                       # Uploaded document storage

frontend/demo-app/
├── src/
│   ├── components/              # React components
│   │   ├── Navbar.tsx          # Nav with theme toggle
│   │   ├── OrderFilters.tsx    # Filter controls
│   │   └── OrderGrid.tsx       # MUI DataGrid
│   ├── types/                   # TypeScript types
│   │   └── order.ts            # Order interfaces/enums
│   ├── utils/                   # Utilities
│   ├── App.tsx                 # Main app
│   └── main.tsx                # Entry point
└── package.json
```

## Database Models

Key models in `backend/app/database/models/`:
- **orders**: Order (main entity with reference, service, dates, commodity, quantities)
- **order_documents**: OrderDocument (file metadata with OCR text extraction)
- **drivers**: Driver (name, phone)
- **vehicles**: Truck, Trailer (license plates, names)
- **terminals**: Terminal (name, timezone, address, account_code)

All models use UUID primary keys and inherit from `BASE_MODEL`.

## API Structure

All API routes follow pattern: `/api/v1/<resource>`

**Standard CRUD endpoints per resource:**
- `GET /api/v1/<resource>` - List with filtering/pagination
- `GET /api/v1/<resource>/{id}` - Get by ID
- `POST /api/v1/<resource>` - Create
- `PUT /api/v1/<resource>/{id}` - Full update
- `PATCH /api/v1/<resource>/{id}` - Partial update
- `DELETE /api/v1/<resource>/{id}` - Delete (where applicable)

**Order documents special endpoints:**
- `POST /api/v1/order-documents/{order_id}/upload` - Upload document with OCR processing
- `GET /api/v1/order-documents/{doc_id}/download` - Download original file

## Celery Tasks

Celery workers handle async document processing:
- OCR text extraction from PDFs and images
- Thumbnail generation
- File format conversions

Tasks defined in `backend/app/api/_shared/tasks/`

## Environment Variables

Backend requires `.env` file in `backend/` directory:
```
POSTGRES_DB=<db_name>
POSTGRES_USER=<db_user>
POSTGRES_PASSWORD=<password>
POSTGRES_HOST=database
POSTGRES_PORT=5432
REDIS_URL=redis://redis:6379/0
FILES_PATH=files
```

## Common Development Tasks

### Adding a New Resource

1. Create model in `backend/app/database/models/<resource>/`
2. Create migration: `alembic revision --autogenerate -m "add <resource>"`
3. Create API module: `backend/app/api/<resource>/`
   - `api.py` with CBV router
   - `service.py` with business logic
   - `schemas.py` with Pydantic models
   - `BaseSchemas.py` with base schemas
4. Register router in `backend/app/main.py`
5. Add tests in `backend/tests/api/test_<resource>.py`

### Working with Database

- Use async SQLAlchemy throughout (avoid sync operations)
- Always use `AsyncSession` from `get_db()` dependency
- Migrations are auto-generated but review before applying
- Database connection pooling is configured for async operations

### Testing Best Practices

- Use provided fixtures in `conftest.py` (sample_order, sample_driver, etc.)
- Tests automatically use isolated PostgreSQL container
- Each test gets fresh transaction (rolled back after test)
- Mark tests appropriately (@pytest.mark.unit, @pytest.mark.integration, etc.)
