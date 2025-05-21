from typing import Annotated, Optional
from datetime import date, time
from pydantic import BaseModel, AfterValidator
from app.modules._shared.schema.validators import is_not_past_date

# {
#   "reference": "001",
#   "service": 1,
#   "eta_date": "2025-03-03",
#   "eta_time": "10:00",
#   "etd_date": "2025-03-03",
#   "etd_time": "10:10",
#   "commodity": "salmon",
#   "pallets": 10,
#   "boxes": 40,
#   "kilos": 200.5,
#   "notes": "Some notes",
#   "priority": true,
#   "terminal_id": 1
# }

class OrderBase(BaseModel):
    reference: str
    service: int
    eta_time: time
    etd_time: time
    commodity: str
    pallets: int
    boxes: int
    kilos: float
    notes: str
    priority: bool
    terminal_id: int
    
class CreateOrderSchema(OrderBase):
    eta_date: Annotated[date, AfterValidator(is_not_past_date)]
    etd_date: Annotated[date, AfterValidator(is_not_past_date)]


#   "commodity": "salmon",
#   "pallets": 11,
#   "boxes": 44,
#   "kilos": 450.5,
#   "eta_driver_id": 1,
#   "eta_trailer_id": 1,
#   "etd_driver": "A driver",
#   "etd_driver_phone": "+311111111111",
#   "etd_truck": "Some Truck",
#   "etd_trailer": "Some Trailer"

class UpdateOrderSchema(BaseModel):
    eta_date: Optional[Annotated[date, AfterValidator(is_not_past_date)]] = None
    eta_time: Optional[time] = None
    etd_date: Optional[Annotated[date, AfterValidator(is_not_past_date)]] = None
    etd_time: Optional[time] = None
    commodity: Optional[str] = None
    pallets: Optional[int] = None
    boxes: Optional[int] = None
    kilos: Optional[float] = None
    notes: Optional[str] = None
    priority: Optional[bool] = None
    terminal_id: Optional[int] = None


class ResponseOrderSchema(OrderBase):
    id: int
    eta_date: date
    etd_date: date

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        use_enum_values = True
        arbitrary_types_allowed = True
        json_encoders = {
            date: lambda v: v.isoformat(),
            time: lambda v: v.isoformat(),
        }
