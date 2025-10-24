from app.database.models.vehicles import Trailer
from app.api._shared.base_crud_service import BaseCRUDService

from .schemas import CollectionTrailerQueryParams


class TrailerService(BaseCRUDService[Trailer, CollectionTrailerQueryParams]):
    """
    Service class for handling trailer-related operations.
    Inherits common CRUD operations from BaseCRUDService.
    """

    model = Trailer

    # All basic CRUD operations (get_all, get_by_id) are inherited from BaseCRUDService
    # Add trailer-specific business logic methods here if needed 