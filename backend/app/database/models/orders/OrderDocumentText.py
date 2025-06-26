from sqlalchemy.sql.schema import Column, ForeignKey
from sqlalchemy.types import Integer, DateTime, Text, UUID

from app.database.models._shared.ProcessStatus import ProcessStatus, ProcessStatusType

from ...base_model import BASE_MODEL


class OrderDocumentText(BASE_MODEL):
    __tablename__ = "order_document_text"
    
    order_document_id = Column(UUID, ForeignKey("order_documents.id"), primary_key=True)
    order_id = Column(UUID, ForeignKey("orders.id"), nullable=False)

    order_created_at = Column(DateTime(timezone=False), nullable=False)
    text_created_at = Column(DateTime(timezone=False), nullable=True)
    text = Column(Text())

    process_status = Column(ProcessStatusType(), nullable=False, default=ProcessStatus.none)

    def __repr__(self):
        return f"OrderDocumentText({self.order_document_id}, {self.order_id})"
