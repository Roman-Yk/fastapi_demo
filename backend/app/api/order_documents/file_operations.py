import os
import uuid
from fastapi import Depends, Response, Form, UploadFile, File, status, HTTPException
from fastapi_utils.cbv import cbv

from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models.orders.enums import OrderDocumentType
from app.database.conn import get_db
from app.utils.files import get_mime_type, is_displayable_in_browser, encode_filename_for_header

from .schemas import ResponseOrderDocumentSchema
from .service import OrderDocumentsService


def register_file_operations_routes(router):
    """
    Register file operation routes to the provided router.
    Separated from basic CRUD to improve code organization.
    """

    @cbv(router)
    class OrderDocumentFileOperations:
        """
        File operations for order documents: upload, download, view, batch upload.
        """

        def __init__(self, response: Response, db: AsyncSession = Depends(get_db)):
            """
            Initialize with database session and service.
            """
            self.db = db
            self.order_documents_service = OrderDocumentsService(self.db)
            self.response = response

        @router.get("/{order_id}/documents/{document_id}/download")
        async def download_order_document(self, order_id: uuid.UUID, document_id: uuid.UUID):
            """
            Download order document file.
            Forces download with proper filename for all file types.
            """
            # Get document from service
            document = await self.order_documents_service.get_order_document_by_id(document_id)

            file_path = document.src
            if not file_path or not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="File not found")

            # Get filename from document title or file path
            filename = document.title if document.title else os.path.basename(file_path)

            # Get MIME type
            mime_type = get_mime_type(file_path)

            # Read file content
            with open(file_path, 'rb') as f:
                content = f.read()

            # Encode filename for Content-Disposition header
            content_disposition = encode_filename_for_header(filename)

            return Response(
                content=content,
                media_type=mime_type,
                headers={
                    "Content-Disposition": content_disposition
                }
            )

        @router.get("/{order_id}/documents/{document_id}/view")
        async def view_order_document(self, order_id: uuid.UUID, document_id: uuid.UUID):
            """
            View order document file inline in browser.
            Files that can be displayed (PDF, images) are shown inline.
            Files that cannot be displayed (Office docs) are downloaded.
            """
            # Get document from service
            document = await self.order_documents_service.get_order_document_by_id(document_id)

            file_path = document.src
            if not file_path or not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="File not found")

            # Read file content
            with open(file_path, 'rb') as f:
                content = f.read()

            # Get MIME type
            mime_type = get_mime_type(file_path)

            # Check if browser can display this file type
            if is_displayable_in_browser(mime_type):
                # Display inline (PDF, images, videos, text, etc.)
                return Response(
                    content=content,
                    media_type=mime_type
                )
            else:
                # Force download for non-displayable types (Office docs, etc.)
                filename = document.title if document.title else os.path.basename(file_path)
                content_disposition = encode_filename_for_header(filename)
                return Response(
                    content=content,
                    media_type=mime_type,
                    headers={
                        "Content-Disposition": content_disposition
                    }
                )

        @router.post("/{order_id}/documents/",
                     response_model=ResponseOrderDocumentSchema,
                     status_code=status.HTTP_201_CREATED)
        async def create_order_document(
            self,
            order_id: uuid.UUID,
            file: UploadFile = File(...),
            title: str = Form(...),
            type: OrderDocumentType = Form(...),
        ):
            """
            Create a new order document with file upload.
            order_id - path parameter
            file - file passed in request, validated by UploadFile
            title - title of the document, passed in request body form
            type - type of the document, passed in request body form
            """
            document = await self.order_documents_service.create_order_document(
                order_id=order_id,
                file=file,
                title=title,
                doc_type=type,
            )
            return document

        @router.post("/{order_id}/documents/batch",
                     status_code=status.HTTP_201_CREATED)
        async def create_order_documents_batch(
            self,
            order_id: uuid.UUID,
            files: list[UploadFile] = File(...),
            types: list[str] = Form(None),
            type: OrderDocumentType = Form(OrderDocumentType.Other),
        ):
            """
            Create multiple order documents at once.
            order_id - path parameter
            files - list of files passed in request, validated by UploadFile
            types - optional list of types for each file (if not provided, uses 'type' param)
            type - default type of the documents (used if types list not provided), defaults to "Other"
            """
            created_documents = []
            for index, file in enumerate(files):
                # Use individual type if provided, otherwise use default type
                doc_type = type
                if types and index < len(types):
                    try:
                        doc_type = OrderDocumentType(types[index])
                    except ValueError:
                        doc_type = type

                document = await self.order_documents_service.create_order_document(
                    order_id=order_id,
                    file=file,
                    title=file.filename or "Untitled",
                    doc_type=doc_type,
                )
                created_documents.append(document)

            return {
                "created": len(created_documents),
                "documents": created_documents
            }

    return OrderDocumentFileOperations
