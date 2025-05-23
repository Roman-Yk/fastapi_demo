import uuid

from fastapi import Depends
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.conn import get_db

from .schemas import ResponseOrderSchema, CollectionOrderQueryParams, CreateOrderSchema
from .service import OrderService


orders_router = InferringRouter(tags=["orders"])


@cbv(orders_router)
class OrdersResource:
	"""
	Class based view for handling orders resources.
	"""
	def __init__(self, db: AsyncSession = Depends(get_db)):
		"""
		Initialize the OrdersResource with a database session to not pass for every route separately.
		"""
		self.db = db
		self.service = OrderService(self.db)


	@orders_router.get("/orders", response_model=list[ResponseOrderSchema])
	async def get_orders(self, query_params: CollectionOrderQueryParams = Depends()):
		"""
		Get all orders with optional filtering, sorting, and pagination.
		"""
		"""
		query_params: CollectionOrderQueryParams = Depends()
		need to be called like that because it's not a pydantic model and needed to be initialized
		"""
		orders = await self.service.get_all_orders(query_params)
		return orders

	@orders_router.get("/orders/{order_id}", response_model=ResponseOrderSchema)
	async def get_order_by_id(self, order_id: uuid.UUID):
		"""
		Get order by ID.
		"""
		order = await self.service.get_order_by_id(order_id)
		return order

	@orders_router.post("/orders", response_model=ResponseOrderSchema)
	async def create_order(self, order: CreateOrderSchema):
		"""
		Create a new order.
		"""
		new_order = await self.service.create_order(order)
		return new_order