"""
Dependency injection container and providers.
Manages the creation and lifetime of services, repositories, and other dependencies.
"""
from functools import lru_cache
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.database.conn import get_db
from app.infrastructure.unit_of_work import UnitOfWork
from app.infrastructure.repositories.order_repository import OrderRepository
from app.infrastructure.repositories.order_document_repository import OrderDocumentRepository
from app.infrastructure.repositories.driver_repository import DriverRepository
from app.infrastructure.repositories.vehicle_repository import TruckRepository, TrailerRepository
from app.infrastructure.repositories.terminal_repository import TerminalRepository
from app.domain.services.order_service import OrderDomainService
from app.domain.services.order_document_service import OrderDocumentDomainService
from app.domain.validators.order_validator import OrderValidator
from app.domain.validators.order_document_validator import OrderDocumentValidator
from app.shared.events.base import get_event_bus, IEventBus


class DependencyContainer:
    """
    Dependency injection container.
    Manages the creation and caching of services and repositories.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self._uow: Optional[UnitOfWork] = None
        self._order_service: Optional[OrderDomainService] = None
        self._order_document_service: Optional[OrderDocumentDomainService] = None
        self._order_validator: Optional[OrderValidator] = None
        self._order_document_validator: Optional[OrderDocumentValidator] = None
        self._event_bus: Optional[IEventBus] = None
        
        # Repository instances
        self._order_repository: Optional[OrderRepository] = None
        self._order_document_repository: Optional[OrderDocumentRepository] = None
        self._driver_repository: Optional[DriverRepository] = None
        self._truck_repository: Optional[TruckRepository] = None
        self._trailer_repository: Optional[TrailerRepository] = None
        self._terminal_repository: Optional[TerminalRepository] = None
    
    @property
    def uow(self) -> UnitOfWork:
        """Get or create Unit of Work."""
        if self._uow is None:
            self._uow = UnitOfWork(self.db)
        return self._uow
    
    @property
    def event_bus(self) -> IEventBus:
        """Get the event bus."""
        if self._event_bus is None:
            self._event_bus = get_event_bus()
        return self._event_bus
    
    # Services
    @property
    def order_service(self) -> OrderDomainService:
        """Get or create Order domain service."""
        if self._order_service is None:
            self._order_service = OrderDomainService(self.uow)
        return self._order_service
    
    @property
    def order_document_service(self) -> OrderDocumentDomainService:
        """Get or create OrderDocument domain service."""
        if self._order_document_service is None:
            self._order_document_service = OrderDocumentDomainService(self.uow)
        return self._order_document_service
    
    # Validators
    @property
    def order_validator(self) -> OrderValidator:
        """Get or create Order validator."""
        if self._order_validator is None:
            self._order_validator = OrderValidator(self.db)
        return self._order_validator
    
    @property
    def order_document_validator(self) -> OrderDocumentValidator:
        """Get or create OrderDocument validator."""
        if self._order_document_validator is None:
            self._order_document_validator = OrderDocumentValidator(self.db)
        return self._order_document_validator
    
    # Repositories
    @property
    def order_repository(self) -> OrderRepository:
        """Get or create Order repository."""
        if self._order_repository is None:
            self._order_repository = OrderRepository(self.db)
        return self._order_repository
    
    @property
    def order_document_repository(self) -> OrderDocumentRepository:
        """Get or create OrderDocument repository."""
        if self._order_document_repository is None:
            self._order_document_repository = OrderDocumentRepository(self.db)
        return self._order_document_repository
    
    @property
    def driver_repository(self) -> DriverRepository:
        """Get or create Driver repository."""
        if self._driver_repository is None:
            self._driver_repository = DriverRepository(self.db)
        return self._driver_repository
    
    @property
    def truck_repository(self) -> TruckRepository:
        """Get or create Truck repository."""
        if self._truck_repository is None:
            self._truck_repository = TruckRepository(self.db)
        return self._truck_repository
    
    @property
    def trailer_repository(self) -> TrailerRepository:
        """Get or create Trailer repository."""
        if self._trailer_repository is None:
            self._trailer_repository = TrailerRepository(self.db)
        return self._trailer_repository
    
    @property
    def terminal_repository(self) -> TerminalRepository:
        """Get or create Terminal repository."""
        if self._terminal_repository is None:
            self._terminal_repository = TerminalRepository(self.db)
        return self._terminal_repository


# Dependency providers for FastAPI
async def get_container(db: AsyncSession = Depends(get_db)) -> DependencyContainer:
    """Get dependency container."""
    return DependencyContainer(db)


async def get_uow(container: DependencyContainer = Depends(get_container)) -> UnitOfWork:
    """Get Unit of Work."""
    return container.uow


async def get_order_service(container: DependencyContainer = Depends(get_container)) -> OrderDomainService:
    """Get Order domain service."""
    return container.order_service


async def get_order_document_service(container: DependencyContainer = Depends(get_container)) -> OrderDocumentDomainService:
    """Get OrderDocument domain service."""
    return container.order_document_service


async def get_order_validator(container: DependencyContainer = Depends(get_container)) -> OrderValidator:
    """Get Order validator."""
    return container.order_validator


async def get_order_repository(container: DependencyContainer = Depends(get_container)) -> OrderRepository:
    """Get Order repository."""
    return container.order_repository


async def get_order_document_repository(container: DependencyContainer = Depends(get_container)) -> OrderDocumentRepository:
    """Get OrderDocument repository."""
    return container.order_document_repository


async def get_driver_repository(container: DependencyContainer = Depends(get_container)) -> DriverRepository:
    """Get Driver repository."""
    return container.driver_repository


async def get_truck_repository(container: DependencyContainer = Depends(get_container)) -> TruckRepository:
    """Get Truck repository."""
    return container.truck_repository


async def get_trailer_repository(container: DependencyContainer = Depends(get_container)) -> TrailerRepository:
    """Get Trailer repository."""
    return container.trailer_repository


async def get_terminal_repository(container: DependencyContainer = Depends(get_container)) -> TerminalRepository:
    """Get Terminal repository."""
    return container.terminal_repository


async def get_event_bus_dependency() -> IEventBus:
    """Get event bus for dependency injection."""
    return get_event_bus()


# Convenience dependencies
async def get_db_and_uow(db: AsyncSession = Depends(get_db)) -> tuple[AsyncSession, UnitOfWork]:
    """Get database session and Unit of Work together."""
    uow = UnitOfWork(db)
    return db, uow


# Context manager for transactional operations
class TransactionalOperation:
    """Context manager for transactional database operations."""
    
    def __init__(self, uow: UnitOfWork):
        self.uow = uow
    
    async def __aenter__(self):
        return self.uow
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            await self.uow.rollback()
        else:
            await self.uow.commit()


async def get_transactional_uow(uow: UnitOfWork = Depends(get_uow)) -> TransactionalOperation:
    """Get Unit of Work wrapped in transactional context manager."""
    return TransactionalOperation(uow)


# Service factory functions for more complex scenarios
class ServiceFactory:
    """Factory for creating services with specific configurations."""
    
    @staticmethod
    def create_order_service_with_events(db: AsyncSession, event_bus: IEventBus) -> OrderDomainService:
        """Create Order service with specific event bus."""
        uow = UnitOfWork(db)
        service = OrderDomainService(uow)
        service.event_bus = event_bus
        return service
    
    @staticmethod
    def create_read_only_order_repository(db: AsyncSession) -> OrderRepository:
        """Create read-only Order repository (for queries)."""
        return OrderRepository(db)


# Global container cache (optional, for singleton behavior)
_global_containers = {}


def get_cached_container(session_id: str, db: AsyncSession) -> DependencyContainer:
    """Get cached container by session ID."""
    if session_id not in _global_containers:
        _global_containers[session_id] = DependencyContainer(db)
    return _global_containers[session_id]


def clear_container_cache():
    """Clear all cached containers."""
    global _global_containers
    _global_containers.clear() 