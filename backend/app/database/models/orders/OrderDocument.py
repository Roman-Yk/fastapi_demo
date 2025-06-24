import uuid
from sqlalchemy.sql.schema import Column, ForeignKey
from sqlalchemy.types import Integer, String, DateTime, Enum, UUID
from .enums.OrderDocumentType import OrderDocumentType
from ...base_model import BASE_MODEL


class OrderDocument(BASE_MODEL):
    __tablename__ = "order_documents"
    
    id = Column(UUID(), default=uuid.uuid4, primary_key=True)
    order_id = Column(Integer(), ForeignKey("order.id"))
    title = Column(String())
    src = Column(String())
    thumbnail = Column(String())
    type = Column(Enum(OrderDocumentType), nullable=False)
    created_at = Column(DateTime(timezone=False))
    
    def __repr__(self):
        return f"Order_Document({self.id}, {self.entity_id}, {self.title})"