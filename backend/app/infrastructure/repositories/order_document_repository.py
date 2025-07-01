"""
OrderDocument repository implementation.
Handles all database operations for OrderDocument entity.
"""
import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.models.orders import OrderDocument as OrderDocumentModel
from app.database.models.orders.enums import OrderDocumentType
from app.api.order_documents.schemas import UpdateOrderDocumentSchema
from app.infrastructure.repositories.base_repository import BaseRepository
from app.utils.queries.queries import apply_filter_sort_range_for_query


# Define a simple create schema for OrderDocument
class CreateOrderDocumentSchema:
    """Simple schema for creating order documents."""
    def __init__(self, order_id: uuid.UUID, title: str, src: str, type: OrderDocumentType, thumbnail: str = None):
        self.order_id = order_id
        self.title = title
        self.src = src
        self.type = type
        self.thumbnail = thumbnail


class OrderDocumentRepository(BaseRepository[OrderDocumentModel, CreateOrderDocumentSchema, UpdateOrderDocumentSchema]):
    """Repository for OrderDocument entity with specific business operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(OrderDocumentModel, db)
    
    async def get_by_order_id(self, order_id: uuid.UUID) -> List[OrderDocumentModel]:
        """Get all documents for a specific order."""
        return await self.get_by_attribute("order_id", order_id)
    
    async def get_by_type(self, document_type: OrderDocumentType) -> List[OrderDocumentModel]:
        """Get all documents of a specific type."""
        return await self.get_by_attribute("type", document_type)
    
    async def get_by_order_and_type(self, order_id: uuid.UUID, document_type: OrderDocumentType) -> List[OrderDocumentModel]:
        """Get documents for a specific order and type."""
        query = select(self.model).where(
            and_(
                self.model.order_id == order_id,
                self.model.type == document_type
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def search_documents(self, search_term: str, order_id: Optional[uuid.UUID] = None) -> List[OrderDocumentModel]:
        """Search documents by title or type."""
        search_pattern = f"%{search_term}%"
        query = select(self.model).where(
            or_(
                self.model.title.ilike(search_pattern),
                self.model.type.ilike(search_pattern)
            )
        )
        
        if order_id:
            query = query.where(self.model.order_id == order_id)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_documents_with_query_params(self, query_params, order_id: Optional[uuid.UUID] = None) -> tuple[List[OrderDocumentModel], int]:
        """Get documents with filtering, sorting, and pagination."""
        select_query = select(self.model)
        count_query = select(func.count()).select_from(self.model)
        
        # Filter by order_id if provided
        if order_id:
            select_query = select_query.where(self.model.order_id == order_id)
            count_query = count_query.where(self.model.order_id == order_id)
        
        # Apply query parameters
        filtered_query, filtered_count_query = apply_filter_sort_range_for_query(
            self.model,
            select_query,
            count_query,
            query_params.dict_data if hasattr(query_params, 'dict_data') else {},
        )
        
        # Execute queries
        result = await self.db.execute(filtered_query)
        documents = result.scalars().all()
        
        count_result = await self.db.execute(filtered_count_query)
        total_count = count_result.scalar()
        
        return documents, total_count
    
    async def get_documents_by_file_extension(self, extension: str) -> List[OrderDocumentModel]:
        """Get documents by file extension."""
        query = select(self.model).where(self.model.src.ilike(f"%.{extension}"))
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_documents_with_thumbnails(self) -> List[OrderDocumentModel]:
        """Get documents that have thumbnails."""
        query = select(self.model).where(self.model.thumbnail.is_not(None))
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_documents_without_thumbnails(self) -> List[OrderDocumentModel]:
        """Get documents that don't have thumbnails."""
        query = select(self.model).where(self.model.thumbnail.is_(None))
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_documents_statistics(self, order_id: Optional[uuid.UUID] = None) -> Dict[str, Any]:
        """Get document statistics."""
        base_query = select(func.count()).select_from(self.model)
        
        if order_id:
            base_query = base_query.where(self.model.order_id == order_id)
        
        # Total count
        total_result = await self.db.execute(base_query)
        total_count = total_result.scalar()
        
        # Count by type
        type_query = select(
            self.model.type,
            func.count(self.model.type).label('count')
        ).group_by(self.model.type)
        
        if order_id:
            type_query = type_query.where(self.model.order_id == order_id)
        
        type_result = await self.db.execute(type_query)
        type_distribution = {row.type: row.count for row in type_result}
        
        # Count with thumbnails
        thumbnail_query = base_query.where(self.model.thumbnail.is_not(None))
        thumbnail_result = await self.db.execute(thumbnail_query)
        thumbnail_count = thumbnail_result.scalar()
        
        return {
            "total_documents": total_count,
            "documents_with_thumbnails": thumbnail_count,
            "documents_without_thumbnails": total_count - thumbnail_count,
            "type_distribution": type_distribution
        }
    
    async def bulk_update_thumbnails(self, document_ids: List[uuid.UUID], thumbnail_path: str) -> int:
        """Bulk update thumbnail paths for multiple documents."""
        from sqlalchemy import update
        query = update(self.model).where(self.model.id.in_(document_ids)).values(thumbnail=thumbnail_path)
        result = await self.db.execute(query)
        return result.rowcount
    
    async def get_documents_needing_thumbnails(self) -> List[OrderDocumentModel]:
        """Get documents that should have thumbnails but don't."""
        # This would need business logic to determine which file types need thumbnails
        query = select(self.model).where(
            and_(
                self.model.thumbnail.is_(None),
                or_(
                    self.model.src.ilike("%.pdf"),
                    self.model.src.ilike("%.jpg"),
                    self.model.src.ilike("%.jpeg"),
                    self.model.src.ilike("%.png"),
                    self.model.src.ilike("%.gif")
                )
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def document_exists_for_order(self, order_id: uuid.UUID, document_type: OrderDocumentType) -> bool:
        """Check if a document of specific type exists for an order."""
        query = select(func.count()).select_from(self.model).where(
            and_(
                self.model.order_id == order_id,
                self.model.type == document_type
            )
        )
        result = await self.db.execute(query)
        return result.scalar() > 0 