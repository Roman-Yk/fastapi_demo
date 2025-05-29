from app.core.settings import settings

from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    settings.DATABASE_URL,
    future=True,
    echo=False, # set to True for debugging to enable SQL logging
)

null_pool_engine = create_async_engine(
    settings.DATABASE_URL,
    future=True,
    echo=False, # set to True for debugging to enable SQL logging
    poolclass=NullPool
)