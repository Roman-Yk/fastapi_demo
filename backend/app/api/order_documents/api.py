import uuid
from typing import Annotated
from fastapi import Depends, Response, Form, UploadFile, File, HTTPException, status
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from app.database.models.orders.enums import OrderDocumentType
from app.utils.queries.queries import generate_range
from app.core.dependencies import get_order_document_service, get_transactional_uow, TransactionalOperation
from app.core.exceptions import OrderDocumentNotFoundException, ValidationException, BusinessRuleException
from app.domain.services.order_document_service import OrderDocumentDomainService

from .schemas import (
	ResponseOrderDocumentSchema,
	CollectionOrderDocumentsQueryParams,
	UpdateOrderDocumentSchema,
)


order_documents_router = InferringRouter(prefix="/orders", tags=["order_documents"])


@cbv(order_documents_router)
class OrderDocumentsResource:
	"""
	Enhanced class-based view for handling order documents resources.
	Now uses the new architecture with domain services, repositories, and events.
	"""

	def __init__(self, response: Response):
		"""
		Initialize the OrderDocumentsResource with response object.
		Services are injected per endpoint for better error handling.
		"""
		self.response = response


	@order_documents_router.get("/{order_id}/documents/", response_model=list[ResponseOrderDocumentSchema])
	async def get_order_documents(
		self,
		order_id: uuid.UUID,
		query_params: CollectionOrderDocumentsQueryParams = Depends(),
		document_service: OrderDocumentDomainService = Depends(get_order_document_service)
	):
		"""
		Get all order documents with optional filtering, sorting, and pagination.
		Enhanced with better error handling and caching headers.
		"""
		try:
			documents, count = await document_service.get_documents_for_order(order_id, query_params)
			
			# Set Content-Range header for pagination
			if query_params.dict_data.get("range"):
				self.response.headers["Content-Range"] = generate_range(
					query_params.dict_data.get("range"), count
				)
			
			# Add caching headers
			self.response.headers["Cache-Control"] = "public, max-age=60"
			
			return documents
			
		except Exception as e:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail=f"Error retrieving documents: {str(e)}"
			)


	@order_documents_router.get("/{order_id}/documents/{document_id}", response_model=ResponseOrderDocumentSchema)
	async def get_order_document_by_id(
		self, 
		order_id: uuid.UUID, 
		document_id: uuid.UUID,
		document_service: OrderDocumentDomainService = Depends(get_order_document_service)
	):
		"""
		Get order document by ID with enhanced error handling.
		"""
		try:
			document = await document_service.get_order_document_by_id(document_id)
			
			# Add caching headers for individual documents
			self.response.headers["Cache-Control"] = "public, max-age=300"
			self.response.headers["ETag"] = f'"{document.id}-{document.created_at}"'
			
			return document
			
		except OrderDocumentNotFoundException:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail=f"Document with id {document_id} not found"
			)
		except Exception as e:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail=f"Error retrieving document: {str(e)}"
			)


	@order_documents_router.post("/{order_id}/documents/", response_model=ResponseOrderDocumentSchema, status_code=status.HTTP_201_CREATED)
	async def create_order_document(
		self,
		order_id: uuid.UUID,
		file: UploadFile = File(...),
		title: str = Form(...),
		type: OrderDocumentType = Form(...),
		transactional_uow: TransactionalOperation = Depends(get_transactional_uow)
	):
		"""		
		Create a new order document with full validation and event publishing.
		Uses transactional Unit of Work for data consistency.
		"""
		try:
			async with transactional_uow as uow:
				document_service = OrderDocumentDomainService(uow)
				new_document = await document_service.create_order_document(
					order_id=order_id,
					file=file,
					title=title,
					document_type=type,
					created_by="api_user"
				)
				
				# Set location header
				self.response.headers["Location"] = f"/api/v1/orders/{order_id}/documents/{new_document.id}"
				
				return new_document
				
		except ValidationException as e:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail=str(e)
			)
		except BusinessRuleException as e:
			raise HTTPException(
				status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
				detail=str(e)
			)
		except Exception as e:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail=f"Error creating document: {str(e)}"
			)


	@order_documents_router.patch("/{order_id}/documents/{document_id}", response_model=ResponseOrderDocumentSchema)
	async def patch_order_document(
		self, 
		order_id: uuid.UUID, 
		document_id: uuid.UUID, 
		body: UpdateOrderDocumentSchema,
		transactional_uow: TransactionalOperation = Depends(get_transactional_uow)
	):
		"""
		Partially update an existing order document with validation and events.
		"""
		try:
			async with transactional_uow as uow:
				document_service = OrderDocumentDomainService(uow)
				updated_document = await document_service.update_order_document(
					document_id, body, updated_by="api_user"
				)
				return updated_document
				
		except OrderDocumentNotFoundException:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail=f"Document with id {document_id} not found"
			)
		except ValidationException as e:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail=str(e)
			)
		except BusinessRuleException as e:
			raise HTTPException(
				status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
				detail=str(e)
			)
		except Exception as e:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail=f"Error updating document: {str(e)}"
			)
		

	@order_documents_router.put("/{order_id}/documents/{document_id}", response_model=ResponseOrderDocumentSchema)
	async def update_order_document(
		self, 
		order_id: uuid.UUID, 
		document_id: uuid.UUID, 
		body: UpdateOrderDocumentSchema,
		transactional_uow: TransactionalOperation = Depends(get_transactional_uow)
	):
		"""
		Fully update an existing order document with validation and events.
		"""
		try:
			async with transactional_uow as uow:
				document_service = OrderDocumentDomainService(uow)
				updated_document = await document_service.update_order_document(
					document_id, body, updated_by="api_user"
				)
				return updated_document
				
		except OrderDocumentNotFoundException:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail=f"Document with id {document_id} not found"
			)
		except ValidationException as e:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail=str(e)
			)
		except BusinessRuleException as e:
			raise HTTPException(
				status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
				detail=str(e)
			)
		except Exception as e:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail=f"Error updating document: {str(e)}"
			)

	@order_documents_router.delete("/{order_id}/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
	async def delete_order_document(
		self, 
		order_id: uuid.UUID, 
		document_id: uuid.UUID,
		transactional_uow: TransactionalOperation = Depends(get_transactional_uow)
	):
		"""
		Delete an order document with validation, file cleanup, and event publishing.
		"""
		try:
			async with transactional_uow as uow:
				document_service = OrderDocumentDomainService(uow)
				success = await document_service.delete_order_document(document_id, deleted_by="api_user")
				
				if not success:
					raise HTTPException(
						status_code=status.HTTP_404_NOT_FOUND,
						detail=f"Document with id {document_id} not found"
					)
				
		except OrderDocumentNotFoundException:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail=f"Document with id {document_id} not found"
			)
		except ValidationException as e:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail=str(e)
			)
		except BusinessRuleException as e:
			raise HTTPException(
				status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
				detail=str(e)
			)
		except Exception as e:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail=f"Error deleting document: {str(e)}"
			)
	
	@order_documents_router.get("/documents/search", response_model=list[ResponseOrderDocumentSchema])
	async def search_documents(
		self,
		q: str,
		order_id: uuid.UUID = None,
		document_service: OrderDocumentDomainService = Depends(get_order_document_service)
	):
		"""
		Search documents by title or type across all orders or within a specific order.
		"""
		try:
			documents = await document_service.search_documents(q, order_id)
			return documents
		except Exception as e:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail=f"Error searching documents: {str(e)}"
			)

	@order_documents_router.get("/{order_id}/documents/statistics")
	async def get_document_statistics(
		self,
		order_id: uuid.UUID,
		document_service: OrderDocumentDomainService = Depends(get_order_document_service)
	):
		"""
		Get document statistics for a specific order.
		"""
		try:
			stats = await document_service.get_documents_statistics(order_id)
			return stats
		except Exception as e:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail=f"Error retrieving statistics: {str(e)}"
			)

	@order_documents_router.post("/{order_id}/documents/{document_id}/thumbnail")
	async def generate_thumbnail(
		self,
		order_id: uuid.UUID,
		document_id: uuid.UUID,
		thumbnail_path: str,
		transactional_uow: TransactionalOperation = Depends(get_transactional_uow)
	):
		"""
		Generate and assign thumbnail for a document.
		"""
		try:
			async with transactional_uow as uow:
				document_service = OrderDocumentDomainService(uow)
				success = await document_service.generate_thumbnail(document_id, thumbnail_path)
				
				return {"message": "Thumbnail generated successfully", "document_id": document_id}
				
		except OrderDocumentNotFoundException:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail=f"Document with id {document_id} not found"
			)
		except Exception as e:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail=f"Error generating thumbnail: {str(e)}"
			)