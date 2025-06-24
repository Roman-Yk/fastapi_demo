import uuid
from datetime import time, datetime
from typing import Optional
from fastapi import Form, UploadFile
from pydantic import BaseModel, Field

from app.database.models.orders.enums import OrderDocumentType

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


# Update schema (Patch)
class UpdateOrderDocumentSchema(BaseModel):
	"""
	Update/Patch order schema.
	if using patch then use model_dump(exclude_unset=True)
	"""
	title: Optional[str] = None
	type: Optional[str] = None


# Declare dynamic filter model
Filter_model = create_filter_model(
	[
		("id", uuid.UUID),
		("order_id", uuid.UUID),
		("type", OrderDocumentType),
		("src", str),
		("title", str),
		("thumbnail", str),
		("created_at", datetime),
	]
)
# Declare dynamic sort model
SortModel = create_sort_model(["id"])

# Response schema for order
class CollectionOrderDocumentsQueryParams(CollectionQueryParams):
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
class ResponseOrderDocumentSchema(ResponseBaseModel):
	id: uuid.UUID
	order_id: uuid.UUID
	type: OrderDocumentType
 
	src: str
	title: str
	thumbnail: str
	created_at: datetime



