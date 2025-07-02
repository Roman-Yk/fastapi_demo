import uuid

from sqlalchemy import Integer, Column, String, Date, Time, Float, Boolean, ForeignKey, func, Enum
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID

from app.database.base_model import BASE_MODEL

from .enums.OrderServiceType import OrderService
from .enums.Commodity import CommodityType

class Order(BASE_MODEL):
	__tablename__ = "orders"

	id = Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True, index=True)
	reference = Column(String(32), nullable=True)

	service = Column(Enum(OrderService), nullable=True)
	eta_date = Column(Date(), nullable=True)
	eta_time = Column(Time(timezone=False), nullable=True)

	etd_date = Column(Date(), nullable=True)
	etd_time = Column(Time(timezone=False), nullable=True)
 
	commodity = Column(Enum(CommodityType), nullable=True)
 
	pallets = Column(Integer(), nullable=True)
	boxes = Column(Integer(), nullable=True)
	kilos = Column(Float(), nullable=True)
 
	notes = Column(String(1024), nullable=True)
	priority = Column(Boolean(), default=False)

	terminal_id = Column(ForeignKey("terminals.id"), nullable=True)

	created_at = Column(Date(), nullable=True, server_default=func.now())
	updated_at = Column(Date(), nullable=True, server_default=func.now(), onupdate=func.now())

	eta_driver_id = Column(ForeignKey("drivers.id"), nullable=True)
	eta_trailer_id = Column(ForeignKey("trailers.id"), nullable=True)
	eta_truck_id = Column(ForeignKey("trucks.id"), nullable=True)
	eta_driver = Column(String(256), nullable=True)
	eta_driver_phone = Column(String(32), nullable=True)
	eta_truck = Column(String(256), nullable=True)
	eta_trailer = Column(String(256), nullable=True)

	etd_driver_id = Column(ForeignKey("drivers.id"), nullable=True)
	etd_trailer_id = Column(ForeignKey("trailers.id"), nullable=True)
	etd_truck_id = Column(ForeignKey("trucks.id"), nullable=True)
	etd_driver = Column(String(256), nullable=True)
	etd_driver_phone = Column(String(32), nullable=True)
	etd_truck = Column(String(256), nullable=True)
	etd_trailer = Column(String(256), nullable=True)

	@validates('eta_truck', 'eta_trailer', 'etd_truck', 'etd_trailer')
	def convert_to_lower(self, key, value):
		return value.lower() if value else value

	def __repr__(self):
		return f"<Order {self.id}>"

