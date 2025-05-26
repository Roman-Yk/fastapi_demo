import uuid
from typing import Annotated
from fastapi import Depends, Response, Form, UploadFile, File
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models.orders.enums import OrderDocumentType
from app.database.models.orders import Order, OrderDocument, OrderDocumentText
from app.database.conn import get_db
from app.utils.queries.queries import generate_range

from .schemas import (
    ResponseOrderSchema,
    CollectionOrderQueryParams,
    UpdateOrderSchema,
)
from .service import OrderDocumentsService


order_documents_router = InferringRouter(tags=["order_documents"])


@cbv(order_documents_router)
class OrdersResource:
    """
    Class based view for handling order_documents resources.
    """

    def __init__(self, response: Response, db: AsyncSession = Depends(get_db)):
        """
        Initialize the OrdersResource with a database session, OrderService and response object
        to not pass for every route separately.
        """
        self.db = db
        self.order_documents_service = OrderDocumentsService(self.db)
        self.response = response

    @order_documents_router.get(
        "/order-documents", response_model=list[ResponseOrderSchema]
    )
    async def get_order_documents(self):
        """
        Get all order documents
        """
        """
		order_id: id to get linked documents for order
		"""
        pass

    @order_documents_router.get(
        "/order-documents/{order_id}", response_model=ResponseOrderSchema
    )
    async def get_order_document_by_id(self):
        """
        Get order by ID.
        order_id - path parameter
        """
        pass

    @order_documents_router.post("/order-documents")
    async def create_order_document(
        self,
		order_id: uuid.UUID = Form(...),
		file: UploadFile = File(...),
		title: str = Form(...),
		type: OrderDocumentType = Form(...),
    ):
        """
        Create a new order.
        order is a body passed in request, validated by CreateOrderSchema
        """
        await self.order_documents_service.create_order_document(
			order_id=order_id,
			file=file,
			title=title,
			type=type,
		)
        return {}

    @order_documents_router.patch(
        "/order-documents/{order_id}", response_model=ResponseOrderSchema
    )
    async def patch_order_document(self):
        """
        Partially update an existing order.
        order_id - path parameter
        order is a body passed in request, validated by UpdateOrderSchema
        """
        pass

    @order_documents_router.put(
        "/order-documents/{order_id}", response_model=ResponseOrderSchema
    )
    async def update_order_document(self):
        """
        Update an existing order.
        order_id - path parameter
        order is a body passed in request, validated by UpdateOrderSchema
        """
        pass
