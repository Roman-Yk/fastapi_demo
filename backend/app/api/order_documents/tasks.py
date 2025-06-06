from app.modules.celery import celery_app, TaskBase


@celery_app.task(base=TaskBase, bind=True, name="parse_order_document")
def parse_order_document(self, order_id):
    """
    Task to parse an order document.
    This function should contain the logic to process the order document.
    """
    # Here you would implement the logic to parse the order document
    # For example, fetching the document from a database, processing it, etc.
    print(f"Parsing order document with ID: ")
    # Add your parsing logic here
    
    
