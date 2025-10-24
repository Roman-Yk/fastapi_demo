import os
import uuid
from fastapi import Depends, Response, HTTPException
from fastapi_utils.cbv import cbv
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.files import get_mime_type, is_displayable_in_browser, encode_filename_for_header
from app.database.conn import get_db

from .api import order_documents_router
from .service import OrderDocumentsService


@cbv(order_documents_router)
class OrderDocumentFileServing:
	"""
	Read-only file serving operations for order documents.
	Handles download and view operations only.
	CRUD operations (including file uploads) are in api.py.
	"""

	def __init__(self, response: Response, db: AsyncSession = Depends(get_db)):
		"""
		Initialize with database session and service.
		"""
		self.db = db
		self.order_documents_service = OrderDocumentsService(self.db)
		self.response = response

	@order_documents_router.get("/{order_id}/documents/{document_id}/download")
	async def download_order_document(self, order_id: uuid.UUID, document_id: uuid.UUID):
		"""
		Download order document file.
		Forces download with proper filename for all file types.
		"""
		# Get document from service
		document = await self.order_documents_service.get_order_document_by_id(document_id)

		file_path = document.src
		if not file_path or not os.path.exists(file_path):
			raise HTTPException(status_code=404, detail="File not found")

		# Get filename from document title or file path
		filename = document.title if document.title else os.path.basename(file_path)

		# Get MIME type
		mime_type = get_mime_type(file_path)

		# Read file content
		with open(file_path, 'rb') as f:
			content = f.read()

		# Encode filename for Content-Disposition header
		content_disposition = encode_filename_for_header(filename)

		return Response(
			content=content,
			media_type=mime_type,
			headers={
				"Content-Disposition": content_disposition
			}
		)

	@order_documents_router.get("/{order_id}/documents/{document_id}/view")
	async def view_order_document(self, order_id: uuid.UUID, document_id: uuid.UUID):
		"""
		View order document file inline in browser.
		Files that can be displayed (PDF, images) are shown inline.
		Files that cannot be displayed (Office docs) are downloaded.
		"""
		# Get document from service
		document = await self.order_documents_service.get_order_document_by_id(document_id)

		file_path = document.src
		if not file_path or not os.path.exists(file_path):
			raise HTTPException(status_code=404, detail="File not found")

		# Read file content
		with open(file_path, 'rb') as f:
			content = f.read()

		# Get MIME type
		mime_type = get_mime_type(file_path)

		# Check if browser can display this file type
		if is_displayable_in_browser(mime_type):
			# Display inline (PDF, images, videos, text, etc.)
			return Response(
				content=content,
				media_type=mime_type
			)
		else:
			# Force download for non-displayable types (Office docs, etc.)
			filename = document.title if document.title else os.path.basename(file_path)
			content_disposition = encode_filename_for_header(filename)
			return Response(
				content=content,
				media_type=mime_type,
				headers={
					"Content-Disposition": content_disposition
				}
			)
