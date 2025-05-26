import uuid
from datetime import time
from typing import Optional
from pydantic import BaseModel, Field

from app.database.models.orders import OrderService

from app.api._shared.schema.schemas import (
	create_filter_model,
	create_sort_model,
	CollectionQueryParams,
)

from app.api._shared.schema.types import (
	NotPastOptionalDate,
	NonNegativeOptionalFloat,
	NonNegativeOptionalInt,
)

from app.api._shared.schema.base import ResponseBaseModel

from .BaseSchemas import (
	ETAETDFieldsMixin,
	OrderBaseResponseSchema,
	OrderFieldsMixin
)


# Create schema
class CreateOrderSchema(OrderFieldsMixin):
	reference: str
	service: OrderService
	terminal_id: uuid.UUID

	eta_date: NotPastOptionalDate = None
	eta_time: Optional[time] = None
	etd_date: NotPastOptionalDate = None
	etd_time: Optional[time] = None


# Update schema (Patch)
class UpdateOrderSchema(ETAETDFieldsMixin, BaseModel):
	"""
	Update/Patch order schema.
	if using patch then use model_dump(exclude_unset=True)
	"""
	eta_date: NotPastOptionalDate = None
	eta_time: Optional[time] = None

	etd_date: NotPastOptionalDate = None
	etd_time: Optional[time] = None
	
	commodity: Optional[str] = None
	pallets: NonNegativeOptionalInt = None
	boxes: NonNegativeOptionalInt = None
	kilos: NonNegativeOptionalFloat = None


# Declare dynamic filter model
Filter_model = create_filter_model(
	[
		("id", uuid.UUID),
		"reference",
	]
)
# Declare dynamic sort model
SortModel = create_sort_model(["id", "reference"])

# Response schema for order
class CollectionOrderQueryParams(CollectionQueryParams):
	"""
	Query parameters for order collection.
		- filter: JSON-encoded filter {'field': 'value'}
		- sort: Sort field
		- order: Sort order ASC/DESC
		- page: Page number
		- perPage: Items per page
	method:
		- data: returns the query parameters as a dictionary
	"""
	filter_model = Filter_model
	sort_model = SortModel


# Response schema
class ResponseOrderSchema(OrderBaseResponseSchema, ResponseBaseModel):
	id: uuid.UUID
