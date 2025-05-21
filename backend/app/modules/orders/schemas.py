import uuid
from typing import Annotated, Optional
from datetime import date, time
from pydantic import BaseModel, AfterValidator
from app.modules._shared.schema.validators import is_not_past_date
from app.modules._shared.schema.schemas import (
    create_filter_model,
    create_sort_model,
    )
# Base for shared fields
class OrderBaseSchema(BaseModel):
    reference: str
    service: int
    terminal_id: int

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
    eta_truck_id: Optional[int] = None
    eta_driver_id: Optional[int] = None
    eta_trailer_id: Optional[int] = None
    eta_driver_phone: Optional[str] = None

    etd_date: Annotated[Optional[date], AfterValidator(is_not_past_date)] = None
    etd_time: Optional[time] = None
    etd_truck: Optional[str] = None
    etd_driver: Optional[str] = None
    etd_trailer: Optional[str] = None
    etd_truck_id: Optional[int] = None
    etd_driver_id: Optional[int] = None
    etd_trailer_id: Optional[int] = None
    etd_driver_phone: Optional[str] = None


# Response schema
class ResponseOrderSchema(OrderBaseSchema):
    id: int

    eta_truck: Optional[str] = None
    eta_driver: Optional[str] = None
    eta_trailer: Optional[str] = None
    eta_truck_id: Optional[int] = None
    eta_driver_id: Optional[int] = None
    eta_trailer_id: Optional[int] = None
    eta_driver_phone: Optional[str] = None

    etd_truck: Optional[str] = None
    etd_driver: Optional[str] = None
    etd_trailer: Optional[str] = None
    etd_truck_id: Optional[int] = None
    etd_driver_id: Optional[int] = None
    etd_trailer_id: Optional[int] = None
    etd_driver_phone: Optional[str] = None

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        use_enum_values = True
        arbitrary_types_allowed = True



filter_fields = {
    "id": int,
    "reference": str,
}

sort_fields = ["id", "eta_date"]

FilterModel = create_filter_model(filter_fields)
SortModel = create_sort_model(sort_fields)

class OrderQueryModel(BaseModel):
    filter: Optional[FilterModel] = None
    sort: Optional[SortModel] = None
    page: Optional[int] = 1
    per_page: Optional[int] = 50

