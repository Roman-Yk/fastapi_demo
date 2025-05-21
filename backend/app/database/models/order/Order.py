import uuid
from sqlalchemy import func
from sqlalchemy import Integer, Column, UUID, String, Date, Time, Float, Boolean

from app.database.base_model import BASE_MODEL
from .OrderServiceType import OrderServiceType

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

class Order(BASE_MODEL):
	__tablename__ = "orders"

	id = Column(UUID(), default=uuid.UUID, primary_key=True, index=True)
	reference = Column(String(32), nullable=True)

	service = Column(OrderServiceType(), nullable=True)
	eta_date = Column(Date(), nullable=True)
	eta_time = Column(Time(timezone=False), nullable=True)

	etd_date = Column(Date(), nullable=True)
	etd_time = Column(Time(timezone=False), nullable=True)
 
	commodity = Column(String(256))
 
	pallets = Column(Integer(), nullable=True)
	boxes = Column(Integer(), nullable=True)
	kilos = Column(Float(), nullable=True)
 
	notes = Column(String(1024), nullable=True)
	priority = Column(Boolean(), default=False)

	terminal_id = Column(Integer(), nullable=True)

	created_at = Column(Date(), nullable=True, server_default=func.now())
	updated_at = Column(Date(), nullable=True, server_default=func.now(), onupdate=func.now())

	def __repr__(self):
		pass

