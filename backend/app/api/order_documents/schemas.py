import uuid
import os
from datetime import time, datetime
from typing import Optional
from pydantic import BaseModel, computed_field

from app.database.models.orders.enums import OrderDocumentType

from app.api._shared.schema.base import ResponseBaseModel
from app.api._shared.schema.schemas import (
	create_filter_model,
	create_sort_model,
	CollectionQueryParams,
)

# Update schema (Patch)
class UpdateOrderDocumentSchema(BaseModel):
	"""
	Update/Patch order schema.
	if using patch then use model_dump(exclude_unset=True)
	"""
	type: Optional[str] = None
	title: Optional[str] = None


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


# Query parameters for order documents collection
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
	src: str
	type: OrderDocumentType
	title: str | None
	order_id: uuid.UUID
	thumbnail: str | None
	created_at: datetime | None

	@computed_field
	@property
	def display_name(self) -> str | None:
		"""
		Returns the document title without the file extension.
		If no title exists, returns None.
		"""
		if not self.title:
			return None
		# Remove the extension from the title
		name_without_ext, _ = os.path.splitext(self.title)
		return name_without_ext



