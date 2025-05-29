from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from . import DB_ENGINE, DB_ENGINE_NO_POOL

AsyncSessionContext = sessionmaker(
    DB_ENGINE, 
    expire_on_commit=False, # False means we can still access object attributes after commit without re-fetching from the DB.
    class_=AsyncSession
)

AsyncSessionContextNoPool = sessionmaker(
    DB_ENGINE_NO_POOL, 
    expire_on_commit=False, # False means we can still access object attributes after commit without re-fetching from the DB.
    class_=AsyncSession
)
