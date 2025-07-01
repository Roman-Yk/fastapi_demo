"""
Unit of Work pattern implementation.
Coordinates transactions across multiple repositories.
"""
from abc import ABC, abstractmethod
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.order_repository import OrderRepository
from app.infrastructure.repositories.order_document_repository import OrderDocumentRepository
from app.infrastructure.repositories.driver_repository import DriverRepository
from app.infrastructure.repositories.vehicle_repository import TruckRepository, TrailerRepository
from app.infrastructure.repositories.terminal_repository import TerminalRepository


class IUnitOfWork(ABC):
    """Unit of Work interface."""
    
    orders: OrderRepository
    order_documents: OrderDocumentRepository
    drivers: DriverRepository
    trucks: TruckRepository
    trailers: TrailerRepository
    terminals: TerminalRepository
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            await self.rollback()
        else:
            await self.commit()
    
    @abstractmethod
    async def commit(self):
        """Commit the transaction."""
        pass
    
    @abstractmethod
    async def rollback(self):
        """Rollback the transaction."""
        pass


class UnitOfWork(IUnitOfWork):
    """Unit of Work implementation with SQLAlchemy."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self._orders: Optional[OrderRepository] = None
        self._order_documents: Optional[OrderDocumentRepository] = None
        self._drivers: Optional[DriverRepository] = None
        self._trucks: Optional[TruckRepository] = None
        self._trailers: Optional[TrailerRepository] = None
        self._terminals: Optional[TerminalRepository] = None
    
    @property
    def orders(self) -> OrderRepository:
        """Get or create OrderRepository."""
        if self._orders is None:
            self._orders = OrderRepository(self.session)
        return self._orders
    
    @property
    def order_documents(self) -> OrderDocumentRepository:
        """Get or create OrderDocumentRepository."""
        if self._order_documents is None:
            self._order_documents = OrderDocumentRepository(self.session)
        return self._order_documents
    
    @property
    def drivers(self) -> DriverRepository:
        """Get or create DriverRepository."""
        if self._drivers is None:
            self._drivers = DriverRepository(self.session)
        return self._drivers
    
    @property
    def trucks(self) -> TruckRepository:
        """Get or create TruckRepository."""
        if self._trucks is None:
            self._trucks = TruckRepository(self.session)
        return self._trucks
    
    @property
    def trailers(self) -> TrailerRepository:
        """Get or create TrailerRepository."""
        if self._trailers is None:
            self._trailers = TrailerRepository(self.session)
        return self._trailers
    
    @property
    def terminals(self) -> TerminalRepository:
        """Get or create TerminalRepository."""
        if self._terminals is None:
            self._terminals = TerminalRepository(self.session)
        return self._terminals
    
    async def commit(self):
        """Commit the transaction."""
        await self.session.commit()
    
    async def rollback(self):
        """Rollback the transaction."""
        await self.session.rollback()
    
    async def flush(self):
        """Flush pending changes to database."""
        await self.session.flush()
    
    async def refresh(self, instance):
        """Refresh instance from database."""
        await self.session.refresh(instance)


class UnitOfWorkManager:
    """
    Manager for creating Unit of Work instances.
    Useful for dependency injection.
    """
    
    def __init__(self, session_factory):
        self.session_factory = session_factory
    
    def create_unit_of_work(self, session: AsyncSession) -> UnitOfWork:
        """Create a new Unit of Work instance."""
        return UnitOfWork(session)
    
    async def execute_in_transaction(self, func, session: AsyncSession):
        """Execute function within a transaction."""
        async with UnitOfWork(session) as uow:
            return await func(uow) 