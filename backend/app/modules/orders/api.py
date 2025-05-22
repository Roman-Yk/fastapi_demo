from typing import Optional, Annotated
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from fastapi import Depends, HTTPException, Query

from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Order
from app.database.conn import get_db

from app.utils.queries.queries import fetch_one_or_none, fetch_all

from .schemas import ResponseOrderSchema, OrderQueryParams
from .service import fetch_all_orders


orders_router = InferringRouter(tags=["orders"])


@cbv(orders_router)
class OrdersResource:
    """
    Class based view for handling orders resources.
    """
    def __init__(self, db: AsyncSession = Depends(get_db)):
        """
        Initialize the OrdersResource with a database session.
        """
        self.db = db

    @orders_router.get("/orders", response_model=list[ResponseOrderSchema])
    async def get_orders(self, query_params: OrderQueryParams = Depends()):
        orders = await fetch_all_orders(self.db, query_params)
        return orders

    @orders_router.get("/orders/{order_id}", response_model=ResponseOrderSchema)
    async def get_order_by_id(self, order_id: int):
        query = select(Order).where(Order.id == order_id)
        order = await fetch_one_or_none(self.db, query)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order