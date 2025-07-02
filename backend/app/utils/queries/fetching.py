import uuid
from typing import Any
from fastapi import HTTPException
from sqlalchemy import select, exists

from sqlalchemy.sql import Select
from sqlalchemy.ext.asyncio import AsyncSession

async def fetch_one_or_none(db: AsyncSession, query: Select) -> Any:
	result = await db.execute(query)
	return result.scalar_one_or_none()

async def fetch_all(db: AsyncSession, query: Select) -> list:
	result = await db.execute(query)
	return result.scalars().all()

async def fetch_count_query(db: AsyncSession, query: Select) -> int:
	result = await db.execute(query)
	return result.scalar() or 0

async def fetch_one_or_404(db: AsyncSession, query: Select, detail: str = "Item not found") -> Any:
    result = await fetch_one_or_none(db, query)
    if not result:
        raise HTTPException(status_code=404, detail=detail)
    return result

async def is_record_exists(db: AsyncSession, Model, record_id: uuid.UUID) -> bool:
    """Check if a record exists by model and id."""
    query = select(exists().where(Model.id == record_id))
    result = await db.execute(query)
    return result.scalar()
