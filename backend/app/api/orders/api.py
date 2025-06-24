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
from .service import OrderService


orders_router = InferringRouter(tags=["orders"])


@cbv(orders_router)
class OrdersResource:
    """
    Class based view for handling orders resources.
    """

    def __init__(self, response: Response, db: AsyncSession = Depends(get_db)):
        """
        Initialize the OrdersResource with a database session, OrderService and response object
        to not pass for every route separately.
        """
        self.db = db
        self.order_service = OrderService(self.db)
        self.response = response

    @orders_router.get("/orders", response_model=list[ResponseOrderSchema])
    async def get_orders(self, query_params: CollectionOrderQueryParams = Depends()):
        """
        Get all orders with optional filtering, sorting, and pagination.
        """
        """
		query_params: CollectionOrderQueryParams = Depends()
		need to be called like that because it's not a pydantic model and needs to be initialized
		"""
        orders, count = await self.order_service.get_all_orders(query_params)
        if query_params.dict_data.get("range"):
            self.response.headers["Content-Range"] = generate_range(
                query_params.dict_data.get("range"), count
            )
        return orders

    @orders_router.get("/orders/{order_id}", response_model=ResponseOrderSchema)
    async def get_order_by_id(self, order_id: uuid.UUID):
        """
        Get order by ID.
        order_id - path parameter
        """
        order = await self.order_service.get_order_by_id(order_id)
        return order

    @orders_router.post("/orders", response_model=ResponseOrderSchema)
    async def create_order(self, order: CreateOrderSchema):
        """
        Create a new order.
        order is a body passed in request, validated by CreateOrderSchema
        """
        new_order = await self.order_service.create_order(order)
        return new_order

    @orders_router.patch("/orders/{order_id}", response_model=ResponseOrderSchema)
    async def patch_order(self, order_id: uuid.UUID, order: UpdateOrderSchema):
        """
        Partially update an existing order.
        order_id - path parameter
        order is a body passed in request, validated by UpdateOrderSchema
        """
        updated_order = await self.order_service.patch_order(order_id, order)
        return updated_order

    @orders_router.put("/orders/{order_id}", response_model=ResponseOrderSchema)
    async def update_order(self, order_id: uuid.UUID, order: UpdateOrderSchema):
        """
        Update an existing order.
        order_id - path parameter
        order is a body passed in request, validated by UpdateOrderSchema
        """
        updated_order = await self.order_service.update_order(order_id, order)
        return updated_order
