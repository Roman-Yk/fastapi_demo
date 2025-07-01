"""
Custom exception classes for the application.
Provides domain-specific exceptions for better error handling.
"""
from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class DomainException(Exception):
    """Base exception for domain-specific errors."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class ResourceNotFoundException(DomainException):
    """Raised when a requested resource is not found."""
    pass


class ValidationException(DomainException):
    """Raised when validation fails."""
    pass


class BusinessRuleException(DomainException):
    """Raised when business rules are violated."""
    pass


class ExternalServiceException(DomainException):
    """Raised when external service calls fail."""
    pass


# HTTP Exception wrappers
class OrderNotFoundException(HTTPException):
    def __init__(self, order_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )


class OrderDocumentNotFoundException(HTTPException):
    def __init__(self, document_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order document with id {document_id} not found"
        )


class VehicleNotFoundException(HTTPException):
    def __init__(self, vehicle_id: str, vehicle_type: str = "Vehicle"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{vehicle_type} with id {vehicle_id} not found"
        )


class DriverNotFoundException(HTTPException):
    def __init__(self, driver_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Driver with id {driver_id} not found"
        )


class TerminalNotFoundException(HTTPException):
    def __init__(self, terminal_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Terminal with id {terminal_id} not found"
        )


class InvalidOrderStateException(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )


class DuplicateResourceException(HTTPException):
    def __init__(self, resource_type: str, identifier: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{resource_type} with identifier {identifier} already exists"
        ) 