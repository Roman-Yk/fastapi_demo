from typing import Optional, Annotated
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from fastapi import Depends, HTTPException, Query

from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Order
from app.database.conn import get_db


from .schemas import ResponseOrderSchema, CollectionOrderQueryParams
from .service import get_all_orders, get_order_by_id
from app.utils.queries.fetching import fetch_one_or_none

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

	@orders_router.get("/orders", response_model=list[ResponseOrderSchema])
	async def get_orders(self, query_params: CollectionOrderQueryParams = Depends()):
		"""
		Get all orders with optional filtering, sorting, and pagination.
		"""
		"""
		query_params: CollectionOrderQueryParams = Depends()
		need to be called like that because it's not a pydantic model and needed to be initialized
		"""
		orders = await get_all_orders(self.db, query_params)
		return orders

	@orders_router.get("/orders/{order_id}", response_model=ResponseOrderSchema)
	async def get_order_by_id(self, order_id: int):
		"""
		Get order by ID.
		"""
		order = await get_order_by_id(self.db, order_id)
		return order