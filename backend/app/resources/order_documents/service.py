import uuid
from fastapi import HTTPException, Response
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Order

from app.utils.queries.fetching import fetch_one_or_none, fetch_all, fetch_count_query, fetch_one_or_404
from app.utils.queries.queries import apply_filter_sort_range_for_query

from .schemas import CollectionOrderQueryParams, CreateOrderSchema, UpdateOrderSchema

class OrderDocumentsService:
	"""
	Service class for handling order-related operations.
	"""

	def __init__(self, db: AsyncSession):
		self.db = db


	async def get_all_order_documents(self):
		"""
		Fetch all order_documents with optional filtering, sorting, and pagination.
		"""
		pass


	async def get_order_document_by_id(self, order_document_id: uuid.UUID):
		"""
		Retrieve a single order_document by its ID.
		"""
		pass
	
	async def create_order_document(self):
		"""
		Create a new order_document.
		"""
		pass


	async def patch_order_document(self, order_document_id: uuid.UUID):
		"""
		Partially update an existing order_document.
		"""
		pass


	async def update_order_document(self, order_document_id: uuid.UUID):
		"""
		Entirely update an existing order.
		"""
		pass

