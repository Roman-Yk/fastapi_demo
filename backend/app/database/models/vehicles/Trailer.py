import uuid

from sqlalchemy import Column, UUID
from sqlalchemy.dialects.postgresql import UUID

from .VehicleMixin import VehicleMixin
from ...base_model import BASE_MODEL

class Trailer(BASE_MODEL, VehicleMixin):
	__tablename__ = "trailers"
	id = Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True, index=True)
