"""
Domain validators for Order entity.
Contains complex business rule validations.
"""
import uuid
from datetime import date, datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.domain.models.order import Order
from app.database.models.terminals import Terminal
from app.database.models.drivers import Driver
from app.database.models.vehicles import Truck, Trailer
from app.core.exceptions import ValidationException


class OrderValidator:
    """Domain validator for Order business rules."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def validate_order_creation(self, order: Order) -> List[str]:
        """
        Validate order creation with complex business rules.
        Returns list of validation errors.
        """
        errors = []
        
        # Basic validation
        errors.extend(order.validate())
        
        # Database-dependent validations
        if order.terminal_id:
            terminal_errors = await self._validate_terminal_exists(order.terminal_id)
            errors.extend(terminal_errors)
        
        # Validate ETA transport details
        if order.has_eta_details():
            eta_errors = await self._validate_eta_transport_details(order)
            errors.extend(eta_errors)
        
        # Validate ETD transport details
        if order.has_etd_details():
            etd_errors = await self._validate_etd_transport_details(order)
            errors.extend(etd_errors)
        
        # Business rule validations
        business_errors = await self._validate_business_rules(order)
        errors.extend(business_errors)
        
        return errors
    
    async def validate_order_update(self, existing_order: Order, updated_order: Order) -> List[str]:
        """
        Validate order update with business rules.
        Returns list of validation errors.
        """
        errors = []
        
        # Check if order can be updated
        if not existing_order.can_be_updated():
            errors.append("Order cannot be updated in its current state")
        
        # Validate the updated order
        update_errors = await self.validate_order_creation(updated_order)
        errors.extend(update_errors)
        
        # Additional update-specific validations
        if existing_order.reference != updated_order.reference:
            if not await self._can_change_reference(existing_order, updated_order.reference):
                errors.append("Order reference cannot be changed")
        
        return errors
    
    async def _validate_terminal_exists(self, terminal_id: uuid.UUID) -> List[str]:
        """Validate that terminal exists."""
        query = select(Terminal).where(Terminal.id == terminal_id)
        result = await self.db.execute(query)
        terminal = result.scalar_one_or_none()
        
        if not terminal:
            return [f"Terminal with ID {terminal_id} does not exist"]
        return []
    
    async def _validate_eta_transport_details(self, order: Order) -> List[str]:
        """Validate ETA transport details (driver, truck, trailer)."""
        errors = []
        
        if order.eta_driver_id:
            driver_errors = await self._validate_driver_exists(order.eta_driver_id)
            if driver_errors:
                errors.extend([f"ETA {error}" for error in driver_errors])
        
        if order.eta_truck_id:
            truck_errors = await self._validate_truck_exists(order.eta_truck_id)
            if truck_errors:
                errors.extend([f"ETA {error}" for error in truck_errors])
        
        if order.eta_trailer_id:
            trailer_errors = await self._validate_trailer_exists(order.eta_trailer_id)
            if trailer_errors:
                errors.extend([f"ETA {error}" for error in trailer_errors])
        
        return errors
    
    async def _validate_etd_transport_details(self, order: Order) -> List[str]:
        """Validate ETD transport details (driver, truck, trailer)."""
        errors = []
        
        if order.etd_driver_id:
            driver_errors = await self._validate_driver_exists(order.etd_driver_id)
            if driver_errors:
                errors.extend([f"ETD {error}" for error in driver_errors])
        
        if order.etd_truck_id:
            truck_errors = await self._validate_truck_exists(order.etd_truck_id)
            if truck_errors:
                errors.extend([f"ETD {error}" for error in truck_errors])
        
        if order.etd_trailer_id:
            trailer_errors = await self._validate_trailer_exists(order.etd_trailer_id)
            if trailer_errors:
                errors.extend([f"ETD {error}" for error in trailer_errors])
        
        return errors
    
    async def _validate_driver_exists(self, driver_id: uuid.UUID) -> List[str]:
        """Validate that driver exists."""
        query = select(Driver).where(Driver.id == driver_id)
        result = await self.db.execute(query)
        driver = result.scalar_one_or_none()
        
        if not driver:
            return [f"driver with ID {driver_id} does not exist"]
        return []
    
    async def _validate_truck_exists(self, truck_id: uuid.UUID) -> List[str]:
        """Validate that truck exists."""
        query = select(Truck).where(Truck.id == truck_id)
        result = await self.db.execute(query)
        truck = result.scalar_one_or_none()
        
        if not truck:
            return [f"truck with ID {truck_id} does not exist"]
        return []
    
    async def _validate_trailer_exists(self, trailer_id: uuid.UUID) -> List[str]:
        """Validate that trailer exists."""
        query = select(Trailer).where(Trailer.id == trailer_id)
        result = await self.db.execute(query)
        trailer = result.scalar_one_or_none()
        
        if not trailer:
            return [f"trailer with ID {trailer_id} does not exist"]
        return []
    
    async def _validate_business_rules(self, order: Order) -> List[str]:
        """Validate complex business rules."""
        errors = []
        
        # Example: Validate that ETA date is not in the past for new orders
        if order.eta_date and order.eta_date < date.today():
            errors.append("ETA date cannot be in the past")
        
        # Example: Validate cargo capacity limits
        if order.pallets and order.pallets > 100:  # Adjust limit as needed
            errors.append("Pallet count exceeds maximum capacity (100)")
        
        # Example: Validate service type against terminal capabilities
        if order.service and order.terminal_id:
            terminal_service_errors = await self._validate_terminal_service_compatibility(
                order.terminal_id, order.service
            )
            errors.extend(terminal_service_errors)
        
        return errors
    
    async def _validate_terminal_service_compatibility(self, terminal_id: uuid.UUID, service: int) -> List[str]:
        """Validate that terminal supports the requested service type."""
        # This is a placeholder for business logic
        # You would implement actual terminal-service compatibility checks here
        return []
    
    async def _can_change_reference(self, existing_order: Order, new_reference: str) -> bool:
        """Check if order reference can be changed."""
        # Implement business logic for reference changes
        # For example, references might not be changeable after certain milestones
        return True
    
    async def validate_order_deletion(self, order: Order) -> List[str]:
        """Validate if order can be deleted."""
        errors = []
        
        if not order.can_be_deleted():
            errors.append("Order cannot be deleted in its current state")
        
        # Add additional deletion validations
        # For example, check if order has related documents, shipments, etc.
        
        return errors 