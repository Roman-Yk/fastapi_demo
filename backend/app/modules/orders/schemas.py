import uuid
from datetime import date, time
from typing import Annotated, Optional
from pydantic import BaseModel, AfterValidator
from app.modules._shared.schema.validators import is_not_past_date
from app.modules._shared.schema.schemas import (
    create_filter_model,
    create_sort_model,
    CollectionQueryParams
    )

# Base for shared fields
class OrderBaseSchema(BaseModel):
    reference: str
    service: int
    terminal_id: uuid.UUID

    commodity: Optional[str] = None
    pallets: Optional[int] = None
    boxes: Optional[int] = None
    kilos: Optional[float] = None
    notes: Optional[str] = None
    priority: Optional[bool] = None

    eta_date: Annotated[Optional[date], AfterValidator(is_not_past_date)] = None
    eta_time: Optional[time] = None
    etd_date: Annotated[Optional[date], AfterValidator(is_not_past_date)] = None
    etd_time: Optional[time] = None


class OrderBaseOutputSchema(BaseModel):
    reference: str
    service: int
    terminal_id: uuid.UUID

    commodity: Optional[str] = None
    pallets: Optional[int] = None
    boxes: Optional[int] = None
    kilos: Optional[float] = None
    notes: Optional[str] = None
    priority: Optional[bool] = None

    eta_date: Optional[date] = None
    eta_time: Optional[time] = None
    etd_date: Optional[date] = None
    etd_time: Optional[time] = None


# Create schema
class CreateOrderSchema(OrderBaseSchema):
    pass


# Update schema (Patch)
class UpdateOrderSchema(BaseModel):
    commodity: Optional[str] = None
    pallets: Optional[int] = None
    boxes: Optional[int] = None
    kilos: Optional[float] = None
    notes: Optional[str] = None
    priority: Optional[bool] = None

    eta_date: Annotated[Optional[date], AfterValidator(is_not_past_date)] = None
    eta_time: Optional[time] = None
    eta_truck: Optional[str] = None
    eta_driver: Optional[str] = None
    eta_trailer: Optional[str] = None
    eta_truck_id: Optional[uuid.UUID] = None
    eta_driver_id: Optional[uuid.UUID] = None
    eta_trailer_id: Optional[uuid.UUID] = None
    eta_driver_phone: Optional[str] = None

    etd_date: Annotated[Optional[date], AfterValidator(is_not_past_date)] = None
    etd_time: Optional[time] = None
    etd_truck: Optional[str] = None
    etd_driver: Optional[str] = None
    etd_trailer: Optional[str] = None
    etd_truck_id: Optional[uuid.UUID] = None
    etd_driver_id: Optional[uuid.UUID] = None
    etd_trailer_id: Optional[uuid.UUID] = None
    etd_driver_phone: Optional[str] = None


# Response schema
class ResponseOrderSchema(OrderBaseOutputSchema):
    id: uuid.UUID

    eta_truck: Optional[str] = None
    eta_driver: Optional[str] = None
    eta_trailer: Optional[str] = None
    eta_truck_id: Optional[uuid.UUID] = None
    eta_driver_id: Optional[uuid.UUID] = None
    eta_trailer_id: Optional[uuid.UUID] = None
    eta_driver_phone: Optional[str] = None

    etd_truck: Optional[str] = None
    etd_driver: Optional[str] = None
    etd_trailer: Optional[str] = None
    etd_truck_id: Optional[uuid.UUID] = None
    etd_driver_id: Optional[uuid.UUID] = None
    etd_trailer_id: Optional[uuid.UUID] = None
    etd_driver_phone: Optional[str] = None

    class Config:
        """
        Pydantic model configuration.
        orm_mode - to allow ORM objects to be used as input not only dicts
        allow_population_by_field_name - to allow population by field name
        use_enum_values - to use enum raw values instead of enum objects
        arbitrary_types_allowed - By default, Pydantic only allows certain types. 
        Setting this to True allows use custom or arbitrary types 
        (e.g., database classes or UUIDs) without raising errors during validation.
        """
        orm_mode = True
        allow_population_by_field_name = True
        use_enum_values = True
        arbitrary_types_allowed = True


#Declare dynamic filter model
Filter_model = create_filter_model([
    ("id", uuid.UUID),
    "reference",
])
#Declare dynamic sort model
SortModel = create_sort_model([
    "id", 
    "reference"
])

class OrderQueryParams(CollectionQueryParams):
    """
    Query parameters for order collection.
    filter: JSON-encoded filter {'field': 'value'}
    sort: Sort field
    order: Sort order ASC/DESC
    page: Page number
    perPage: Items per page
    """
    filter_model = Filter_model
    sort_model = SortModel
