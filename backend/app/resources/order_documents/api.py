import uuid

from fastapi import Depends, Response
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.conn import get_db
from app.utils.queries.queries import generate_range

from .schemas import (
	ResponseOrderSchema,
	CollectionOrderQueryParams,
	CreateOrderSchema,
	UpdateOrderSchema,
)
from .service import OrderDocumentsService


order_documents_router = InferringRouter(tags=["order_documents"])


@cbv(order_documents_router)
class OrdersResource:
	"""
	Class based view for handling order_documents resources.
	"""

	def __init__(self, response: Response, db: AsyncSession = Depends(get_db)):
		"""
		Initialize the OrdersResource with a database session, OrderService and response object 
		to not pass for every route separately.
		"""
		self.db = db
		self.order_documents_service = OrderDocumentsService(self.db)
		self.response = response

	@order_documents_router.get("/order-documents/{order_id}", response_model=list[ResponseOrderSchema])
	async def get_order_documents(self):
		"""
		Get all order documents
		"""
		"""
		order_id: id to get linked documents for order
		"""
		pass

	@order_documents_router.get("/order-documents/{order_id}", response_model=ResponseOrderSchema)
	async def get_order_document_by_id(self):
		"""
		Get order by ID.
		order_id - path parameter
		"""
		pass

	@order_documents_router.post("/order-documents", response_model=ResponseOrderSchema)
	async def create_order_document(self):
		"""
		Create a new order.
		order is a body passed in request, validated by CreateOrderSchema
		"""
		pass

	@order_documents_router.patch("/order-documents/{order_id}", response_model=ResponseOrderSchema)
	async def patch_order_document(self):
		"""
		Partially update an existing order.
		order_id - path parameter
		order is a body passed in request, validated by UpdateOrderSchema
		"""
		pass
	
	@order_documents_router.put("/order-documents/{order_id}", response_model=ResponseOrderSchema)
	async def update_order_document(self):
		"""
		Update an existing order.
		order_id - path parameter
		order is a body passed in request, validated by UpdateOrderSchema
		"""
		pass
