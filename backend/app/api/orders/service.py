import uuid
from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Order
from app.database.models.drivers import Driver
from app.database.models.vehicles import Truck, Trailer
from app.database.models.terminals import Terminal
from app.api._shared.base_service import BaseService

from app.utils.queries.fetching import (
    fetch_one_or_none,
    fetch_all,
    fetch_count_query,
    fetch_one_or_404,
)
from app.utils.queries.queries import apply_filter_sort_range_for_query
from app.utils.models.update_model import update_model_fields

from .schemas import CollectionOrderQueryParams, CreateOrderSchema, UpdateOrderSchema


class OrderService(BaseService):
    """
    Service class for handling order-related operations.
    """

    # Mapping of field names to their corresponding model classes
    FOREIGN_KEY_VALIDATION_MAP = {
        "eta_driver_id": Driver,
        "eta_truck_id": Truck,
        "eta_trailer_id": Trailer,
        "etd_driver_id": Driver,
        "etd_truck_id": Truck,
        "etd_trailer_id": Trailer,
        "terminal_id": Terminal,
    }

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
            raise HTTPException(
                status_code=400, detail=f"Error fetching orders: {str(e)}"
            )

    async def get_order_by_id(self, order_id: uuid.UUID):
        """
        Retrieve a single order by its ID.
        """
        query = select(Order).where(Order.id == order_id)
        order = await fetch_one_or_404(self.db, query, detail="Order not found")
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
            await self.db.rollback()
            raise HTTPException(
                status_code=400, detail=f"Error creating order: {str(e)}"
            )

    async def patch_order(self, order_id: uuid.UUID, data: UpdateOrderSchema) -> Order:
        """
        Partially update an existing order.
        """
        try:
            # Fetch the existing order
            query = select(Order).where(Order.id == order_id)
            order = await fetch_one_or_404(self.db, query, detail="Order not found")

            # Get only the fields that were explicitly set in the request
            updated_data = data.model_dump(exclude_unset=True)

            if not updated_data:
                return order  # No changes to apply

            # Foreign key validation - clear and specific
            await self.fk_validator.validate_references_from_mapping(
                updated_data, self.FOREIGN_KEY_VALIDATION_MAP
            )

            # Update the order with the new data
            updated_order = await update_model_fields(self.db, order, updated_data)
            await self.db.commit()

            return updated_order

        except HTTPException:
            # Re-raise HTTP exceptions (like 404, validation errors)
            raise
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=400, detail=f"Error updating order: {str(e)}"
            )

    async def update_order(self, order_id: uuid.UUID, data: UpdateOrderSchema) -> Order:
        """
        Entirely update an existing order.
        """
        try:
            query = select(Order).where(Order.id == order_id)
            order = await fetch_one_or_404(self.db, query, detail="Order not found")

            # Get all fields from the schema (including unset ones with default values)
            update_data = data.model_dump()

            # Foreign key validation
            await self.fk_validator.validate_references_from_mapping(
                update_data, self.FOREIGN_KEY_VALIDATION_MAP
            )

            updated_order = await update_model_fields(self.db, order, update_data)
            await self.db.commit()
            return updated_order

        except HTTPException:
            # Re-raise HTTP exceptions (like 404, validation errors)
            raise
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=400, detail=f"Error updating order: {str(e)}"
            )
