"""
Driver repository implementation.
"""
import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.drivers import Driver
from app.infrastructure.repositories.base_repository import BaseRepository


class DriverRepository(BaseRepository[Driver, Dict[str, Any], Dict[str, Any]]):
    """Repository for Driver entity."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Driver, db)
    
    async def get_by_name(self, name: str) -> Optional[Driver]:
        """Get driver by name."""
        return await self.get_first_by_attribute("name", name)
    
    async def get_by_phone(self, phone: str) -> Optional[Driver]:
        """Get driver by phone number."""
        return await self.get_first_by_attribute("phone", phone)
    
    async def search_drivers(self, search_term: str) -> List[Driver]:
        """Search drivers by name or phone."""
        search_pattern = f"%{search_term}%"
        query = select(self.model).where(
            or_(
                self.model.name.ilike(search_pattern),
                self.model.phone.ilike(search_pattern)
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def phone_exists(self, phone: str, exclude_id: Optional[uuid.UUID] = None) -> bool:
        """Check if phone number exists."""
        query = select(func.count()).select_from(self.model).where(self.model.phone == phone)
        
        if exclude_id:
            query = query.where(self.model.id != exclude_id)
        
        result = await self.db.execute(query)
        return result.scalar() > 0
    
    async def get_drivers_by_name_pattern(self, name_pattern: str) -> List[Driver]:
        """Get drivers matching name pattern."""
        query = select(self.model).where(self.model.name.ilike(f"%{name_pattern}%"))
        result = await self.db.execute(query)
        return result.scalars().all() 