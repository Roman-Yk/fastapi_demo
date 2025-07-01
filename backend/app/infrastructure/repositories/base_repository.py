"""
Base repository implementation.
Provides common CRUD operations for all entities.
"""
import uuid
from abc import ABC, abstractmethod
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from sqlalchemy import select, func, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.core.exceptions import ResourceNotFoundException

# Generic type for database models
ModelType = TypeVar("ModelType", bound=DeclarativeBase)
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")


class IRepository(ABC, Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Repository interface defining common operations."""
    
    @abstractmethod
    async def get_by_id(self, id: uuid.UUID) -> Optional[ModelType]:
        """Get entity by ID."""
        pass
    
    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get all entities with pagination."""
        pass
    
    @abstractmethod
    async def create(self, obj_in: CreateSchemaType) -> ModelType:
        """Create new entity."""
        pass
    
    @abstractmethod
    async def update(self, db_obj: ModelType, obj_in: Union[UpdateSchemaType, Dict[str, Any]]) -> ModelType:
        """Update existing entity."""
        pass
    
    @abstractmethod
    async def delete(self, id: uuid.UUID) -> bool:
        """Delete entity by ID."""
        pass
    
    @abstractmethod
    async def count(self) -> int:
        """Count total entities."""
        pass


class BaseRepository(IRepository[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Base repository implementation with common CRUD operations."""
    
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db
    
    async def get_by_id(self, id: uuid.UUID) -> Optional[ModelType]:
        """Get entity by ID."""
        query = select(self.model).where(self.model.id == id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_id_or_404(self, id: uuid.UUID) -> ModelType:
        """Get entity by ID or raise exception if not found."""
        entity = await self.get_by_id(id)
        if not entity:
            raise ResourceNotFoundException(f"{self.model.__name__} with id {id} not found")
        return entity
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get all entities with pagination."""
        query = select(self.model).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_by_attribute(self, attribute: str, value: Any) -> List[ModelType]:
        """Get entities by attribute value."""
        query = select(self.model).where(getattr(self.model, attribute) == value)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_first_by_attribute(self, attribute: str, value: Any) -> Optional[ModelType]:
        """Get first entity by attribute value."""
        query = select(self.model).where(getattr(self.model, attribute) == value)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def create(self, obj_in: Union[CreateSchemaType, Dict[str, Any]]) -> ModelType:
        """Create new entity."""
        if hasattr(obj_in, 'model_dump'):
            # Pydantic model
            obj_data = obj_in.model_dump()
        elif hasattr(obj_in, 'dict'):
            # Pydantic model (older versions)
            obj_data = obj_in.dict()
        else:
            # Dictionary
            obj_data = obj_in
        
        db_obj = self.model(**obj_data)
        self.db.add(db_obj)
        await self.db.flush()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def update(self, db_obj: ModelType, obj_in: Union[UpdateSchemaType, Dict[str, Any]]) -> ModelType:
        """Update existing entity."""
        if hasattr(obj_in, 'model_dump'):
            # Pydantic model
            update_data = obj_in.model_dump(exclude_unset=True)
        elif hasattr(obj_in, 'dict'):
            # Pydantic model (older versions)
            update_data = obj_in.dict(exclude_unset=True)
        else:
            # Dictionary
            update_data = obj_in
        
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        await self.db.flush()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def delete(self, id: uuid.UUID) -> bool:
        """Delete entity by ID."""
        query = delete(self.model).where(self.model.id == id)
        result = await self.db.execute(query)
        return result.rowcount > 0
    
    async def delete_by_ids(self, ids: List[uuid.UUID]) -> int:
        """Delete multiple entities by IDs."""
        query = delete(self.model).where(self.model.id.in_(ids))
        result = await self.db.execute(query)
        return result.rowcount
    
    async def count(self) -> int:
        """Count total entities."""
        query = select(func.count()).select_from(self.model)
        result = await self.db.execute(query)
        return result.scalar()
    
    async def exists(self, id: uuid.UUID) -> bool:
        """Check if entity exists by ID."""
        entity = await self.get_by_id(id)
        return entity is not None
    
    async def exists_by_attribute(self, attribute: str, value: Any) -> bool:
        """Check if entity exists by attribute value."""
        query = select(func.count()).select_from(self.model).where(getattr(self.model, attribute) == value)
        result = await self.db.execute(query)
        return result.scalar() > 0
    
    async def bulk_create(self, objects: List[Union[CreateSchemaType, Dict[str, Any]]]) -> List[ModelType]:
        """Create multiple entities."""
        db_objects = []
        for obj_in in objects:
            if hasattr(obj_in, 'model_dump'):
                obj_data = obj_in.model_dump()
            elif hasattr(obj_in, 'dict'):
                obj_data = obj_in.dict()
            else:
                obj_data = obj_in
            
            db_obj = self.model(**obj_data)
            db_objects.append(db_obj)
            self.db.add(db_obj)
        
        await self.db.flush()
        for db_obj in db_objects:
            await self.db.refresh(db_obj)
        
        return db_objects
    
    async def update_by_id(self, id: uuid.UUID, obj_in: Union[UpdateSchemaType, Dict[str, Any]]) -> Optional[ModelType]:
        """Update entity by ID."""
        db_obj = await self.get_by_id(id)
        if not db_obj:
            return None
        return await self.update(db_obj, obj_in)
    
    async def get_filtered(self, 
                          filter_params: Optional[Dict[str, Any]] = None,
                          sort_field: Optional[str] = None,
                          sort_order: str = "asc",
                          skip: int = 0,
                          limit: int = 100) -> tuple[List[ModelType], int]:
        """Get filtered and sorted entities with count."""
        query = select(self.model)
        count_query = select(func.count()).select_from(self.model)
        
        # Apply filters
        if filter_params:
            for field, value in filter_params.items():
                if hasattr(self.model, field):
                    query = query.where(getattr(self.model, field) == value)
                    count_query = count_query.where(getattr(self.model, field) == value)
        
        # Apply sorting
        if sort_field and hasattr(self.model, sort_field):
            sort_column = getattr(self.model, sort_field)
            if sort_order.lower() == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Execute queries
        result = await self.db.execute(query)
        entities = result.scalars().all()
        
        count_result = await self.db.execute(count_query)
        total_count = count_result.scalar()
        
        return entities, total_count 