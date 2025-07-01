"""
Event handlers for domain events.
Demonstrates how to handle events for logging, caching, notifications, etc.
"""
import logging
from typing import Dict, Any

from app.shared.events.base import get_event_bus
from app.shared.events.order_events import (
    OrderCreatedEvent, OrderUpdatedEvent, OrderDeletedEvent,
    OrderPriorityChangedEvent, OrderValidationFailedEvent,
    OrderTransportAssignedEvent, OrderBulkOperationEvent
)
from app.shared.events.order_document_events import (
    OrderDocumentCreatedEvent, OrderDocumentUpdatedEvent, OrderDocumentDeletedEvent,
    OrderDocumentValidationFailedEvent, OrderDocumentFileUploadedEvent,
    OrderDocumentFileDeletedEvent, OrderDocumentThumbnailGeneratedEvent,
    OrderDocumentTextExtractedEvent, OrderDocumentBulkOperationEvent
)

logger = logging.getLogger(__name__)


class OrderEventHandlers:
    """Collection of event handlers for order-related events."""
    
    @staticmethod
    async def log_order_created(event: OrderCreatedEvent) -> None:
        """Log order creation events."""
        logger.info(
            f"Order created: {event.reference} (ID: {event.order_id})",
            extra={
                "event_id": event.event_id,
                "order_id": event.order_id,
                "reference": event.reference,
                "service_type": event.service_type,
                "created_by": event.created_by
            }
        )
    
    @staticmethod
    async def log_order_updated(event: OrderUpdatedEvent) -> None:
        """Log order update events."""
        logger.info(
            f"Order updated: {event.reference} (ID: {event.order_id})",
            extra={
                "event_id": event.event_id,
                "order_id": event.order_id,
                "reference": event.reference,
                "updated_fields": event.updated_fields,
                "updated_by": event.updated_by
            }
        )
    
    @staticmethod
    async def log_order_deleted(event: OrderDeletedEvent) -> None:
        """Log order deletion events."""
        logger.info(
            f"Order deleted: {event.reference} (ID: {event.order_id})",
            extra={
                "event_id": event.event_id,
                "order_id": event.order_id,
                "reference": event.reference,
                "deleted_by": event.deleted_by
            }
        )
    
    @staticmethod
    async def handle_priority_change(event: OrderPriorityChangedEvent) -> None:
        """Handle priority changes with special logic."""
        logger.warning(
            f"Order priority changed: {event.reference} - "
            f"Priority: {event.old_priority} -> {event.new_priority}",
            extra={
                "event_id": event.event_id,
                "order_id": event.order_id,
                "reference": event.reference,
                "old_priority": event.old_priority,
                "new_priority": event.new_priority,
                "changed_by": event.changed_by
            }
        )
        
        # Example: Send notification for high-priority orders
        if event.new_priority:
            await OrderEventHandlers._send_priority_notification(event)
    
    @staticmethod
    async def handle_validation_failure(event: OrderValidationFailedEvent) -> None:
        """Handle validation failures."""
        logger.error(
            f"Order validation failed: {event.reference or 'Unknown'} - "
            f"Operation: {event.attempted_operation}",
            extra={
                "event_id": event.event_id,
                "order_id": event.order_id,
                "reference": event.reference,
                "validation_errors": event.validation_errors,
                "attempted_operation": event.attempted_operation
            }
        )
        
        # Example: Track validation failures for analytics
        await OrderEventHandlers._track_validation_failure(event)
    
    @staticmethod
    async def handle_transport_assignment(event: OrderTransportAssignedEvent) -> None:
        """Handle transport assignment events."""
        logger.info(
            f"Transport assigned to order: {event.reference} - "
            f"Type: {event.transport_type}",
            extra={
                "event_id": event.event_id,
                "order_id": event.order_id,
                "reference": event.reference,
                "transport_type": event.transport_type,
                "driver_id": event.driver_id,
                "truck_id": event.truck_id,
                "trailer_id": event.trailer_id,
                "assigned_by": event.assigned_by
            }
        )
        
        # Example: Update transport scheduling system
        await OrderEventHandlers._update_transport_schedule(event)
    
    @staticmethod
    async def handle_bulk_operation(event: OrderBulkOperationEvent) -> None:
        """Handle bulk operations."""
        logger.info(
            f"Bulk operation performed: {event.operation_type} - "
            f"Affected orders: {len(event.order_ids)}",
            extra={
                "event_id": event.event_id,
                "operation_type": event.operation_type,
                "order_count": len(event.order_ids),
                "order_ids": event.order_ids,
                "operation_details": event.operation_details,
                "performed_by": event.performed_by
            }
        )
    
    # Helper methods for additional processing
    @staticmethod
    async def _send_priority_notification(event: OrderPriorityChangedEvent) -> None:
        """Send notification for priority order changes."""
        # This is where you'd integrate with notification services
        # (email, Slack, SMS, etc.)
        logger.info(f"Priority notification sent for order {event.reference}")
    
    @staticmethod
    async def _track_validation_failure(event: OrderValidationFailedEvent) -> None:
        """Track validation failures for analytics."""
        # This is where you'd send data to analytics/monitoring systems
        logger.debug(f"Validation failure tracked for operation {event.attempted_operation}")
    
    @staticmethod
    async def _update_transport_schedule(event: OrderTransportAssignedEvent) -> None:
        """Update external transport scheduling system."""
        # This is where you'd integrate with external scheduling systems
        logger.debug(f"Transport schedule updated for order {event.reference}")


