import uuid
from fastapi import Depends, Response, status
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from sqlalchemy.ext.asyncio import AsyncSession
from app.database.conn import get_db
from app.utils.queries.queries import generate_range

from .schemas import (
	ResponseOrderDocumentSchema,
	CollectionOrderDocumentsQueryParams,
	UpdateOrderDocumentSchema,
)
from .service import OrderDocumentsService
from .file_operations import register_file_operations_routes


order_documents_router = InferringRouter(prefix="/orders", tags=["order_documents"])


@cbv(order_documents_router)
class OrderDocumentsResource:
	"""
	CRUD operations for order documents.
	File operations (upload, download, view) are in file_operations.py.
	"""

	def __init__(self, response: Response, db: AsyncSession = Depends(get_db)):
		"""
		Initialize with database session, service, and response object.
		"""
		self.db = db
		self.order_documents_service = OrderDocumentsService(self.db)
		self.response = response

	@order_documents_router.get("/{order_id}/documents/", response_model=list[ResponseOrderDocumentSchema])
	async def get_order_documents(
		self,
		order_id: uuid.UUID,
		query_params: CollectionOrderDocumentsQueryParams = Depends(),
	):
		"""
		Get all order documents with optional filtering, sorting, and pagination.
		"""
		documents, count = await self.order_documents_service.get_all_order_documents(
			order_id,
			query_params,
		)
		if query_params.dict_data.get("range"):
			self.response.headers["Content-Range"] = generate_range(
				query_params.dict_data.get("range"), count
			)
		return documents

	@order_documents_router.get("/{order_id}/documents/{document_id}", response_model=ResponseOrderDocumentSchema)
	async def get_order_document_by_id(self, order_id: uuid.UUID, document_id: uuid.UUID):
		"""
		Get order document by ID.
		"""
		document = await self.order_documents_service.get_order_document_by_id(
			document_id
		)
		return document

	@order_documents_router.patch("/{order_id}/documents/{document_id}", response_model=ResponseOrderDocumentSchema)
	async def patch_order_document(self, order_id: uuid.UUID, document_id: uuid.UUID, body: UpdateOrderDocumentSchema):
		"""
		Patch an existing order document (partial update).
		"""
		updated_document = await self.order_documents_service.update_order_document(
			order_document_id=document_id,
			data=body.model_dump(exclude_unset=True),
		)
		return updated_document

	@order_documents_router.put("/{order_id}/documents/{document_id}", response_model=ResponseOrderDocumentSchema)
	async def update_order_document(self, order_id: uuid.UUID, document_id: uuid.UUID, body: UpdateOrderDocumentSchema):
		"""
		Update an existing order document (full update).
		"""
		updated_document = await self.order_documents_service.update_order_document(
			order_document_id=document_id,
			data=body.model_dump(),
		)
		return updated_document

	@order_documents_router.delete("/{order_id}/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
	async def delete_order_document(self, order_id: uuid.UUID, document_id: uuid.UUID):
		"""
		Delete an existing order document.
		"""
		await self.order_documents_service.delete_order_document(order_document_id=document_id)
		return None


# Register file operation routes (upload, download, view, batch)
register_file_operations_routes(order_documents_router)