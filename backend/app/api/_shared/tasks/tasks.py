# import uuid
# from app.database.models.orders import OrderDocument, OrderDocumentText, Order
# from app.database.models._shared.enums.ProcessStatus import ProcessStatus
# from app.modules.celery import celery_app, TaskBase
# from app.utils.parsing.document_parsing_manager import DocumentParsingManager
# from app.core.configs.FileConfig import FileConfig
# from app.utils.dates.dates_conversion import get_utc_datetime_by_terminal


# @celery_app.task(base=TaskBase, bind=True, name="add_order_document_text")
# def add_order_document_text(self, document_id: uuid.UUID, skip_not_empty=False):
# 	"""
# 	Parses the document with the given ID and adds its text to the OrderDocumentText table
# 	:param document_id: The ID of the document to be processed.
# 	:param skip_not_empty: If True, skips processing if the document text already exists and is
# 		not empty.
# 	"""
# 	max_retries = 3
# 	order_id = None
# 	order_document_text = None
# 	order_document_text_exists = False
# 	skip_process = False
# 	try:
# 		file_name_with_ext, order_id, terminal_id, order_created_at, order_document_text = (
# 				self.session.query(
# 					OrderDocument.src,
# 					OrderDocument.order_id,
# 					Order.terminal_id,
# 					Order.created_at,
# 					OrderDocumentText,
# 				)
# 				.join(Order, Order.id == OrderDocument.order_id)
# 				.outerjoin(
# 					OrderDocumentText,
# 					OrderDocumentText.order_document_id == OrderDocument.id,
# 				)
# 				.filter(
# 					OrderDocument.id == document_id,
# 					OrderDocument.src != FileConfig.deleted_filename,
# 				)
# 				.first()
# 			)
		
# 		extension = DocumentParsingManager.get_file_extension_from_path(file_name_with_ext)

# 		if extension not in FileConfig.documents_extensions:
# 			raise ValueError(f"File with ID {document_id} has unsupported extension: {extension}")

# 		if order_document_text:
# 			order_document_text_exists = True
# 			if skip_not_empty and not order_document_text.text:
# 				skip_process = True

# 		if not skip_process:
# 			if not order_document_text:
# 				order_document_text = OrderDocumentText(
# 					order_document_id=document_id,
# 					order_id=order_id,
# 					order_created_at=order_created_at,
# 				)
# 				self.session.add(order_document_text)

# 			order_document_text.process_status = ProcessStatus.running
# 			self.session.commit()
# 			order_document_text_exists = True

# 		text = DocumentParsingManager.get_text_from_document_by_path(file_name_with_ext)
# 		order_document_text.text = text
# 		order_document_text.text_created_at = get_utc_datetime_by_terminal("id", terminal_id)
# 		order_document_text.process_status = ProcessStatus.done
# 		self.session.commit()
  
# 	except Exception as e:
# 		self.session.rollback()	

# 		if self.request.retries >= max_retries:
# 			if order_document_text and order_document_text_exists:
# 				order_document_text.process_status = ProcessStatus.failed
# 				self.session.commit()
# 		else:
# 			pass
# 			# TODO: if we need retry then we need to handle close DB session in this case
# 			raise self.retry(max_retries=max_retries, countdown=5, exc=e)