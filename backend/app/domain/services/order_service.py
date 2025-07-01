"""
Domain service for Order operations.
Contains business logic and coordinates between repositories, validators, and events.
"""
import uuid
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.order import Order as DomainOrder, OrderService as OrderServiceType
from app.domain.validators.order_validator import OrderValidator
from app.infrastructure.unit_of_work import UnitOfWork
from app.shared.events.base import get_event_bus
from app.shared.events.order_events import (
    OrderCreatedEvent, OrderUpdatedEvent, OrderDeletedEvent,
    OrderPriorityChangedEvent, OrderValidationFailedEvent,
    OrderTransportAssignedEvent, OrderBulkOperationEvent
)
from app.core.exceptions import (
    OrderNotFoundException, ValidationException, BusinessRuleException
)
from app.api.orders.schemas import CreateOrderSchema, UpdateOrderSchema
from app.database.models.orders import Order as OrderModel


class OrderDomainService:
    """
    Domain service for Order operations.
    Handles business logic, validation, and event publishing.
    """
    
    def __init__(self, uow: UnitOfWork):
        self.uow = uow
        self.validator = OrderValidator(uow.session)
        self.event_bus = get_event_bus()
    
    async def create_order(self, order_data: CreateOrderSchema, created_by: Optional[str] = None) -> OrderModel:
        """
        Create a new order with full validation and event publishing.
        """
        # Convert to domain model for validation
        domain_order = self._create_domain_order_from_schema(order_data)
        
        # Validate with domain validator
        validation_errors = await self.validator.validate_order_creation(domain_order)
        if validation_errors:
            # Publish validation failed event
            await self.event_bus.publish(OrderValidationFailedEvent(
                order_id=None,
                reference=order_data.reference,
                validation_errors=validation_errors,
                attempted_operation="create"
            ))
            raise ValidationException(f"Order validation failed: {', '.join(validation_errors)}")
        
        # Create the order
        order = await self.uow.orders.create(order_data)
        await self.uow.flush()
        
        # Publish order created event
        await self.event_bus.publish(OrderCreatedEvent(
            order_id=order.id,
            reference=order.reference,
            service_type=order.service,
            terminal_id=order.terminal_id,
            created_by=created_by
        ))
        
        return order
    
    async def update_order(self, order_id: uuid.UUID, update_data: UpdateOrderSchema, 
                          updated_by: Optional[str] = None) -> OrderModel:
        """
        Update an existing order with validation and event publishing.
        """
        # Get existing order
        existing_order = await self.uow.orders.get_by_id_or_404(order_id)
        
        # Convert to domain models
        existing_domain_order = self._convert_to_domain_order(existing_order)
        updated_domain_order = self._update_domain_order(existing_domain_order, update_data)
        
        # Validate update
        validation_errors = await self.validator.validate_order_update(existing_domain_order, updated_domain_order)
        if validation_errors:
            await self.event_bus.publish(OrderValidationFailedEvent(
                order_id=order_id,
                reference=existing_order.reference,
                validation_errors=validation_errors,
                attempted_operation="update"
            ))
            raise ValidationException(f"Order update validation failed: {', '.join(validation_errors)}")
        
        # Track what fields changed
        updated_fields = update_data.model_dump(exclude_unset=True)
        
        # Check for priority changes
        if 'priority' in updated_fields and existing_order.priority != updated_fields['priority']:
            await self.event_bus.publish(OrderPriorityChangedEvent(
                order_id=order_id,
                reference=existing_order.reference,
                old_priority=existing_order.priority,
                new_priority=updated_fields['priority'],
                changed_by=updated_by
            ))
        
        # Update the order
        updated_order = await self.uow.orders.update(existing_order, update_data)
        await self.uow.flush()
        
        # Publish update event
        await self.event_bus.publish(OrderUpdatedEvent(
            order_id=order_id,
            reference=updated_order.reference,
            updated_fields=updated_fields,
            updated_by=updated_by
        ))
        
        return updated_order
    
    async def delete_order(self, order_id: uuid.UUID, deleted_by: Optional[str] = None) -> bool:
        """
        Delete an order with validation and event publishing.
        """
        # Get existing order
        existing_order = await self.uow.orders.get_by_id_or_404(order_id)
        existing_domain_order = self._convert_to_domain_order(existing_order)
        
        # Validate deletion
        validation_errors = await self.validator.validate_order_deletion(existing_domain_order)
        if validation_errors:
            await self.event_bus.publish(OrderValidationFailedEvent(
                order_id=order_id,
                reference=existing_order.reference,
                validation_errors=validation_errors,
                attempted_operation="delete"
            ))
            raise ValidationException(f"Order deletion validation failed: {', '.join(validation_errors)}")
        
        # Delete the order
        success = await self.uow.orders.delete(order_id)
        
        if success:
            # Publish deletion event
            await self.event_bus.publish(OrderDeletedEvent(
                order_id=order_id,
                reference=existing_order.reference,
                deleted_by=deleted_by
            ))
        
        return success
    
    async def get_order_by_id(self, order_id: uuid.UUID) -> OrderModel:
        """Get order by ID with proper error handling."""
        order = await self.uow.orders.get_by_id(order_id)
        if not order:
            raise OrderNotFoundException(str(order_id))
        return order
    
    async def get_orders_with_params(self, query_params) -> Tuple[List[OrderModel], int]:
        """Get orders with filtering, sorting, and pagination."""
        return await self.uow.orders.get_orders_with_query_params(query_params)
    
    async def assign_transport_to_order(self, order_id: uuid.UUID, transport_type: str,
                                      driver_id: Optional[uuid.UUID] = None,
                                      truck_id: Optional[uuid.UUID] = None,
                                      trailer_id: Optional[uuid.UUID] = None,
                                      assigned_by: Optional[str] = None) -> OrderModel:
        """
        Assign transport details to an order using domain logic.
        """
        order = await self.uow.orders.get_by_id_or_404(order_id)
        
        # Convert to domain model
        domain_order = self._convert_to_domain_order(order)
        
        # Validate transport entities exist
        if driver_id and not await self.uow.drivers.exists(driver_id):
            raise ValidationException(f"Driver {driver_id} not found")
        if truck_id and not await self.uow.trucks.exists(truck_id):
            raise ValidationException(f"Truck {truck_id} not found")
        if trailer_id and not await self.uow.trailers.exists(trailer_id):
            raise ValidationException(f"Trailer {trailer_id} not found")
        
        # Use domain model method to update transport details
        domain_order.update_transport_details(
            eta_driver_id=driver_id if transport_type.upper() == "ETA" else None,
            eta_truck_id=truck_id if transport_type.upper() == "ETA" else None,
            eta_trailer_id=trailer_id if transport_type.upper() == "ETA" else None,
            etd_driver_id=driver_id if transport_type.upper() == "ETD" else None,
            etd_truck_id=truck_id if transport_type.upper() == "ETD" else None,
            etd_trailer_id=trailer_id if transport_type.upper() == "ETD" else None
        )
        
        # Convert transport details to update data for database
        update_data = {}
        if transport_type.upper() == "ETA":
            if driver_id:
                update_data["eta_driver_id"] = driver_id
            if truck_id:
                update_data["eta_truck_id"] = truck_id
            if trailer_id:
                update_data["eta_trailer_id"] = trailer_id
        elif transport_type.upper() == "ETD":
            if driver_id:
                update_data["etd_driver_id"] = driver_id
            if truck_id:
                update_data["etd_truck_id"] = truck_id
            if trailer_id:
                update_data["etd_trailer_id"] = trailer_id
        
        updated_order = await self.uow.orders.update(order, update_data)
        await self.uow.flush()
        
        # Publish transport assigned event
        await self.event_bus.publish(OrderTransportAssignedEvent(
            order_id=order_id,
            reference=order.reference,
            transport_type=transport_type.upper(),
            driver_id=driver_id,
            truck_id=truck_id,
            trailer_id=trailer_id,
            assigned_by=assigned_by
        ))
        
        return updated_order
    
    async def bulk_update_priority(self, order_ids: List[uuid.UUID], priority: bool,
                                 updated_by: Optional[str] = None) -> int:
        """
        Bulk update priority for multiple orders.
        """
        # Update orders
        updated_count = await self.uow.orders.bulk_update_priority(order_ids, priority)
        
        if updated_count > 0:
            # Publish bulk operation event
            await self.event_bus.publish(OrderBulkOperationEvent(
                operation_type="bulk_update_priority",
                order_ids=order_ids,
                operation_details={"priority": priority},
                performed_by=updated_by
            ))
        
        return updated_count
    
    async def get_order_statistics(self) -> Dict[str, Any]:
        """Get order statistics."""
        return await self.uow.orders.get_orders_statistics()
    
    async def search_orders(self, search_term: str) -> List[OrderModel]:
        """Search orders by various criteria."""
        return await self.uow.orders.search_orders(search_term)
    
    def _create_domain_order_from_schema(self, schema: CreateOrderSchema) -> DomainOrder:
        """Convert CreateOrderSchema to domain order (without transport details)."""
        return DomainOrder(
            reference=schema.reference,
            service=OrderServiceType(schema.service),
            terminal_id=schema.terminal_id,
            eta_date=schema.eta_date,
            eta_time=schema.eta_time,
            etd_date=schema.etd_date,
            etd_time=schema.etd_time,
            commodity=getattr(schema, 'commodity', None),
            pallets=getattr(schema, 'pallets', None),
            boxes=getattr(schema, 'boxes', None),
            kilos=getattr(schema, 'kilos', None),
            notes=getattr(schema, 'notes', None),
            priority=getattr(schema, 'priority', False)
            # Transport details are None by default for new orders
            # They will be assigned later via updates or transport assignment endpoints
        )
    
    def _convert_to_domain_order(self, order_model: OrderModel) -> DomainOrder:
        """Convert database model to domain order."""
        return DomainOrder(
            id=order_model.id,
            reference=order_model.reference,
            service=OrderServiceType(order_model.service) if order_model.service else None,
            terminal_id=order_model.terminal_id,
            eta_date=order_model.eta_date,
            eta_time=order_model.eta_time,
            etd_date=order_model.etd_date,
            etd_time=order_model.etd_time,
            commodity=order_model.commodity,
            pallets=order_model.pallets,
            boxes=order_model.boxes,
            kilos=order_model.kilos,
            notes=order_model.notes,
            priority=order_model.priority,
            # ETA transport details
            eta_driver_id=order_model.eta_driver_id,
            eta_trailer_id=order_model.eta_trailer_id,
            eta_truck_id=order_model.eta_truck_id,
            eta_driver=order_model.eta_driver,
            eta_driver_phone=order_model.eta_driver_phone,
            eta_truck=order_model.eta_truck,
            eta_trailer=order_model.eta_trailer,
            # ETD transport details
            etd_driver_id=order_model.etd_driver_id,
            etd_trailer_id=order_model.etd_trailer_id,
            etd_truck_id=order_model.etd_truck_id,
            etd_driver=order_model.etd_driver,
            etd_driver_phone=order_model.etd_driver_phone,
            etd_truck=order_model.etd_truck,
            etd_trailer=order_model.etd_trailer,
            # Audit fields
            created_at=order_model.created_at,
            updated_at=order_model.updated_at
        )
    
    def _update_domain_order(self, existing_order: DomainOrder, update_data: UpdateOrderSchema) -> DomainOrder:
        """Update domain order with new data."""
        updated_order = DomainOrder(
            id=existing_order.id,
            reference=existing_order.reference,
            service=existing_order.service,
            terminal_id=existing_order.terminal_id,
            eta_date=update_data.eta_date if hasattr(update_data, 'eta_date') else existing_order.eta_date,
            eta_time=update_data.eta_time if hasattr(update_data, 'eta_time') else existing_order.eta_time,
            etd_date=update_data.etd_date if hasattr(update_data, 'etd_date') else existing_order.etd_date,
            etd_time=update_data.etd_time if hasattr(update_data, 'etd_time') else existing_order.etd_time,
            commodity=update_data.commodity if hasattr(update_data, 'commodity') else existing_order.commodity,
            pallets=update_data.pallets if hasattr(update_data, 'pallets') else existing_order.pallets,
            boxes=update_data.boxes if hasattr(update_data, 'boxes') else existing_order.boxes,
            kilos=update_data.kilos if hasattr(update_data, 'kilos') else existing_order.kilos,
            notes=getattr(update_data, 'notes', existing_order.notes),
            priority=getattr(update_data, 'priority', existing_order.priority),
            # ETA transport details - use update data if available, otherwise keep existing
            eta_driver_id=getattr(update_data, 'eta_driver_id', existing_order.eta_driver_id),
            eta_trailer_id=getattr(update_data, 'eta_trailer_id', existing_order.eta_trailer_id),
            eta_truck_id=getattr(update_data, 'eta_truck_id', existing_order.eta_truck_id),
            eta_driver=getattr(update_data, 'eta_driver', existing_order.eta_driver),
            eta_driver_phone=getattr(update_data, 'eta_driver_phone', existing_order.eta_driver_phone),
            eta_truck=getattr(update_data, 'eta_truck', existing_order.eta_truck),
            eta_trailer=getattr(update_data, 'eta_trailer', existing_order.eta_trailer),
            # ETD transport details - use update data if available, otherwise keep existing
            etd_driver_id=getattr(update_data, 'etd_driver_id', existing_order.etd_driver_id),
            etd_trailer_id=getattr(update_data, 'etd_trailer_id', existing_order.etd_trailer_id),
            etd_truck_id=getattr(update_data, 'etd_truck_id', existing_order.etd_truck_id),
            etd_driver=getattr(update_data, 'etd_driver', existing_order.etd_driver),
            etd_driver_phone=getattr(update_data, 'etd_driver_phone', existing_order.etd_driver_phone),
            etd_truck=getattr(update_data, 'etd_truck', existing_order.etd_truck),
            etd_trailer=getattr(update_data, 'etd_trailer', existing_order.etd_trailer),
            # Audit fields
            created_at=existing_order.created_at,
            updated_at=existing_order.updated_at
        )
        return updated_order 