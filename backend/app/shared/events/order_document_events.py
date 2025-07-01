"""
Domain events for OrderDocument operations.
These events are published when order document operations occur.
"""
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass

from app.database.models.orders.enums import OrderDocumentType
from app.shared.events.base import DomainEvent


@dataclass
class OrderDocumentCreatedEvent(DomainEvent):
    """Event published when an order document is created."""
    document_id: uuid.UUID
    order_id: uuid.UUID
    document_type: OrderDocumentType
    title: Optional[str]
    file_path: str
    file_size: Optional[int]
    created_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order_document.created"


@dataclass
class OrderDocumentUpdatedEvent(DomainEvent):
    """Event published when an order document is updated."""
    document_id: uuid.UUID
    order_id: uuid.UUID
    updated_fields: Dict[str, Any]
    previous_values: Dict[str, Any]
    updated_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order_document.updated"


@dataclass
class OrderDocumentDeletedEvent(DomainEvent):
    """Event published when an order document is deleted."""
    document_id: uuid.UUID
    order_id: uuid.UUID
    document_type: OrderDocumentType
    file_path: str
    deleted_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order_document.deleted"


@dataclass
class OrderDocumentThumbnailGeneratedEvent(DomainEvent):
    """Event published when a document thumbnail is generated."""
    document_id: uuid.UUID
    order_id: uuid.UUID
    thumbnail_path: str
    original_file_path: str
    
    @property
    def event_type(self) -> str:
        return "order_document.thumbnail_generated"


@dataclass
class OrderDocumentTextExtractedEvent(DomainEvent):
    """Event published when text is extracted from a document."""
    document_id: uuid.UUID
    order_id: uuid.UUID
    text_length: int
    extraction_success: bool
    extraction_method: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order_document.text_extracted"


@dataclass
class OrderDocumentValidationFailedEvent(DomainEvent):
    """Event published when document validation fails."""
    document_id: Optional[uuid.UUID]
    order_id: Optional[uuid.UUID]
    validation_errors: List[str]
    attempted_operation: str  # "create", "update", "delete"
    file_path: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order_document.validation_failed"


@dataclass
class OrderDocumentFileUploadedEvent(DomainEvent):
    """Event published when a file is uploaded for a document."""
    document_id: uuid.UUID
    order_id: uuid.UUID
    original_filename: str
    stored_filename: str
    file_size: int
    content_type: str
    uploaded_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order_document.file_uploaded"


@dataclass
class OrderDocumentFileDeletedEvent(DomainEvent):
    """Event published when a document file is deleted from storage."""
    document_id: uuid.UUID
    order_id: uuid.UUID
    file_path: str
    deletion_success: bool
    deletion_reason: str  # "document_deleted", "file_cleanup", "error_recovery"
    
    @property
    def event_type(self) -> str:
        return "order_document.file_deleted"


@dataclass
class OrderDocumentBulkOperationEvent(DomainEvent):
    """Event published when bulk operations are performed on documents."""
    operation_type: str  # "bulk_delete", "bulk_update_thumbnails", etc.
    document_ids: List[uuid.UUID]
    order_id: Optional[uuid.UUID]
    operation_details: Dict[str, Any]
    performed_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return f"order_document.bulk_{self.operation_type}"


@dataclass
class OrderDocumentSecurityScanEvent(DomainEvent):
    """Event published when a document is scanned for security threats."""
    document_id: uuid.UUID
    order_id: uuid.UUID
    scan_result: str  # "clean", "threat_detected", "scan_failed"
    threat_details: Optional[str] = None
    scan_engine: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order_document.security_scan_completed"


@dataclass
class OrderDocumentComplianceCheckEvent(DomainEvent):
    """Event published when document compliance is checked."""
    document_id: uuid.UUID
    order_id: uuid.UUID
    compliance_result: str  # "compliant", "non_compliant", "check_failed"
    compliance_rules: List[str]
    violations: List[str]
    checked_by: Optional[str] = None
    
    @property
    def event_type(self) -> str:
        return "order_document.compliance_checked" 