from app.core.settings import settings
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine

# Async engine for FastAPI with connection pooling
ASYNC_DB_ENGINE = create_async_engine(
    settings.DATABASE_URL,
    future=True,
    echo=False,  # set to True for debugging to enable SQL logging
    pool_size=20,  # Maximum number of persistent connections
    max_overflow=10,  # Maximum number of overflow connections
    pool_recycle=3600,  # Recycle connections after 1 hour to avoid stale connections
    pool_pre_ping=True,  # Verify connection is alive before using it
    pool_timeout=30,  # Wait 30 seconds for a connection from the pool
)

# Sync engine for Celery workers (no pooling to avoid issues with forked processes)
SYNC_DB_ENGINE_NO_POOL = create_engine(
    settings.SYNC_DATABASE_URL,
    future=True,
    echo=False,  # set to True for debugging to enable SQL logging
    poolclass=NullPool,  # No connection pooling for Celery
    pool_pre_ping=True,  # Verify connection is alive before using it
)