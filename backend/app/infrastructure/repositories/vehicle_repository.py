"""
Vehicle repositories for Truck and Trailer entities.
"""
import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.vehicles import Truck, Trailer
from app.infrastructure.repositories.base_repository import BaseRepository


class TruckRepository(BaseRepository[Truck, Dict[str, Any], Dict[str, Any]]):
    """Repository for Truck entity."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Truck, db)
    
    async def get_by_license_plate(self, license_plate: str) -> Optional[Truck]:
        """Get truck by license plate."""
        return await self.get_first_by_attribute("license_plate", license_plate.lower())
    
    async def get_by_name(self, name: str) -> Optional[Truck]:
        """Get truck by name."""
        return await self.get_first_by_attribute("name", name)
    
    async def search_trucks(self, search_term: str) -> List[Truck]:
        """Search trucks by name or license plate."""
        search_pattern = f"%{search_term}%"
        query = select(self.model).where(
            or_(
                self.model.name.ilike(search_pattern),
                self.model.license_plate.ilike(search_pattern)
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def license_plate_exists(self, license_plate: str, exclude_id: Optional[uuid.UUID] = None) -> bool:
        """Check if license plate exists."""
        query = select(func.count()).select_from(self.model).where(
            self.model.license_plate == license_plate.lower()
        )
        
        if exclude_id:
            query = query.where(self.model.id != exclude_id)
        
        result = await self.db.execute(query)
        return result.scalar() > 0


class TrailerRepository(BaseRepository[Trailer, Dict[str, Any], Dict[str, Any]]):
    """Repository for Trailer entity."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Trailer, db)
    
    async def get_by_license_plate(self, license_plate: str) -> Optional[Trailer]:
        """Get trailer by license plate."""
        return await self.get_first_by_attribute("license_plate", license_plate.lower())
    
    async def get_by_name(self, name: str) -> Optional[Trailer]:
        """Get trailer by name."""
        return await self.get_first_by_attribute("name", name)
    
    async def search_trailers(self, search_term: str) -> List[Trailer]:
        """Search trailers by name or license plate."""
        search_pattern = f"%{search_term}%"
        query = select(self.model).where(
            or_(
                self.model.name.ilike(search_pattern),
                self.model.license_plate.ilike(search_pattern)
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def license_plate_exists(self, license_plate: str, exclude_id: Optional[uuid.UUID] = None) -> bool:
        """Check if license plate exists."""
        query = select(func.count()).select_from(self.model).where(
            self.model.license_plate == license_plate.lower()
        )
        
        if exclude_id:
            query = query.where(self.model.id != exclude_id)
        
        result = await self.db.execute(query)
        return result.scalar() > 0 