import os
import uuid
import shutil

from fastapi import HTTPException, Response, UploadFile
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Order

from app.utils.queries.fetching import (
	fetch_one_or_none,
	fetch_all,
	fetch_count_query,
	fetch_one_or_404,
)
from app.utils.queries.queries import apply_filter_sort_range_for_query

from .schemas import CollectionOrderQueryParams, UpdateOrderSchema
from app.database.models.orders.enums import OrderDocumentType
from app.database.models.orders import Order, OrderDocument, OrderDocumentText

from app.core.settings import settings
from .tasks import parse_order_document
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

	async def create_order_document(
		self,
		order_id: uuid.UUID,
		file: UploadFile,
		title: str,
		type: OrderDocumentType,
	):
		"""
		Create a new order_document.
		"""


		# filename = f"{uuid.uuid4()}_{file.filename}"

		# # Define destination path on the filesystem
		# destination_path = os.path.join(settings.FILES_PATH, filename)
		# print(f"\033[31m{destination_path}\033[0m")

		# print(f"\033[31m{filename}\033[0m")

		# # Save the file
		# with open(destination_path, "wb") as buffer:
		# 	shutil.copyfileobj(file.file, buffer)

		# await file.close()
  
		# # new_order_document = OrderDocument(
		# # 	order_id=order_id,
		# # 	title=title,
		# # 	type=type,
		# # 	src=destination_path
		# # )
		# # await self.db.add(new_order_document)
		# # await self.db.commit()
		# print(f"\033[31m{destination_path}\033[0m")
		# return new_order_document
		parse_order_document.delay()
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
