from app.core.settings import settings

from typing import AsyncGenerator

from fastapi import HTTPException

from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

# create the async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    future=True,
    echo=False,
)

# create the async session
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# Dependency for getting the database session
async def get_db() -> AsyncGenerator:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except SQLAlchemyError as sql_ex:
            await session.rollback()
            raise sql_ex
        except HTTPException as http_ex:
            await session.rollback()
            raise http_ex
        finally:
            await session.close()