class CacheEventHandlers:
    """Event handlers for cache management."""
    
    @staticmethod
    async def invalidate_order_cache(event: OrderUpdatedEvent) -> None:
        """Invalidate order cache when order is updated."""
        # This is where you'd invalidate Redis cache entries
        logger.debug(f"Cache invalidated for order {event.order_id}")
    
    @staticmethod
    async def warm_order_cache(event: OrderCreatedEvent) -> None:
        """Warm cache when new order is created."""
        # This is where you'd pre-populate cache entries
        logger.debug(f"Cache warmed for new order {event.order_id}")


class MetricsEventHandlers:
    """Event handlers for metrics collection."""
    
    @staticmethod
    async def collect_order_metrics(event: OrderCreatedEvent) -> None:
        """Collect metrics when orders are created."""
        # This is where you'd send metrics to monitoring systems (Prometheus, etc.)
        logger.debug(f"Metrics collected for order creation: {event.order_id}")
    
    @staticmethod
    async def collect_error_metrics(event: OrderValidationFailedEvent) -> None:
        """Collect error metrics."""
        # This is where you'd track error rates and types
        logger.debug(f"Error metrics collected for validation failure")


class OrderDocumentEventHandlers:
    """Collection of event handlers for order document-related events."""
    
    @staticmethod
    async def log_document_created(event: OrderDocumentCreatedEvent) -> None:
        """Log document creation events."""
        logger.info(
            f"Document created: {event.title or 'Untitled'} (ID: {event.document_id}) for order {event.order_id}",
            extra={
                "event_id": event.event_id,
                "document_id": event.document_id,
                "order_id": event.order_id,
                "document_type": event.document_type,
                "title": event.title,
                "file_path": event.file_path,
                "file_size": event.file_size,
                "created_by": event.created_by
            }
        )
    
    @staticmethod
    async def log_document_updated(event: OrderDocumentUpdatedEvent) -> None:
        """Log document update events."""
        logger.info(
            f"Document updated: ID {event.document_id} for order {event.order_id}",
            extra={
                "event_id": event.event_id,
                "document_id": event.document_id,
                "order_id": event.order_id,
                "updated_fields": event.updated_fields,
                "previous_values": event.previous_values,
                "updated_by": event.updated_by
            }
        )
    
    @staticmethod
    async def log_document_deleted(event: OrderDocumentDeletedEvent) -> None:
        """Log document deletion events."""
        logger.info(
            f"Document deleted: ID {event.document_id} from order {event.order_id}",
            extra={
                "event_id": event.event_id,
                "document_id": event.document_id,
                "order_id": event.order_id,
                "document_type": event.document_type,
                "file_path": event.file_path,
                "deleted_by": event.deleted_by
            }
        )
    
    @staticmethod
    async def handle_file_uploaded(event: OrderDocumentFileUploadedEvent) -> None:
        """Handle file upload events."""
        logger.info(
            f"File uploaded: {event.original_filename} -> {event.stored_filename} "
            f"({event.file_size} bytes) for document {event.document_id}",
            extra={
                "event_id": event.event_id,
                "document_id": event.document_id,
                "order_id": event.order_id,
                "original_filename": event.original_filename,
                "stored_filename": event.stored_filename,
                "file_size": event.file_size,
                "content_type": event.content_type,
                "uploaded_by": event.uploaded_by
            }
        )
        
        # Example: Trigger virus scan, thumbnail generation, etc.
        await OrderDocumentEventHandlers._schedule_file_processing(event)
    
    @staticmethod
    async def handle_file_deleted(event: OrderDocumentFileDeletedEvent) -> None:
        """Handle file deletion events."""
        logger.info(
            f"File deleted: {event.file_path} for document {event.document_id} "
            f"(Success: {event.deletion_success})",
            extra={
                "event_id": event.event_id,
                "document_id": event.document_id,
                "order_id": event.order_id,
                "file_path": event.file_path,
                "deletion_success": event.deletion_success,
                "deletion_reason": event.deletion_reason
            }
        )
        
        if not event.deletion_success:
            logger.warning(f"File deletion failed: {event.file_path}")
    
    @staticmethod
    async def handle_thumbnail_generated(event: OrderDocumentThumbnailGeneratedEvent) -> None:
        """Handle thumbnail generation events."""
        logger.info(
            f"Thumbnail generated: {event.thumbnail_path} for document {event.document_id}",
            extra={
                "event_id": event.event_id,
                "document_id": event.document_id,
                "order_id": event.order_id,
                "thumbnail_path": event.thumbnail_path,
                "original_file_path": event.original_file_path
            }
        )
        
        # Example: Warm thumbnail cache, update UI, etc.
        await OrderDocumentEventHandlers._update_thumbnail_cache(event)
    
    @staticmethod
    async def handle_text_extracted(event: OrderDocumentTextExtractedEvent) -> None:
        """Handle text extraction events."""
        logger.info(
            f"Text extraction completed for document {event.document_id}: "
            f"Success={event.extraction_success}, Length={event.text_length}",
            extra={
                "event_id": event.event_id,
                "document_id": event.document_id,
                "order_id": event.order_id,
                "text_length": event.text_length,
                "extraction_success": event.extraction_success,
                "extraction_method": event.extraction_method
            }
        )
        
        if event.extraction_success:
            # Example: Update search index, trigger content analysis, etc.
            await OrderDocumentEventHandlers._update_search_index(event)
    
    @staticmethod
    async def handle_validation_failure(event: OrderDocumentValidationFailedEvent) -> None:
        """Handle document validation failures."""
        logger.error(
            f"Document validation failed for {event.document_id or 'new document'}: "
            f"Operation: {event.attempted_operation}",
            extra={
                "event_id": event.event_id,
                "document_id": event.document_id,
                "order_id": event.order_id,
                "validation_errors": event.validation_errors,
                "attempted_operation": event.attempted_operation,
                "file_path": event.file_path
            }
        )
        
        # Example: Send notification, trigger cleanup, etc.
        await OrderDocumentEventHandlers._handle_validation_failure(event)
    
    @staticmethod
    async def handle_bulk_operation(event: OrderDocumentBulkOperationEvent) -> None:
        """Handle bulk document operations."""
        logger.info(
            f"Bulk document operation: {event.operation_type} on "
            f"{len(event.document_ids)} documents",
            extra={
                "event_id": event.event_id,
                "operation_type": event.operation_type,
                "document_count": len(event.document_ids),
                "document_ids": event.document_ids,
                "order_id": event.order_id,
                "operation_details": event.operation_details,
                "performed_by": event.performed_by
            }
        )
    
    # Helper methods for additional processing
    @staticmethod
    async def _schedule_file_processing(event: OrderDocumentFileUploadedEvent) -> None:
        """Schedule file processing tasks."""
        logger.debug(f"File processing scheduled for document {event.document_id}")
        # Here you would schedule:
        # - Virus scanning
        # - Thumbnail generation
        # - Text extraction
        # - Format validation
    
    @staticmethod
    async def _update_thumbnail_cache(event: OrderDocumentThumbnailGeneratedEvent) -> None:
        """Update thumbnail cache."""
        logger.debug(f"Thumbnail cache updated for document {event.document_id}")
        # Here you would:
        # - Warm CDN cache
        # - Update Redis cache
        # - Notify UI components
    
    @staticmethod
    async def _update_search_index(event: OrderDocumentTextExtractedEvent) -> None:
        """Update search index with extracted text."""
        logger.debug(f"Search index updated for document {event.document_id}")
        # Here you would:
        # - Update Elasticsearch
        # - Update database search fields
        # - Trigger content analysis
    
    @staticmethod
    async def _handle_validation_failure(event: OrderDocumentValidationFailedEvent) -> None:
        """Handle validation failure with notifications."""
        logger.debug(f"Validation failure handled for document {event.document_id}")
        # Here you would:
        # - Send admin notifications
        # - Trigger cleanup
        # - Update monitoring metrics


