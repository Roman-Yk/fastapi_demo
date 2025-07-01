from app.core.settings import settings
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine

ASYNC_DB_ENGINE = create_async_engine(
    settings.DATABASE_URL,
    future=True,
    echo=False, # set to True for debugging to enable SQL logging
)

SYNC_DB_ENGINE_NO_POOL = create_engine(
    settings.SYNC_DATABASE_URL,
    future=True,
    echo=False, # set to True for debugging to enable SQL logging
    poolclass=NullPool
)