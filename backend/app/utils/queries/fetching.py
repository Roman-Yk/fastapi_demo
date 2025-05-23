from typing import Any
from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select


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