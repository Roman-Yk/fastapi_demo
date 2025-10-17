from sqlalchemy.sql.schema import Column, ForeignKey
from sqlalchemy.types import DateTime, Text, UUID, Enum
from sqlalchemy.orm import relationship

from app.database.models._shared.enums.ProcessStatus import ProcessStatus

from ...base_model import BASE_MODEL


class OrderDocumentText(BASE_MODEL):
    __tablename__ = "order_document_text"

    text = Column(Text())
    order_id = Column(UUID, ForeignKey("orders.id"), nullable=False)
    process_status = Column(Enum(ProcessStatus), nullable=False, default=ProcessStatus.none)
    text_created_at = Column(DateTime(timezone=False), nullable=True)
    order_created_at = Column(DateTime(timezone=False), nullable=False)
    order_document_id = Column(UUID, ForeignKey("order_documents.id"), primary_key=True)

    # Relationships
    document = relationship("OrderDocument", back_populates="document_text")

    def __repr__(self):
        return f"OrderDocumentText({self.order_document_id}, {self.order_id})"
