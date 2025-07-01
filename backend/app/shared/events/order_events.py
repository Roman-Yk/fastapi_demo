"""
Order-related domain events.
These events are published when order operations occur.
"""
import uuid
from dataclasses import dataclass
from datetime import date, time
from typing import Optional, Dict, Any

from app.shared.events.base import BaseEvent


@dataclass
class OrderCreatedEvent(BaseEvent):
    """Event published when an order is created."""
    
    order_id: uuid.UUID
    reference: str
    service_type: int
    terminal_id: uuid.UUID
    created_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order.created"


@dataclass
class OrderUpdatedEvent(BaseEvent):
    """Event published when an order is updated."""
    
    order_id: uuid.UUID
    reference: str
    updated_fields: Dict[str, Any]
    updated_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order.updated"


@dataclass
class OrderDeletedEvent(BaseEvent):
    """Event published when an order is deleted."""
    
    order_id: uuid.UUID
    reference: str
    deleted_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order.deleted"


@dataclass
class OrderStatusChangedEvent(BaseEvent):
    """Event published when order status changes."""
    
    order_id: uuid.UUID
    reference: str
    old_status: Optional[str]
    new_status: str
    changed_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order.status_changed"


@dataclass
class OrderPriorityChangedEvent(BaseEvent):
    """Event published when order priority changes."""
    
    order_id: uuid.UUID
    reference: str
    old_priority: bool
    new_priority: bool
    changed_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order.priority_changed"


@dataclass
class OrderTransportAssignedEvent(BaseEvent):
    """Event published when transport is assigned to an order."""
    
    order_id: uuid.UUID
    reference: str
    transport_type: str  # "ETA" or "ETD"
    driver_id: Optional[uuid.UUID] = None
    truck_id: Optional[uuid.UUID] = None
    trailer_id: Optional[uuid.UUID] = None
    assigned_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order.transport_assigned"


@dataclass
class OrderTransportUnassignedEvent(BaseEvent):
    """Event published when transport is unassigned from an order."""
    
    order_id: uuid.UUID
    reference: str
    transport_type: str  # "ETA" or "ETD"
    driver_id: Optional[uuid.UUID] = None
    truck_id: Optional[uuid.UUID] = None
    trailer_id: Optional[uuid.UUID] = None
    unassigned_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order.transport_unassigned"


@dataclass
class OrderScheduleChangedEvent(BaseEvent):
    """Event published when order schedule (ETA/ETD) changes."""
    
    order_id: uuid.UUID
    reference: str
    schedule_type: str  # "ETA" or "ETD"
    old_date: Optional[date] = None
    new_date: Optional[date] = None
    old_time: Optional[time] = None
    new_time: Optional[time] = None
    changed_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order.schedule_changed"


@dataclass
class OrderValidationFailedEvent(BaseEvent):
    """Event published when order validation fails."""
    
    order_id: Optional[uuid.UUID]
    reference: Optional[str]
    validation_errors: list[str]
    attempted_operation: str  # "create", "update", "delete"
    
    @property
    def event_type(self) -> str:
        return "order.validation_failed"


@dataclass
class OrderDocumentAddedEvent(BaseEvent):
    """Event published when a document is added to an order."""
    
    order_id: uuid.UUID
    document_id: uuid.UUID
    document_title: str
    document_type: str
    added_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order.document_added"


@dataclass
class OrderBulkOperationEvent(BaseEvent):
    """Event published when bulk operations are performed on orders."""
    
    operation_type: str  # "bulk_update_priority", "bulk_delete", etc.
    order_ids: list[uuid.UUID]
    operation_details: Dict[str, Any]
    performed_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order.bulk_operation" 