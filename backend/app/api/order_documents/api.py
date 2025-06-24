import uuid
from typing import Annotated
from fastapi import Depends, Response, Form, UploadFile, File
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models.orders.enums import OrderDocumentType
from app.database.models.orders import Order, OrderDocument, OrderDocumentText
from app.database.conn import get_db
from app.utils.queries.queries import generate_range

from .schemas import (
	ResponseOrderDocumentSchema,
	CollectionOrderDocumentsQueryParams,
	UpdateOrderDocumentSchema,
)
from .service import OrderDocumentsService


order_documents_router = InferringRouter(prefix="/orders", tags=["order_documents"])


@cbv(order_documents_router)
class OrderDocumentsResource:
	"""
	Class based view for handling order_documents resources.
	"""

	def __init__(self, response: Response, db: AsyncSession = Depends(get_db)):
		"""
		Initialize the OrderDocumentsResource with a database session, OrderDocumentsService, and response object
		to not pass for every route separately.
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
		order_id - path parameter
		query_params: CollectionOrderDocumentsQueryParams = Depends()
		need to be called like that because it's not a pydantic model and needs to be initialized.
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
		order_id - path parameter
		document_id - path parameter
		"""
		document = await self.order_documents_service.get_order_document_by_id(
			document_id
		)
		return document


	@order_documents_router.post("/{order_id}/documents/")
	async def create_order_document(
		self,
		order_id: uuid.UUID = Form(...),
		file: UploadFile = File(...),
		title: str = Form(...),
		type: OrderDocumentType = Form(...),
	):
		"""		
		Create a new order document.
		order_id - path parameter
		file - file passed in request, validated by UploadFile
		title - title of the document, passed in request body form
		type - type of the document, passed in request body form
		"""
		await self.order_documents_service.create_order_document(
			order_id=order_id,
			file=file,
			title=title,
			doc_type=type,
		)
		return {}


	@order_documents_router.patch("/{order_id}/documents/{document_id}", response_model=ResponseOrderDocumentSchema)
	async def patch_order_document(self, order_id: uuid.UUID, document_id: uuid.UUID, body: UpdateOrderDocumentSchema):
		"""
		Patch an existing order document.
		order_id - path parameter
		document_id - path parameter
		body is a body passed in request, validated by UpdateOrderDocumentSchema
		"""
		updated_document = await self.order_documents_service.update_order_document(
			document_id=document_id,
			data=body.model_dump(exclude_unset=True),
		)
		return updated_document
		

	@order_documents_router.put("/{order_id}/documents/{document_id}", response_model=ResponseOrderDocumentSchema)
	async def update_order_document(self, order_id: uuid.UUID, document_id: uuid.UUID, body: UpdateOrderDocumentSchema):
		"""
		Update an existing order document.
		order_id - path parameter
		document_id - path parameter
		body is a body passed in request, validated by UpdateOrderDocumentSchema
		"""
		updated_document = await self.order_documents_service.update_order_document(
			document_id=document_id,
			data=body.model_dump(),
		)
		return updated_document
