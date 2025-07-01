"""
Terminal repository implementation.
"""
import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.terminals import Terminal
from app.infrastructure.repositories.base_repository import BaseRepository


class TerminalRepository(BaseRepository[Terminal, Dict[str, Any], Dict[str, Any]]):
    """Repository for Terminal entity."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Terminal, db)
    
    async def get_by_name(self, name: str) -> Optional[Terminal]:
        """Get terminal by name."""
        return await self.get_first_by_attribute("name", name)
    
    async def get_by_short_name(self, short_name: str) -> Optional[Terminal]:
        """Get terminal by short name."""
        return await self.get_first_by_attribute("short_name", short_name)
    
    async def get_by_account_code(self, account_code: str) -> Optional[Terminal]:
        """Get terminal by account code."""
        return await self.get_first_by_attribute("account_code", account_code)
    
    async def search_terminals(self, search_term: str) -> List[Terminal]:
        """Search terminals by name, short name, or address."""
        search_pattern = f"%{search_term}%"
        query = select(self.model).where(
            or_(
                self.model.name.ilike(search_pattern),
                self.model.short_name.ilike(search_pattern),
                self.model.address.ilike(search_pattern)
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_by_timezone(self, timezone: str) -> List[Terminal]:
        """Get terminals by timezone."""
        return await self.get_by_attribute("time_zone", timezone)
    
    async def account_code_exists(self, account_code: str, exclude_id: Optional[uuid.UUID] = None) -> bool:
        """Check if account code exists."""
        if not account_code:
            return False
            
        query = select(func.count()).select_from(self.model).where(self.model.account_code == account_code)
        
        if exclude_id:
            query = query.where(self.model.id != exclude_id)
        
        result = await self.db.execute(query)
        return result.scalar() > 0 