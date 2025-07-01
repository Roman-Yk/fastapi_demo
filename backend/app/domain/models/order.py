"""
Domain model for Order entity.
Contains business logic and rules separate from database concerns.
"""
import uuid
from datetime import date, time
from typing import Optional
from dataclasses import dataclass
from enum import IntEnum

from app.core.exceptions import ValidationException, BusinessRuleException


class OrderService(IntEnum):
    """Order service types."""
    RELOAD_CAR_CAR = 1
    RELOAD_CAR_TERMINAL_CAR = 2
    INTO_PLUKK_STORAGE = 3


@dataclass
class Vehicle:
    """Domain model for Vehicle."""
    id: Optional[uuid.UUID] = None
    name: Optional[str] = None
    license_plate: Optional[str] = None


@dataclass
class Driver:
    """Domain model for Driver."""
    id: Optional[uuid.UUID] = None
    name: Optional[str] = None
    phone: Optional[str] = None


@dataclass
class Order:
    """
    Domain model for Order entity.
    Contains business logic and validation rules.
    Matches your actual database structure.
    """
    id: Optional[uuid.UUID] = None
    reference: Optional[str] = None
    service: Optional[OrderService] = None
    terminal_id: Optional[uuid.UUID] = None
    
    # Timing
    eta_date: Optional[date] = None
    eta_time: Optional[time] = None
    etd_date: Optional[date] = None
    etd_time: Optional[time] = None
    
    # Cargo details
    commodity: Optional[str] = None
    pallets: Optional[int] = None
    boxes: Optional[int] = None
    kilos: Optional[float] = None
    
    # Additional details
    notes: Optional[str] = None
    priority: bool = False
    
    # ETA Transport details (matching your DB structure)
    eta_driver_id: Optional[uuid.UUID] = None
    eta_trailer_id: Optional[uuid.UUID] = None
    eta_truck_id: Optional[uuid.UUID] = None
    eta_driver: Optional[str] = None
    eta_driver_phone: Optional[str] = None
    eta_truck: Optional[str] = None
    eta_trailer: Optional[str] = None
    
    # ETD Transport details (matching your DB structure)
    etd_driver_id: Optional[uuid.UUID] = None
    etd_trailer_id: Optional[uuid.UUID] = None
    etd_truck_id: Optional[uuid.UUID] = None
    etd_driver: Optional[str] = None
    etd_driver_phone: Optional[str] = None
    etd_truck: Optional[str] = None
    etd_trailer: Optional[str] = None
    
    # Audit
    created_at: Optional[date] = None
    updated_at: Optional[date] = None
    
    def validate(self) -> list[str]:
        """
        Validate the order according to business rules.
        Returns list of validation errors.
        """
        errors = []
        
        if not self.reference or len(self.reference.strip()) == 0:
            errors.append("Order reference is required")
        
        if self.reference and len(self.reference) > 32:
            errors.append("Order reference cannot exceed 32 characters")
        
        if self.service is None:
            errors.append("Order service type is required")
        
        if not self.terminal_id:
            errors.append("Terminal ID is required")
        
        if self.pallets is not None and self.pallets < 0:
            errors.append("Pallets count cannot be negative")
        
        if self.boxes is not None and self.boxes < 0:
            errors.append("Boxes count cannot be negative")
        
        if self.kilos is not None and self.kilos < 0:
            errors.append("Kilos cannot be negative")
        
        if self.eta_date and self.etd_date and self.eta_date > self.etd_date:
            errors.append("ETA date cannot be after ETD date")
        
        if self.notes and len(self.notes) > 1024:
            errors.append("Notes cannot exceed 1024 characters")
        
        if self.commodity and len(self.commodity) > 256:
            errors.append("Commodity description cannot exceed 256 characters")
        
        return errors
    
    def is_valid(self) -> bool:
        """Check if the order is valid."""
        return len(self.validate()) == 0
    
    def can_be_updated(self) -> bool:
        """
        Business rule: Check if order can be updated.
        Add your business logic here.
        """
        # Example: Orders cannot be updated if they are in certain states
        # This is where you'd implement your business rules
        return True
    
    def can_be_deleted(self) -> bool:
        """
        Business rule: Check if order can be deleted.
        Add your business logic here.
        """
        # Example: Orders cannot be deleted if they have associated documents
        # This is where you'd implement your business rules
        return True
    
    def calculate_total_weight(self) -> float:
        """Calculate total weight of the order."""
        return self.kilos or 0.0
    
    def calculate_total_items(self) -> int:
        """Calculate total number of items (pallets + boxes)."""
        return (self.pallets or 0) + (self.boxes or 0)
    
    def is_priority(self) -> bool:
        """Check if order is marked as priority."""
        return self.priority
    
    def has_eta_details(self) -> bool:
        """Check if order has ETA transport details."""
        return (self.eta_driver_id or self.eta_truck_id or self.eta_trailer_id)
    
    def has_etd_details(self) -> bool:
        """Check if order has ETD transport details."""
        return (self.etd_driver_id or self.etd_truck_id or self.etd_trailer_id)
    
    def update_transport_details(self, 
                               eta_driver_id: Optional[uuid.UUID] = None,
                               eta_truck_id: Optional[uuid.UUID] = None,
                               eta_trailer_id: Optional[uuid.UUID] = None,
                               etd_driver_id: Optional[uuid.UUID] = None,
                               etd_truck_id: Optional[uuid.UUID] = None,
                               etd_trailer_id: Optional[uuid.UUID] = None):
        """Update transport details for the order."""
        if eta_driver_id:
            self.eta_driver_id = eta_driver_id
        if eta_truck_id:
            self.eta_truck_id = eta_truck_id
        if eta_trailer_id:
            self.eta_trailer_id = eta_trailer_id
        if etd_driver_id:
            self.etd_driver_id = etd_driver_id
        if etd_truck_id:
            self.etd_truck_id = etd_truck_id
        if etd_trailer_id:
            self.etd_trailer_id = etd_trailer_id 