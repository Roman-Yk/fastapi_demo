"""
Domain validators for OrderDocument entity.
Contains complex business rule validations.
"""
import uuid
from typing import List, Optional
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.domain.models.order_document import OrderDocument
from app.database.models.orders import Order
from app.database.models.orders.enums import OrderDocumentType
from app.core.exceptions import ValidationException


class OrderDocumentValidator:
    """Domain validator for OrderDocument business rules."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def validate_document_creation(self, document: OrderDocument) -> List[str]:
        """
        Validate document creation with complex business rules.
        Returns list of validation errors.
        """
        errors = []
        
        # Basic validation
        errors.extend(document.validate())
        
        # Database-dependent validations
        if document.order_id:
            order_errors = await self._validate_order_exists(document.order_id)
            errors.extend(order_errors)
        
        # Business rule validations
        business_errors = await self._validate_business_rules(document)
        errors.extend(business_errors)
        
        # File validations
        if document.src:
            file_errors = await self._validate_file_requirements(document)
            errors.extend(file_errors)
        
        return errors
    
    async def validate_document_update(self, existing_document: OrderDocument, updated_document: OrderDocument) -> List[str]:
        """
        Validate document update with business rules.
        Returns list of validation errors.
        """
        errors = []
        
        # Check if document can be updated
        if not existing_document.can_be_updated():
            errors.append("Document cannot be updated in its current state")
        
        # Validate the updated document
        update_errors = await self.validate_document_creation(updated_document)
        errors.extend(update_errors)
        
        # Additional update-specific validations
        if existing_document.type != updated_document.type:
            type_change_errors = await self._validate_type_change(existing_document, updated_document)
            errors.extend(type_change_errors)
        
        return errors
    
    async def validate_document_deletion(self, document: OrderDocument) -> List[str]:
        """Validate if document can be deleted."""
        errors = []
        
        if not document.can_be_deleted():
            errors.append("Document cannot be deleted in its current state")
        
        # Add business rules for deletion
        deletion_errors = await self._validate_deletion_rules(document)
        errors.extend(deletion_errors)
        
        return errors
    
    async def _validate_order_exists(self, order_id: uuid.UUID) -> List[str]:
        """Validate that order exists."""
        query = select(Order).where(Order.id == order_id)
        result = await self.db.execute(query)
        order = result.scalar_one_or_none()
        
        if not order:
            return [f"Order with ID {order_id} does not exist"]
        return []
    
    async def _validate_business_rules(self, document: OrderDocument) -> List[str]:
        """Validate complex business rules."""
        errors = []
        
        # Example: Validate document type restrictions
        if document.type and document.order_id:
            type_errors = await self._validate_document_type_restrictions(document.order_id, document.type)
            errors.extend(type_errors)
        
        # Example: Validate file size limits
        if document.src:
            size_errors = self._validate_file_size(document)
            errors.extend(size_errors)
        
        # Example: Validate required documents
        if document.type == OrderDocumentType.CMR:
            cmr_errors = await self._validate_cmr_requirements(document)
            errors.extend(cmr_errors)
        
        return errors
    
    async def _validate_file_requirements(self, document: OrderDocument) -> List[str]:
        """Validate file-specific requirements."""
        errors = []
        
        if not document.src:
            return errors
        
        file_path = Path(document.src)
        
        # Check if file exists
        if not file_path.exists():
            errors.append(f"File does not exist: {document.src}")
            return errors
        
        # Check file extension
        extension = file_path.suffix.lower()
        allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx', '.txt', '.xlsx', '.xls'}
        
        if extension not in allowed_extensions:
            errors.append(f"File type {extension} is not allowed")
        
        # Check file is readable
        if not file_path.is_file():
            errors.append("Path is not a valid file")
        
        # Check file permissions
        if not file_path.stat().st_mode:
            errors.append("File is not readable")
        
        return errors
    
    def _validate_file_size(self, document: OrderDocument) -> List[str]:
        """Validate file size restrictions."""
        errors = []
        
        file_size = document.get_file_size()
        if file_size is None:
            return errors
        
        # 10MB limit for regular files
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        
        # Different limits for different types
        if document.is_image():
            max_size = 5 * 1024 * 1024  # 5MB for images
        elif document.is_pdf():
            max_size = 20 * 1024 * 1024  # 20MB for PDFs
        
        if file_size > max_size:
            max_mb = max_size / (1024 * 1024)
            errors.append(f"File size ({file_size / (1024 * 1024):.1f}MB) exceeds maximum allowed size ({max_mb:.1f}MB)")
        
        return errors
    
    async def _validate_document_type_restrictions(self, order_id: uuid.UUID, document_type: OrderDocumentType) -> List[str]:
        """Validate document type restrictions for an order."""
        errors = []
        
        # Example: Only one CMR document per order
        if document_type == OrderDocumentType.CMR:
            query = select(Order).where(Order.id == order_id)
            result = await self.db.execute(query)
            # Check if CMR already exists for this order
            # This is a business rule example
        
        # Example: Invoice documents require specific order status
        if document_type == OrderDocumentType.Invoice:
            # Add validation logic for invoice documents
            pass
        
        return errors
    
    async def _validate_cmr_requirements(self, document: OrderDocument) -> List[str]:
        """Validate specific requirements for CMR documents."""
        errors = []
        
        # CMR documents must be PDF
        if not document.is_pdf():
            errors.append("CMR documents must be in PDF format")
        
        # CMR documents must have a title
        if not document.title or len(document.title.strip()) == 0:
            errors.append("CMR documents must have a title")
        
        return errors
    
    async def _validate_type_change(self, existing_document: OrderDocument, updated_document: OrderDocument) -> List[str]:
        """Validate document type changes."""
        errors = []
        
        # Some document types might not be changeable
        critical_types = {OrderDocumentType.CMR, OrderDocumentType.Invoice}
        
        if existing_document.type in critical_types and existing_document.type != updated_document.type:
            errors.append(f"Cannot change document type from {existing_document.type} to {updated_document.type}")
        
        return errors
    
    async def _validate_deletion_rules(self, document: OrderDocument) -> List[str]:
        """Validate document deletion business rules."""
        errors = []
        
        # Example: CMR documents cannot be deleted after order completion
        if document.type == OrderDocumentType.CMR:
            # Check order status and prevent deletion if needed
            # This would require checking the order status
            pass
        
        # Example: Invoice documents cannot be deleted
        if document.type == OrderDocumentType.Invoice:
            errors.append("Invoice documents cannot be deleted")
        
        return errors
    
    async def validate_file_upload(self, file_path: str, file_size: int, content_type: str) -> List[str]:
        """Validate file upload requirements."""
        errors = []
        
        # Validate content type
        allowed_content_types = {
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
        
        if content_type not in allowed_content_types:
            errors.append(f"Content type {content_type} is not allowed")
        
        # Validate file size
        max_size = 20 * 1024 * 1024  # 20MB
        if file_size > max_size:
            errors.append(f"File size ({file_size / (1024 * 1024):.1f}MB) exceeds maximum allowed size (20MB)")
        
        # Validate file extension matches content type
        extension = Path(file_path).suffix.lower()
        content_type_mapping = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.txt': 'text/plain',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
        
        expected_content_type = content_type_mapping.get(extension)
        if expected_content_type and expected_content_type != content_type:
            errors.append(f"File extension {extension} does not match content type {content_type}")
        
        return errors 