from typing import AsyncGenerator

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.modules.db.session_contexts import AsyncSessionContext

# Dependency for getting the database session
async def get_db() -> AsyncGenerator:
    async with AsyncSessionContext() as session:
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
