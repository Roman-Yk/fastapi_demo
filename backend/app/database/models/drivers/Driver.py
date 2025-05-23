from ...base_model import BASE_MODEL
import uuid
from sqlalchemy import Column, String, UUID
from sqlalchemy.dialects.postgresql import UUID


class Driver(BASE_MODEL):
	__tablename__ = "drivers"
	id = Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True, index=True)
	name = Column(String(256), nullable=False)
	phone = Column(String(32), nullable=False)