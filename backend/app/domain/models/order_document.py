"""
Domain model for OrderDocument entity.
Contains business logic and rules separate from database concerns.
"""
import uuid
from datetime import datetime
from typing import Optional
from dataclasses import dataclass
from pathlib import Path

from app.database.models.orders.enums import OrderDocumentType
from app.core.exceptions import ValidationException, BusinessRuleException


@dataclass
class OrderDocument:
    """
    Domain model for OrderDocument entity.
    Contains business logic and validation rules.
    """
    id: Optional[uuid.UUID] = None
    order_id: Optional[uuid.UUID] = None
    title: Optional[str] = None
    src: Optional[str] = None
    thumbnail: Optional[str] = None
    type: Optional[OrderDocumentType] = None
    created_at: Optional[datetime] = None
    
    def validate(self) -> list[str]:
        """
        Validate the order document according to business rules.
        Returns list of validation errors.
        """
        errors = []
        
        if not self.order_id:
            errors.append("Order ID is required")
        
        if not self.type:
            errors.append("Document type is required")
        
        if self.title and len(self.title) > 255:
            errors.append("Document title cannot exceed 255 characters")
        
        if self.src and not self.is_valid_file_path(self.src):
            errors.append("Invalid file path")
        
        return errors
    
    def is_valid(self) -> bool:
        """Check if the order document is valid."""
        return len(self.validate()) == 0
    
    def is_valid_file_path(self, file_path: str) -> bool:
        """Validate file path format and existence."""
        try:
            path = Path(file_path)
            # Basic validation - path should be absolute and exist
            return path.is_absolute() and path.exists()
        except Exception:
            return False
    
    def get_file_extension(self) -> Optional[str]:
        """Get file extension from source path."""
        if not self.src:
            return None
        return Path(self.src).suffix.lower()
    
    def get_file_name(self) -> Optional[str]:
        """Get file name from source path."""
        if not self.src:
            return None
        return Path(self.src).name
    
    def get_file_size(self) -> Optional[int]:
        """Get file size in bytes."""
        if not self.src or not Path(self.src).exists():
            return None
        return Path(self.src).stat().st_size
    
    def is_image(self) -> bool:
        """Check if document is an image file."""
        image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
        return self.get_file_extension() in image_extensions
    
    def is_pdf(self) -> bool:
        """Check if document is a PDF file."""
        return self.get_file_extension() == '.pdf'
    
    def is_text_extractable(self) -> bool:
        """Check if text can be extracted from this document type."""
        extractable_extensions = {'.pdf', '.txt', '.docx', '.doc'}
        return self.get_file_extension() in extractable_extensions
    
    def can_be_updated(self) -> bool:
        """
        Business rule: Check if document can be updated.
        """
        # Example: Some document types might be immutable after creation
        return True
    
    def can_be_deleted(self) -> bool:
        """
        Business rule: Check if document can be deleted.
        """
        # Example: Critical documents might not be deletable
        return True
    
    def should_generate_thumbnail(self) -> bool:
        """Check if thumbnail should be generated for this document."""
        return self.is_image() or self.is_pdf()
    
    def get_display_name(self) -> str:
        """Get display name for the document."""
        if self.title:
            return self.title
        if self.src:
            return self.get_file_name() or "Untitled Document"
        return "Untitled Document"
    
    def get_type_display_name(self) -> str:
        """Get human-readable type name."""
        if not self.type:
            return "Unknown"
        
        # Use the actual enum values from your database
        return str(self.type.value) if self.type else "Unknown" 