import os
import uuid
import shutil

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.queries.fetching import (
    fetch_one_or_none,
    fetch_all,
    fetch_count_query,
    fetch_one_or_404,
)
from app.utils.queries.queries import apply_filter_sort_range_for_query
from app.utils.models.update_model import update_model_fields
from app.api._shared.base_service import BaseService

from app.database.models.orders.enums import OrderDocumentType
from app.database.models.orders import OrderDocument, OrderDocumentText, Order

from app.core.settings import settings

from app.api._shared.tasks.tasks import add_order_document_text
from .schemas import CollectionOrderDocumentsQueryParams


class OrderDocumentsService(BaseService):
    """
    Service class for handling order document-related operations.
    """

    async def get_all_order_documents(
        self, order_id: uuid.UUID, querystring: CollectionOrderDocumentsQueryParams
    ) -> tuple[list[OrderDocument], int]:
        """
        Fetch all order_documents with optional filtering, sorting, and pagination.
        """
        select_query = select(OrderDocument).where(OrderDocument.order_id == order_id)
        count_query = select(func.count()).select_from(OrderDocument).where(OrderDocument.order_id == order_id)
        try:
            query, count_query = apply_filter_sort_range_for_query(
                OrderDocument,
                select_query,
                count_query,
                querystring.dict_data,
            )

            order_documents = await fetch_all(self.db, query)
            order_documents_count = await fetch_count_query(self.db, count_query)
            return order_documents, order_documents_count
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error fetching order documents: {str(e)}"
            )

    async def get_order_document_by_id(
        self, order_document_id: uuid.UUID
    ) -> OrderDocument:
        """
        Retrieve a single order_document by its ID.
        """
        select_query = select(OrderDocument).where(OrderDocument.id == order_document_id)
        order_document = await fetch_one_or_404(self.db, select_query, detail="Order document not found")
        return order_document

    async def create_order_document(
        self,
        order_id: uuid.UUID,
        file: UploadFile,
        title: str,
        doc_type: OrderDocumentType,
    ):
        """
        Create a new order_document.
        """
        try:
            filename = f"{uuid.uuid4()}_{file.filename}"
            destination_path = os.path.join(settings.FILES_PATH, filename)
            
            new_order_document = OrderDocument(
                order_id=order_id, 
                title=title, 
                type=doc_type, 
                src=destination_path
            )
            self.db.add(new_order_document)
            await self.db.commit()
            
            with open(destination_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            add_order_document_text.delay(document_id=new_order_document.id)
            return new_order_document

        except HTTPException:
            # Re-raise HTTP exceptions (like validation errors)
            raise
        except Exception as e:
            # Clean up file if it was created
            if "destination_path" in locals() and os.path.exists(destination_path):
                os.remove(destination_path)
            raise HTTPException(
                status_code=400, detail=f"Error creating order document: {str(e)}"
            )

    async def update_order_document(
        self, order_document_id: uuid.UUID, data: dict
    ) -> OrderDocument:
        """
        Update an existing order document.
        """
        try:
            order_document_select_query = select(OrderDocument).where(OrderDocument.id == order_document_id)
            order_document = await fetch_one_or_404(self.db, order_document_select_query, detail="Order document not found")
            order_document = await update_model_fields(self.db, order_document, data)
            
            await self.db.commit()
            return order_document

        except HTTPException:
            # Re-raise HTTP exceptions (like 404, validation errors)
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error updating order document: {str(e)}"
            )

    async def delete_order_document(self, order_document_id: uuid.UUID):
        """
        Delete an existing order_document.
        """
        try:
            order_document_select_query = select(OrderDocument).where(OrderDocument.id == order_document_id)
            order_document = await fetch_one_or_404(self.db, order_document_select_query, detail="Order document not found")
            order_document_text_select_query = select(OrderDocumentText).where(OrderDocumentText.order_document_id == order_document.id)
            order_document_text = await fetch_one_or_404(self.db, order_document_text_select_query, detail="Parsed order document text not found")

            # Remove file from filesystem
            if order_document.src and os.path.exists(order_document.src):
                os.remove(order_document.src)

            # Delete from database
            await self.db.delete(order_document_text)
            await self.db.delete(order_document)
            await self.db.commit()

        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error deleting order document: {str(e)}"
            )
