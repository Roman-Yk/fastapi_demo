import uuid
from typing import Optional
from pydantic import BaseModel

from app.api._shared.schema.base import ResponseBaseModel
from app.api._shared.schema.schemas import (
    create_filter_model,
    create_sort_model,
    CollectionQueryParams,
)


# Declare dynamic filter model
FilterModel = create_filter_model(
    [
        ("id", uuid.UUID),
        "name",
        "license_plate",
    ]
)

# Declare dynamic sort model
SortModel = create_sort_model(["id", "name", "license_plate"])


# Query parameters for trailer collection
class CollectionTrailerQueryParams(CollectionQueryParams):
    """
    Query parameters for trailer collection.
        - filter: JSON-encoded filter {'field': 'value'}
        - sort: Sort field
        - order: Sort order ASC/DESC
        - page: Page number
        - perPage: Items per page
        - range: Range of items to return
    method:
        - data: returns the query parameters as a dictionary
    """
    filter_model = FilterModel
    sort_model = SortModel


# Response schema
class ResponseTrailerSchema(ResponseBaseModel):
    id: uuid.UUID
    name: str
    license_plate: str 