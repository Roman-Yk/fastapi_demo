from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

async def fetch_one_or_none(db: AsyncSession, query: Select):
	result = await db.execute(query)
	return result.scalar_one_or_none()

async def fetch_all(db: AsyncSession, query: Select):
	result = await db.execute(query)
	return result.scalars().all()

