"""
Domain service for OrderDocument operations.
Contains business logic and coordinates between repositories, validators, and events.
"""
import os
import uuid
import shutil
from typing import List, Optional, Tuple, Dict, Any
from pathlib import Path
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.order_document import OrderDocument as DomainOrderDocument
from app.domain.validators.order_document_validator import OrderDocumentValidator
from app.infrastructure.unit_of_work import UnitOfWork
from app.shared.events.base import get_event_bus
from app.shared.events.order_document_events import (
    OrderDocumentCreatedEvent, OrderDocumentUpdatedEvent, OrderDocumentDeletedEvent,
    OrderDocumentValidationFailedEvent, OrderDocumentFileUploadedEvent,
    OrderDocumentFileDeletedEvent, OrderDocumentThumbnailGeneratedEvent,
    OrderDocumentTextExtractedEvent, OrderDocumentBulkOperationEvent
)
from app.core.exceptions import (
    OrderDocumentNotFoundException, ValidationException, BusinessRuleException
)
from app.api.order_documents.schemas import UpdateOrderDocumentSchema
from app.database.models.orders import OrderDocument as OrderDocumentModel
from app.database.models.orders.enums import OrderDocumentType
from app.infrastructure.repositories.order_document_repository import CreateOrderDocumentSchema
from app.core.settings import settings
from app.api._shared.tasks.tasks import add_order_document_text


