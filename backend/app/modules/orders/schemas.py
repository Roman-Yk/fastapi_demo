import uuid
import json
from fastapi import HTTPException, Query
from pydantic import BaseModel, create_model, ValidationError
from typing import Annotated, Optional
from datetime import date, time
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
        orm_mode = True
        allow_population_by_field_name = True
        use_enum_values = True
        arbitrary_types_allowed = True



filter_fields = [
    ("id", uuid.UUID),
    "reference",
]

sort_fields = ["id", "reference"]

class OrderQueryParams(CollectionQueryParams):
    filter_model = create_filter_model(filter_fields)
    sort_model = create_sort_model(sort_fields)
