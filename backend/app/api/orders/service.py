import uuid
import logging
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Order
from app.database.models.drivers import Driver
from app.database.models.vehicles import Truck, Trailer
from app.database.models.terminals import Terminal
from app.api._shared.base_service import BaseService
from app.database.exceptions import ForeignKeyError

from app.utils.queries.fetching import (
    fetch_one_or_none,
    fetch_all,
    fetch_count_query,
    fetch_one_or_404,
    is_record_exists,
)
from app.utils.queries.queries import apply_filter_sort_range_for_query
from app.utils.models.update_model import update_model_fields

from .schemas import CollectionOrderQueryParams, CreateOrderSchema, UpdateOrderSchema

logger = logging.getLogger(__name__)


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
        # Validate foreign keys first
        data_dict = data.model_dump(exclude_unset=True)
        await self._validate_foreign_keys(data_dict)

        order = Order(**data.model_dump())
        self.db.add(order)
        await self.db.flush()  # Get ID without committing (get_db handles commit)
        await self.db.refresh(order)
        return order

    async def _validate_foreign_keys(self, data: dict):
        """Validate all foreign key references exist."""
        for field, model in self.FOREIGN_KEY_VALIDATION_MAP.items():
            if fk_id := data.get(field):
                if not await is_record_exists(self.db, model, fk_id):
                    raise ForeignKeyError(field, model.__name__)

    async def patch_order(self, order_id: uuid.UUID, data: UpdateOrderSchema) -> Order:
        """
        Partially update an existing order.
        """
        # Fetch the existing order
        query = select(Order).where(Order.id == order_id)
        order = await fetch_one_or_404(self.db, query, detail="Order not found")

        # Get only the fields that were explicitly set in the request
        updated_data = data.model_dump(exclude_unset=True)

        if not updated_data:
            return order  # No changes to apply

        # Validate foreign keys if any are being updated
        await self._validate_foreign_keys(updated_data)

        # Update the order with the new data
        updated_order = await update_model_fields(self.db, order, updated_data)
        await self.db.flush()  # Flush without committing (get_db handles commit)
        await self.db.refresh(updated_order)

        return updated_order

    async def update_order(self, order_id: uuid.UUID, data: UpdateOrderSchema) -> Order:
        """
        Entirely update an existing order.
        """
        query = select(Order).where(Order.id == order_id)
        order = await fetch_one_or_404(self.db, query, detail="Order not found")

        # Get all fields from the schema (including unset ones with default values)
        update_data = data.model_dump()

        # Validate foreign keys
        await self._validate_foreign_keys(update_data)

        updated_order = await update_model_fields(self.db, order, update_data)
        await self.db.flush()  # Flush without committing (get_db handles commit)
        await self.db.refresh(updated_order)
        return updated_order
