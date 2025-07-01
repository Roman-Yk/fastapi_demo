"""
Base event system implementation.
Provides event-driven architecture capabilities.
"""
import uuid
import asyncio
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional, Type, TypeVar, Callable, Awaitable
from dataclasses import dataclass, field
import logging

logger = logging.getLogger(__name__)

EventType = TypeVar('EventType', bound='BaseEvent')
EventHandler = Callable[[EventType], Awaitable[None]]


@dataclass
class BaseEvent(ABC):
    """Base class for all events."""
    
    event_id: uuid.UUID = field(default_factory=uuid.uuid4)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    correlation_id: Optional[uuid.UUID] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    @abstractmethod
    def event_type(self) -> str:
        """Get the event type identifier."""
        pass


class IEventBus(ABC):
    """Event bus interface."""
    
    @abstractmethod
    async def publish(self, event: BaseEvent) -> None:
        """Publish an event."""
        pass
    
    @abstractmethod
    def subscribe(self, event_type: Type[BaseEvent], handler: EventHandler) -> None:
        """Subscribe to an event type."""
        pass
    
    @abstractmethod
    def unsubscribe(self, event_type: Type[BaseEvent], handler: EventHandler) -> None:
        """Unsubscribe from an event type."""
        pass


class InMemoryEventBus(IEventBus):
    """In-memory event bus implementation."""
    
    def __init__(self):
        self._handlers: Dict[Type[BaseEvent], List[EventHandler]] = {}
        self._event_history: List[BaseEvent] = []
        self._max_history_size = 1000
    
    def subscribe(self, event_type: Type[BaseEvent], handler: EventHandler) -> None:
        """Subscribe to an event type."""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)
        logger.info(f"Subscribed handler {handler.__name__} to event {event_type.__name__}")
    
    def unsubscribe(self, event_type: Type[BaseEvent], handler: EventHandler) -> None:
        """Unsubscribe from an event type."""
        if event_type in self._handlers and handler in self._handlers[event_type]:
            self._handlers[event_type].remove(handler)
            logger.info(f"Unsubscribed handler {handler.__name__} from event {event_type.__name__}")
    
    async def publish(self, event: BaseEvent) -> None:
        """Publish an event to all subscribers."""
        logger.info(f"Publishing event {event.event_type} with ID {event.event_id}")
        
        # Store event in history
        self._add_to_history(event)
        
        # Get handlers for this event type
        event_type = type(event)
        handlers = self._handlers.get(event_type, [])
        
        if not handlers:
            logger.warning(f"No handlers found for event type {event_type.__name__}")
            return
        
        # Execute all handlers concurrently
        tasks = []
        for handler in handlers:
            tasks.append(self._safe_execute_handler(handler, event))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _safe_execute_handler(self, handler: EventHandler, event: BaseEvent) -> None:
        """Safely execute an event handler."""
        try:
            await handler(event)
            logger.debug(f"Handler {handler.__name__} executed successfully for event {event.event_id}")
        except Exception as e:
            logger.error(f"Error executing handler {handler.__name__} for event {event.event_id}: {str(e)}")
    
    def _add_to_history(self, event: BaseEvent) -> None:
        """Add event to history with size limit."""
        self._event_history.append(event)
        if len(self._event_history) > self._max_history_size:
            self._event_history.pop(0)
    
    def get_event_history(self, limit: Optional[int] = None) -> List[BaseEvent]:
        """Get event history."""
        if limit:
            return self._event_history[-limit:]
        return self._event_history.copy()
    
    def get_handlers_count(self, event_type: Type[BaseEvent]) -> int:
        """Get number of handlers for an event type."""
        return len(self._handlers.get(event_type, []))


class EventPublisher:
    """Helper class for publishing events."""
    
    def __init__(self, event_bus: IEventBus):
        self.event_bus = event_bus
    
    async def publish(self, event: BaseEvent) -> None:
        """Publish an event."""
        await self.event_bus.publish(event)
    
    async def publish_multiple(self, events: List[BaseEvent]) -> None:
        """Publish multiple events."""
        tasks = [self.event_bus.publish(event) for event in events]
        await asyncio.gather(*tasks)


# Decorator for automatic event publishing
def publish_event(event_bus: IEventBus):
    """Decorator to automatically publish events from method results."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            if isinstance(result, BaseEvent):
                await event_bus.publish(result)
            elif isinstance(result, list) and all(isinstance(item, BaseEvent) for item in result):
                publisher = EventPublisher(event_bus)
                await publisher.publish_multiple(result)
            return result
        return wrapper
    return decorator


# Global event bus instance
_global_event_bus: Optional[IEventBus] = None


def get_event_bus() -> IEventBus:
    """Get the global event bus instance."""
    global _global_event_bus
    if _global_event_bus is None:
        _global_event_bus = InMemoryEventBus()
    return _global_event_bus


def set_event_bus(event_bus: IEventBus) -> None:
    """Set the global event bus instance."""
    global _global_event_bus
    _global_event_bus = event_bus 