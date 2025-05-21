import uuid
from sqlalchemy import Column, String, UUID
from ...base_model import BASE_MODEL


class Terminal(BASE_MODEL):
    __tablename__= "terminals"
    
    id = Column(UUID(), default=uuid.UUID, primary_key=True, index=True)
    name = Column(String(256), nullable=False)