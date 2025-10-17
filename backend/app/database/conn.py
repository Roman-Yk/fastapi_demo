from typing import AsyncGenerator
import logging

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from app.modules.db.session_contexts import AsyncSessionContext
from app.database.exceptions import DatabaseError, ConflictError, ValidationError

logger = logging.getLogger(__name__)

# Dependency for getting the database session
async def get_db() -> AsyncGenerator:
    async with AsyncSessionContext() as session:
        try:
            yield session
            await session.commit()
        except IntegrityError as e:
            await session.rollback()
            logger.error(f"Database integrity error: {e}")

            # Parse constraint name to give meaningful error
            error_msg = str(e.orig).lower()
            if "unique" in error_msg:
                raise ConflictError("Resource with these values already exists")
            elif "foreign key" in error_msg or "violates foreign key constraint" in error_msg:
                raise ValidationError("Referenced resource does not exist")
            elif "not null" in error_msg or "violates not-null constraint" in error_msg:
                raise ValidationError("Required field is missing")
            else:
                raise ConflictError("Database constraint violation")
        except HTTPException:
            await session.rollback()
            raise
        except SQLAlchemyError as e:
            await session.rollback()
            logger.error(f"Database error: {e}")
            raise DatabaseError("Database operation failed")
        except Exception as e:
            await session.rollback()
            logger.error(f"Unexpected error in database session: {e}", exc_info=True)
            raise DatabaseError("An unexpected error occurred")
        finally:
            await session.close()
