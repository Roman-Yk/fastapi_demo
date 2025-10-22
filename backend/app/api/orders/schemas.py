import uuid
from datetime import time
from typing import Optional
from pydantic import BaseModel, Field

from app.database.models.orders import OrderService, CommodityType

from app.api._shared.schema.base import ResponseBaseModel
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
from app.api._shared.schema.enums import DateRangeFilterModel

from .BaseSchemas import ETAETDFieldsMixin, OrderBaseResponseSchema, OrderFieldsMixin


# Create schema
class CreateOrderSchema(OrderFieldsMixin):
    reference: str = Field(
        max_length=32,
        min_length=1,
        description="Unique order reference number",
        examples=["ORD-2024-001", "REF-12345"]
    )
    service: OrderService = Field(
        description="Type of service for this order",
        examples=[OrderService.RELOAD_CAR_CAR]
    )
    terminal_id: uuid.UUID = Field(
        description="UUID of the terminal where order will be processed",
        examples=["550e8400-e29b-41d4-a716-446655440000"]
    )

    eta_date: NotPastOptionalDate = Field(
        default=None,
        description="Estimated Time of Arrival date (must not be in the past)",
        examples=["2024-12-25"]
    )
    eta_time: Optional[time] = Field(
        default=None,
        description="Estimated Time of Arrival time",
        examples=["14:30:00"]
    )
    etd_date: NotPastOptionalDate = Field(
        default=None,
        description="Estimated Time of Departure date (must not be in the past)",
        examples=["2024-12-26"]
    )
    etd_time: Optional[time] = Field(
        default=None,
        description="Estimated Time of Departure time",
        examples=["18:00:00"]
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "reference": "ORD-2024-001",
                    "service": 1,
                    "terminal_id": "550e8400-e29b-41d4-a716-446655440000",
                    "eta_date": "2024-12-25",
                    "eta_time": "14:30:00",
                    "etd_date": "2024-12-26",
                    "etd_time": "18:00:00",
                    "commodity": 1,
                    "pallets": 20,
                    "boxes": 100,
                    "kilos": 1500.5,
                    "notes": "Handle with care - fragile items",
                    "priority": True
                }
            ]
        }
    }


# Update schema (Patch)
class UpdateOrderSchema(ETAETDFieldsMixin, BaseModel):
    """
    Update/Patch order schema.
    if using patch then use model_dump(exclude_unset=True)
    """

    reference: Optional[str] = Field(
        default=None,
        max_length=32,
        min_length=1,
        description="Updated order reference number",
        examples=["ORD-2024-002", "REF-67890"]
    )
    
    service: Optional[OrderService] = Field(
        default=None,
        description="Updated type of service for this order",
        examples=[OrderService.RELOAD_CAR_CAR]
    )
    
    priority: Optional[bool] = Field(
        default=None,
        description="Updated priority status of the order",
        examples=[True]
    )
    
    eta_date: NotPastOptionalDate = Field(
        default=None,
        description="Updated Estimated Time of Arrival date",
        examples=["2024-12-27"]
    )
    eta_time: Optional[time] = Field(
        default=None,
        description="Updated Estimated Time of Arrival time",
        examples=["16:00:00"]
    )

    etd_date: NotPastOptionalDate = Field(
        default=None,
        description="Updated Estimated Time of Departure date",
        examples=["2024-12-28"]
    )
    etd_time: Optional[time] = Field(
        default=None,
        description="Updated Estimated Time of Departure time",
        examples=["20:00:00"]
    )

    commodity: Optional[CommodityType] = Field(
        default=None,
        description="Type of commodity being transported",
        examples=[CommodityType.SALMON]
    )
    pallets: NonNegativeOptionalInt = Field(
        default=None,
        description="Number of pallets (must be non-negative)",
        examples=[25]
    )
    boxes: NonNegativeOptionalInt = Field(
        default=None,
        description="Number of boxes (must be non-negative)",
        examples=[150]
    )
    kilos: NonNegativeOptionalFloat = Field(
        default=None,
        description="Weight in kilograms (must be non-negative)",
        examples=[2000.75]
    )
    notes: Optional[str] = Field(
        default=None,
        max_length=1024,
        description="Additional notes or special instructions",
        examples=["Updated delivery instructions - use back entrance"]
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "notes": "Updated delivery time - customer requested afternoon delivery",
                    "pallets": 25,
                    "priority": True
                },
                {
                    "eta_date": "2024-12-27",
                    "eta_time": "16:00:00",
                    "commodity": 2,
                    "kilos": 2500.0
                }
            ]
        }
    }


# Declare dynamic filter model
Filter_model = create_filter_model(
    [
        ("id", uuid.UUID),
        "reference",
        ("service", OrderService),
        ("date_range", DateRangeFilterModel),
        ("priority", bool),
        ("service", OrderService),
    ]
)
# Declare dynamic sort model
SortModel = create_sort_model(["id", "reference"])


# Query parameters for order collection
class CollectionOrderQueryParams(CollectionQueryParams):
    """
    Query parameters for order collection.
            - filter: JSON-encoded filter {'field': 'value'}
            - sort: Sort field
            - order: Sort order ASC/DESC
            - page: Page number
            - perPage: Items per page
            - range: Range of items to return
    method:
            - data: returns the query parameters as a dictionary
    """

    filter_model = Filter_model
    sort_model = SortModel


# Response schema
class ResponseOrderSchema(OrderBaseResponseSchema, ResponseBaseModel):
    id: uuid.UUID
