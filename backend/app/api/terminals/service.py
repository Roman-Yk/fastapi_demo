from app.database.models.terminals import Terminal
from app.api._shared.base_crud_service import BaseCRUDService

from .schemas import CollectionTerminalQueryParams


class TerminalService(BaseCRUDService[Terminal, CollectionTerminalQueryParams]):
    """
    Service class for handling terminal-related operations.
    Inherits common CRUD operations from BaseCRUDService.
    """

    model = Terminal

    # All basic CRUD operations (get_all, get_by_id) are inherited from BaseCRUDService
    # Add terminal-specific business logic methods here if needed
