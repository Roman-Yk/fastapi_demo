import uuid
from typing import Optional
from pydantic import BaseModel, Field
from datetime import date, time

from app.database.models.orders import OrderService, CommodityType
from app.api._shared.schema.types import (
    NonNegativeOptionalFloat,
    NonNegativeOptionalInt,
)


class ETAETDFieldsMixin(BaseModel):
    """
    ETA and ETD fields mixin for order schemas.
    """

    eta_truck: Optional[str] = Field(default=None, max_length=256)
    eta_driver: Optional[str] = Field(default=None, max_length=256)
    eta_trailer: Optional[str] = Field(default=None, max_length=256)
    eta_truck_id: Optional[uuid.UUID] = None
    eta_driver_id: Optional[uuid.UUID] = None
    eta_trailer_id: Optional[uuid.UUID] = None
    eta_driver_phone: Optional[str] = Field(default=None, max_length=32)

    etd_truck: Optional[str] = Field(default=None, max_length=256)
    etd_driver: Optional[str] = Field(default=None, max_length=256)
    etd_trailer: Optional[str] = Field(default=None, max_length=256)
    etd_truck_id: Optional[uuid.UUID] = None
    etd_driver_id: Optional[uuid.UUID] = None
    etd_trailer_id: Optional[uuid.UUID] = None
    etd_driver_phone: Optional[str] = Field(default=None, max_length=32)


class OrderFieldsMixin(BaseModel):
    """
    Shared fields for order schemas.
    """

    commodity: Optional[CommodityType] = None
    pallets: NonNegativeOptionalInt = None
    boxes: NonNegativeOptionalInt = None
    kilos: NonNegativeOptionalFloat = None
    notes: Optional[str] = Field(default=None, max_length=1024)
    priority: Optional[bool] = None


class OrderBaseResponseSchema(BaseModel):
    """
    Base schema for order response.
    """

    reference: str
    service: OrderService
    terminal_id: uuid.UUID

    eta_date: Optional[date] = None
    eta_time: Optional[time] = None
    etd_date: Optional[date] = None
    etd_time: Optional[time] = None
    commodity: Optional[CommodityType] = None
    pallets: NonNegativeOptionalInt = None
    boxes: NonNegativeOptionalInt = None
    kilos: NonNegativeOptionalFloat = None
    
    notes: Optional[str] = None
    priority: Optional[bool] = None
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

    documents_count: int = Field(default=0, description="Number of documents attached to this order")