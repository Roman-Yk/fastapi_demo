from sqlalchemy.ext.asyncio import AsyncSession

async def fetch_one_or_none(db, query):
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def fetch_all(db: AsyncSession, query):
    result = await db.execute(query)
    return result.scalars().all()