def register_event_handlers():
    """Register all event handlers with the event bus."""
    event_bus = get_event_bus()
    
    # Order lifecycle handlers
    event_bus.subscribe(OrderCreatedEvent, OrderEventHandlers.log_order_created)
    event_bus.subscribe(OrderUpdatedEvent, OrderEventHandlers.log_order_updated)
    event_bus.subscribe(OrderDeletedEvent, OrderEventHandlers.log_order_deleted)
    
    # Business logic handlers
    event_bus.subscribe(OrderPriorityChangedEvent, OrderEventHandlers.handle_priority_change)
    event_bus.subscribe(OrderValidationFailedEvent, OrderEventHandlers.handle_validation_failure)
    event_bus.subscribe(OrderTransportAssignedEvent, OrderEventHandlers.handle_transport_assignment)
    event_bus.subscribe(OrderBulkOperationEvent, OrderEventHandlers.handle_bulk_operation)
    
    # Cache management handlers
    event_bus.subscribe(OrderUpdatedEvent, CacheEventHandlers.invalidate_order_cache)
    event_bus.subscribe(OrderCreatedEvent, CacheEventHandlers.warm_order_cache)
    
    # Metrics collection handlers
    event_bus.subscribe(OrderCreatedEvent, MetricsEventHandlers.collect_order_metrics)
    event_bus.subscribe(OrderValidationFailedEvent, MetricsEventHandlers.collect_error_metrics)
    
    # Order Document lifecycle handlers
    event_bus.subscribe(OrderDocumentCreatedEvent, OrderDocumentEventHandlers.log_document_created)
    event_bus.subscribe(OrderDocumentUpdatedEvent, OrderDocumentEventHandlers.log_document_updated)
    event_bus.subscribe(OrderDocumentDeletedEvent, OrderDocumentEventHandlers.log_document_deleted)
    
    # Order Document business logic handlers
    event_bus.subscribe(OrderDocumentFileUploadedEvent, OrderDocumentEventHandlers.handle_file_uploaded)
    event_bus.subscribe(OrderDocumentFileDeletedEvent, OrderDocumentEventHandlers.handle_file_deleted)
    event_bus.subscribe(OrderDocumentThumbnailGeneratedEvent, OrderDocumentEventHandlers.handle_thumbnail_generated)
    event_bus.subscribe(OrderDocumentTextExtractedEvent, OrderDocumentEventHandlers.handle_text_extracted)
    event_bus.subscribe(OrderDocumentValidationFailedEvent, OrderDocumentEventHandlers.handle_validation_failure)
    event_bus.subscribe(OrderDocumentBulkOperationEvent, OrderDocumentEventHandlers.handle_bulk_operation)
    
    logger.info("Event handlers registered successfully (including order document handlers)")


