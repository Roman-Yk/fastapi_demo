from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from . import ASYNC_DB_ENGINE, SYNC_DB_ENGINE_NO_POOL

# used for fastapi
AsyncSessionContext = sessionmaker(
    ASYNC_DB_ENGINE, 
    expire_on_commit=False, # False means we can still access object attributes after commit without re-fetching from the DB.
    class_=AsyncSession
)

# used for celery
SyncSessionContextNoPool = sessionmaker(
    SYNC_DB_ENGINE_NO_POOL, 
    expire_on_commit=False, # False means we can still access object attributes after commit without re-fetching from the DB.
    class_=AsyncSession
)
