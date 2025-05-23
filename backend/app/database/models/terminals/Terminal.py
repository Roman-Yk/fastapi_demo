import uuid
from sqlalchemy import Column, String, UUID
from sqlalchemy.dialects.postgresql import UUID

from ...base_model import BASE_MODEL


class Terminal(BASE_MODEL):
    __tablename__= "terminals"
    
    id = Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True, index=True)
    name = Column(String(256), nullable=False)