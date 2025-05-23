import uuid
from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Order

from app.utils.queries.fetching import fetch_one_or_none, fetch_all
from app.utils.queries.queries import apply_filter_sort_range_for_query

from .schemas import CollectionOrderQueryParams

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
        select_query = select(Order)
        count_query = select(func.count()).select_from(Order)
        query, count_query = apply_filter_sort_range_for_query(
            Order,
            select_query,
            count_query,
            querystring.data(),
        )
        orders = await fetch_all(self.db, query)
        return orders

    async def get_order_by_id(self, order_id: uuid.UUID):
        query = select(Order).where(Order.id == order_id)
        order = await fetch_one_or_none(self.db, query)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
    
    async def create_order(self, data: dict):
        order = Order(**data.model_dump())
        self.db.add(order)
        await self.db.commit()
        await self.db.refresh(order)
        return order