# Convenience function to get handler statistics
def get_handler_statistics() -> Dict[str, Any]:
    """Get statistics about registered event handlers."""
    event_bus = get_event_bus()
    
    stats = {
        "total_events_in_history": len(event_bus.get_event_history()),
        "handler_counts": {
            # Order event handlers
            "OrderCreatedEvent": event_bus.get_handlers_count(OrderCreatedEvent),
            "OrderUpdatedEvent": event_bus.get_handlers_count(OrderUpdatedEvent),
            "OrderDeletedEvent": event_bus.get_handlers_count(OrderDeletedEvent),
            "OrderPriorityChangedEvent": event_bus.get_handlers_count(OrderPriorityChangedEvent),
            "OrderValidationFailedEvent": event_bus.get_handlers_count(OrderValidationFailedEvent),
            "OrderTransportAssignedEvent": event_bus.get_handlers_count(OrderTransportAssignedEvent),
            "OrderBulkOperationEvent": event_bus.get_handlers_count(OrderBulkOperationEvent),
            
            # Order document event handlers
            "OrderDocumentCreatedEvent": event_bus.get_handlers_count(OrderDocumentCreatedEvent),
            "OrderDocumentUpdatedEvent": event_bus.get_handlers_count(OrderDocumentUpdatedEvent),
            "OrderDocumentDeletedEvent": event_bus.get_handlers_count(OrderDocumentDeletedEvent),
            "OrderDocumentFileUploadedEvent": event_bus.get_handlers_count(OrderDocumentFileUploadedEvent),
            "OrderDocumentFileDeletedEvent": event_bus.get_handlers_count(OrderDocumentFileDeletedEvent),
            "OrderDocumentThumbnailGeneratedEvent": event_bus.get_handlers_count(OrderDocumentThumbnailGeneratedEvent),
            "OrderDocumentTextExtractedEvent": event_bus.get_handlers_count(OrderDocumentTextExtractedEvent),
            "OrderDocumentValidationFailedEvent": event_bus.get_handlers_count(OrderDocumentValidationFailedEvent),
            "OrderDocumentBulkOperationEvent": event_bus.get_handlers_count(OrderDocumentBulkOperationEvent),
        }
    }
    
    return stats 