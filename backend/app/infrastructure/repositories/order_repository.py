"""
Order repository implementation.
Handles all database operations for Order entity.
"""
import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.models.orders import Order as OrderModel
from app.api.orders.schemas import CreateOrderSchema, UpdateOrderSchema
from app.infrastructure.repositories.base_repository import BaseRepository
from app.utils.queries.queries import apply_filter_sort_range_for_query


class OrderRepository(BaseRepository[OrderModel, CreateOrderSchema, UpdateOrderSchema]):
    """Repository for Order entity with specific business operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(OrderModel, db)
    
    async def get_by_reference(self, reference: str) -> Optional[OrderModel]:
        """Get order by reference number."""
        return await self.get_first_by_attribute("reference", reference)
    
    async def get_orders_by_terminal(self, terminal_id: uuid.UUID) -> List[OrderModel]:
        """Get all orders for a specific terminal."""
        return await self.get_by_attribute("terminal_id", terminal_id)
    
    async def get_priority_orders(self) -> List[OrderModel]:
        """Get all priority orders."""
        return await self.get_by_attribute("priority", True)
    
    async def get_orders_by_service_type(self, service_type: int) -> List[OrderModel]:
        """Get orders by service type."""
        return await self.get_by_attribute("service", service_type)
    
    async def get_orders_with_eta_in_date_range(self, start_date, end_date) -> List[OrderModel]:
        """Get orders with ETA in specified date range."""
        query = select(self.model).where(
            and_(
                self.model.eta_date >= start_date,
                self.model.eta_date <= end_date
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_orders_with_etd_in_date_range(self, start_date, end_date) -> List[OrderModel]:
        """Get orders with ETD in specified date range."""
        query = select(self.model).where(
            and_(
                self.model.etd_date >= start_date,
                self.model.etd_date <= end_date
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_orders_by_driver(self, driver_id: uuid.UUID) -> List[OrderModel]:
        """Get orders assigned to a specific driver (ETA or ETD)."""
        query = select(self.model).where(
            or_(
                self.model.eta_driver_id == driver_id,
                self.model.etd_driver_id == driver_id
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_orders_by_vehicle(self, truck_id: Optional[uuid.UUID] = None, 
                                  trailer_id: Optional[uuid.UUID] = None) -> List[OrderModel]:
        """Get orders assigned to specific vehicles."""
        conditions = []
        
        if truck_id:
            conditions.extend([
                self.model.eta_truck_id == truck_id,
                self.model.etd_truck_id == truck_id
            ])
        
        if trailer_id:
            conditions.extend([
                self.model.eta_trailer_id == trailer_id,
                self.model.etd_trailer_id == trailer_id
            ])
        
        if conditions:
            query = select(self.model).where(or_(*conditions))
            result = await self.db.execute(query)
            return result.scalars().all()
        
        return []
    
    async def search_orders(self, search_term: str) -> List[OrderModel]:
        """Search orders by reference, commodity, or notes."""
        search_pattern = f"%{search_term}%"
        query = select(self.model).where(
            or_(
                self.model.reference.ilike(search_pattern),
                self.model.commodity.ilike(search_pattern),
                self.model.notes.ilike(search_pattern)
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_orders_with_query_params(self, query_params) -> tuple[List[OrderModel], int]:
        """Get orders with filtering, sorting, and pagination using existing query utilities."""
        select_query = select(self.model)
        count_query = select(func.count()).select_from(self.model)
        
        # Use existing utility function
        filtered_query, filtered_count_query = apply_filter_sort_range_for_query(
            self.model,
            select_query,
            count_query,
            query_params.dict_data if hasattr(query_params, 'dict_data') else {},
        )
        
        # Execute queries
        result = await self.db.execute(filtered_query)
        orders = result.scalars().all()
        
        count_result = await self.db.execute(filtered_count_query)
        total_count = count_result.scalar()
        
        return orders, total_count
    
    async def get_orders_statistics(self) -> Dict[str, Any]:
        """Get order statistics."""
        total_query = select(func.count()).select_from(self.model)
        priority_query = select(func.count()).select_from(self.model).where(self.model.priority == True)
        
        total_result = await self.db.execute(total_query)
        priority_result = await self.db.execute(priority_query)
        
        total_count = total_result.scalar()
        priority_count = priority_result.scalar()
        
        # Get service type distribution
        service_query = select(
            self.model.service,
            func.count(self.model.service).label('count')
        ).group_by(self.model.service)
        service_result = await self.db.execute(service_query)
        service_distribution = {row.service: row.count for row in service_result}
        
        return {
            "total_orders": total_count,
            "priority_orders": priority_count,
            "regular_orders": total_count - priority_count,
            "service_distribution": service_distribution
        }
    
    async def bulk_update_priority(self, order_ids: List[uuid.UUID], priority: bool) -> int:
        """Bulk update priority status for multiple orders."""
        from sqlalchemy import update
        query = update(self.model).where(self.model.id.in_(order_ids)).values(priority=priority)
        result = await self.db.execute(query)
        return result.rowcount
    
    async def get_orders_needing_attention(self) -> List[OrderModel]:
        """Get orders that need attention (missing required fields, overdue, etc.)."""
        # This is a business logic example - adjust based on your requirements
        query = select(self.model).where(
            or_(
                self.model.reference.is_(None),
                self.model.service.is_(None),
                self.model.terminal_id.is_(None)
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def reference_exists(self, reference: str, exclude_id: Optional[uuid.UUID] = None) -> bool:
        """Check if reference exists, optionally excluding a specific order ID."""
        query = select(func.count()).select_from(self.model).where(self.model.reference == reference)
        
        if exclude_id:
            query = query.where(self.model.id != exclude_id)
        
        result = await self.db.execute(query)
        return result.scalar() > 0 