import uuid
from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Order

from app.utils.queries.fetching import fetch_one_or_none, fetch_all, fetch_count_query, fetch_one_or_404
from app.utils.queries.queries import apply_filter_sort_range_for_query
from app.utils.models.update_model import update_model_fields

from .schemas import CollectionOrderQueryParams, CreateOrderSchema, UpdateOrderSchema

class OrderService:
	"""
	Service class for handling order-related operations.
	"""

	def __init__(self, db: AsyncSession):
		self.db = db


	async def get_all_orders(self, querystring: CollectionOrderQueryParams):
		"""
		Fetch all orders with optional filtering, sorting, and pagination.
		"""
		try:
			select_query = select(Order)
			count_query = select(func.count()).select_from(Order)

			query, count_query = apply_filter_sort_range_for_query(
				Order,
				select_query,
				count_query,
				querystring.dict_data,
			)

			orders = await fetch_all(self.db, query)
			orders_count = await fetch_count_query(self.db, count_query)
			return orders, orders_count
		except Exception as e:
			raise HTTPException(status_code=400, detail=f"Error fetching orders: {str(e)}")


	async def get_order_by_id(self, order_id: uuid.UUID):
		"""
		Retrieve a single order by its ID.
		"""
		query = select(Order).where(Order.id == order_id)
		order = await fetch_one_or_404(self.db, query, detail="Order not found")
		if not order:
			raise HTTPException(status_code=404, detail="Order not found")
		return order
	
	
	async def create_order(self, data: CreateOrderSchema):
		"""
		Create a new order.
		"""
		try:
			order = Order(**data.model_dump())
			self.db.add(order)
			await self.db.commit()
			await self.db.refresh(order)
			return order
		except Exception as e:
			raise HTTPException(status_code=400, detail=f"Error creating order: {str(e)}")


	async def patch_order(self, order_id: uuid.UUID, data: UpdateOrderSchema):
		"""
		Partially update an existing order.
		"""
		try:
			query = select(Order).where(Order.id == order_id)
			order = await fetch_one_or_404(self.db, query, detail="Order not found")
			# model_dump(exclude_unset=True) is used to exclude unset fields 
			# otherwise it would update all fields declared in schema
			order = await update_model_fields(self.db, order, data.model_dump(exclude_unset=True))
			await self.db.commit()
			return order
		except Exception as e:
			raise HTTPException(status_code=400, detail=f"Error updating order: {str(e)}")


	async def update_order(self, order_id: uuid.UUID, data: UpdateOrderSchema):
		"""
		Entirely update an existing order.
		"""
		try:
			query = select(Order).where(Order.id == order_id)
			order = await fetch_one_or_404(self.db, query, detail="Order not found")
			order = await update_model_fields(self.db, order, data.model_dump())
			await self.db.commit()
			return order
		except Exception as e:
			raise HTTPException(status_code=400, detail=f"Error updating order: {str(e)}")