class OrderDocumentDomainService:
    """
    Domain service for OrderDocument operations.
    Handles business logic, validation, and event publishing.
    """
    
    def __init__(self, uow: UnitOfWork):
        self.uow = uow
        self.validator = OrderDocumentValidator(uow.session)
        self.event_bus = get_event_bus()
    
    async def create_order_document(
        self, 
        order_id: uuid.UUID,
        file: UploadFile,
        title: str,
        document_type: OrderDocumentType,
        created_by: Optional[str] = None
    ) -> OrderDocumentModel:
        """
        Create a new order document with full validation, file handling, and event publishing.
        """
        # Validate file upload first
        file_size = 0
        content_type = file.content_type or "application/octet-stream"
        
        # Read file content to get size
        file_content = await file.read()
        file_size = len(file_content)
        await file.seek(0)  # Reset file pointer
        
        # Validate file upload requirements
        upload_errors = await self.validator.validate_file_upload(
            file.filename or "unknown", file_size, content_type
        )
        if upload_errors:
            await self.event_bus.publish(OrderDocumentValidationFailedEvent(
                document_id=None,
                order_id=order_id,
                validation_errors=upload_errors,
                attempted_operation="create",
                file_path=file.filename
            ))
            raise ValidationException(f"File upload validation failed: {', '.join(upload_errors)}")
        
        # Generate unique filename and save file
        filename = f"{uuid.uuid4()}_{file.filename}"
        destination_path = os.path.join(settings.FILES_PATH, filename)
        
        # Ensure upload directory exists
        os.makedirs(settings.FILES_PATH, exist_ok=True)
        
        # Save file
        with open(destination_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create domain model for validation
        domain_document = DomainOrderDocument(
            order_id=order_id,
            title=title,
            src=destination_path,
            type=document_type
        )
        
        # Validate with domain validator
        validation_errors = await self.validator.validate_document_creation(domain_document)
        if validation_errors:
            # Clean up uploaded file
            if os.path.exists(destination_path):
                os.remove(destination_path)
            
            await self.event_bus.publish(OrderDocumentValidationFailedEvent(
                document_id=None,
                order_id=order_id,
                validation_errors=validation_errors,
                attempted_operation="create",
                file_path=destination_path
            ))
            raise ValidationException(f"Document validation failed: {', '.join(validation_errors)}")
        
        # Create the document in database
        create_schema = CreateOrderDocumentSchema(
            order_id=order_id,
            title=title,
            src=destination_path,
            type=document_type
        )
        
        document = await self.uow.order_documents.create(create_schema)
        await self.uow.flush()
        
        # Publish file uploaded event
        await self.event_bus.publish(OrderDocumentFileUploadedEvent(
            document_id=document.id,
            order_id=order_id,
            original_filename=file.filename or "unknown",
            stored_filename=filename,
            file_size=file_size,
            content_type=content_type,
            uploaded_by=created_by
        ))
        
        # Publish document created event
        await self.event_bus.publish(OrderDocumentCreatedEvent(
            document_id=document.id,
            order_id=order_id,
            document_type=document_type,
            title=title,
            file_path=destination_path,
            file_size=file_size,
            created_by=created_by
        ))
        
        # Schedule text extraction (async task)
        add_order_document_text.delay(document_id=document.id)
        
        return document
    
    async def update_order_document(
        self,
        document_id: uuid.UUID,
        update_data: UpdateOrderDocumentSchema,
        updated_by: Optional[str] = None
    ) -> OrderDocumentModel:
        """
        Update an existing order document with validation and event publishing.
        """
        # Get existing document
        existing_document = await self.uow.order_documents.get_by_id_or_404(document_id)
        
        # Convert to domain models
        existing_domain_document = self._convert_to_domain_document(existing_document)
        updated_domain_document = self._update_domain_document(existing_domain_document, update_data)
        
        # Validate update
        validation_errors = await self.validator.validate_document_update(
            existing_domain_document, updated_domain_document
        )
        if validation_errors:
            await self.event_bus.publish(OrderDocumentValidationFailedEvent(
                document_id=document_id,
                order_id=existing_document.order_id,
                validation_errors=validation_errors,
                attempted_operation="update"
            ))
            raise ValidationException(f"Document update validation failed: {', '.join(validation_errors)}")
        
        # Track what fields changed
        updated_fields = update_data.model_dump(exclude_unset=True)
        previous_values = {
            field: getattr(existing_document, field) 
            for field in updated_fields.keys() 
            if hasattr(existing_document, field)
        }
        
        # Update the document
        updated_document = await self.uow.order_documents.update(existing_document, update_data)
        await self.uow.flush()
        
        # Publish update event
        await self.event_bus.publish(OrderDocumentUpdatedEvent(
            document_id=document_id,
            order_id=updated_document.order_id,
            updated_fields=updated_fields,
            previous_values=previous_values,
            updated_by=updated_by
        ))
        
        return updated_document
    
    async def delete_order_document(
        self,
        document_id: uuid.UUID,
        deleted_by: Optional[str] = None
    ) -> bool:
        """
        Delete an order document with validation, file cleanup, and event publishing.
        """
        # Get existing document
        existing_document = await self.uow.order_documents.get_by_id_or_404(document_id)
        existing_domain_document = self._convert_to_domain_document(existing_document)
        
        # Validate deletion
        validation_errors = await self.validator.validate_document_deletion(existing_domain_document)
        if validation_errors:
            await self.event_bus.publish(OrderDocumentValidationFailedEvent(
                document_id=document_id,
                order_id=existing_document.order_id,
                validation_errors=validation_errors,
                attempted_operation="delete"
            ))
            raise ValidationException(f"Document deletion validation failed: {', '.join(validation_errors)}")
        
        # Delete associated file
        file_deletion_success = False
        if existing_document.src and os.path.exists(existing_document.src):
            try:
                os.remove(existing_document.src)
                file_deletion_success = True
            except Exception as e:
                # Log error but don't fail the deletion
                file_deletion_success = False
        
        # Delete thumbnail if exists
        if existing_document.thumbnail and os.path.exists(existing_document.thumbnail):
            try:
                os.remove(existing_document.thumbnail)
            except Exception:
                pass  # Continue with deletion even if thumbnail removal fails
        
        # Delete from database
        success = await self.uow.order_documents.delete(document_id)
        
        if success:
            # Publish file deletion event
            await self.event_bus.publish(OrderDocumentFileDeletedEvent(
                document_id=document_id,
                order_id=existing_document.order_id,
                file_path=existing_document.src or "",
                deletion_success=file_deletion_success,
                deletion_reason="document_deleted"
            ))
            
            # Publish document deletion event
            await self.event_bus.publish(OrderDocumentDeletedEvent(
                document_id=document_id,
                order_id=existing_document.order_id,
                document_type=existing_document.type,
                file_path=existing_document.src or "",
                deleted_by=deleted_by
            ))
        
        return success
    
    async def get_order_document_by_id(self, document_id: uuid.UUID) -> OrderDocumentModel:
        """Get order document by ID with proper error handling."""
        document = await self.uow.order_documents.get_by_id(document_id)
        if not document:
            raise OrderDocumentNotFoundException(str(document_id))
        return document
    
    async def get_documents_for_order(
        self,
        order_id: uuid.UUID,
        query_params=None
    ) -> Tuple[List[OrderDocumentModel], int]:
        """Get documents for a specific order with filtering, sorting, and pagination."""
        if query_params:
            return await self.uow.order_documents.get_documents_with_query_params(query_params, order_id)
        else:
            documents = await self.uow.order_documents.get_by_order_id(order_id)
            return documents, len(documents)
    
    async def search_documents(
        self,
        search_term: str,
        order_id: Optional[uuid.UUID] = None
    ) -> List[OrderDocumentModel]:
        """Search documents by various criteria."""
        return await self.uow.order_documents.search_documents(search_term, order_id)
    
    async def get_documents_statistics(
        self,
        order_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """Get document statistics."""
        return await self.uow.order_documents.get_documents_statistics(order_id)
    
    async def generate_thumbnail(
        self,
        document_id: uuid.UUID,
        thumbnail_path: str
    ) -> bool:
        """Generate and assign thumbnail for a document."""
        document = await self.uow.order_documents.get_by_id_or_404(document_id)
        
        # Update document with thumbnail path
        update_data = {"thumbnail": thumbnail_path}
        await self.uow.order_documents.update(document, update_data)
        await self.uow.flush()
        
        # Publish thumbnail generated event
        await self.event_bus.publish(OrderDocumentThumbnailGeneratedEvent(
            document_id=document_id,
            order_id=document.order_id,
            thumbnail_path=thumbnail_path,
            original_file_path=document.src or ""
        ))
        
        return True
    
    async def record_text_extraction(
        self,
        document_id: uuid.UUID,
        success: bool,
        text_length: int = 0,
        extraction_method: Optional[str] = None
    ) -> None:
        """Record the result of text extraction process."""
        document = await self.uow.order_documents.get_by_id_or_404(document_id)
        
        await self.event_bus.publish(OrderDocumentTextExtractedEvent(
            document_id=document_id,
            order_id=document.order_id,
            text_length=text_length,
            extraction_success=success,
            extraction_method=extraction_method
        ))
    
    async def bulk_delete_documents(
        self,
        document_ids: List[uuid.UUID],
        deleted_by: Optional[str] = None
    ) -> int:
        """Bulk delete multiple documents."""
        deleted_count = 0
        
        for document_id in document_ids:
            try:
                success = await self.delete_order_document(document_id, deleted_by)
                if success:
                    deleted_count += 1
            except Exception:
                # Continue with other deletions even if one fails
                continue
        
        if deleted_count > 0:
            await self.event_bus.publish(OrderDocumentBulkOperationEvent(
                operation_type="delete",
                document_ids=document_ids[:deleted_count],
                order_id=None,
                operation_details={"deleted_count": deleted_count},
                performed_by=deleted_by
            ))
        
        return deleted_count
    
    def _convert_to_domain_document(self, document_model: OrderDocumentModel) -> DomainOrderDocument:
        """Convert database model to domain document."""
        return DomainOrderDocument(
            id=document_model.id,
            order_id=document_model.order_id,
            title=document_model.title,
            src=document_model.src,
            thumbnail=document_model.thumbnail,
            type=document_model.type,
            created_at=document_model.created_at
        )
    
    def _update_domain_document(
        self,
        existing_document: DomainOrderDocument,
        update_data: UpdateOrderDocumentSchema
    ) -> DomainOrderDocument:
        """Update domain document with new data."""
        return DomainOrderDocument(
            id=existing_document.id,
            order_id=existing_document.order_id,
            title=getattr(update_data, 'title', existing_document.title),
            src=existing_document.src,  # File path shouldn't change in updates
            thumbnail=existing_document.thumbnail,
            type=getattr(update_data, 'type', existing_document.type),
            created_at=existing_document.created_at
        ) 