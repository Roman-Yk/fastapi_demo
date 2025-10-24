from app.database.models.drivers import Driver
from app.api._shared.base_crud_service import BaseCRUDService

from .schemas import CollectionDriverQueryParams


class DriverService(BaseCRUDService[Driver, CollectionDriverQueryParams]):
    """
    Service class for handling driver-related operations.
    Inherits common CRUD operations from BaseCRUDService.
    """

    model = Driver

    # All basic CRUD operations (get_all, get_by_id) are inherited from BaseCRUDService
    # Add driver-specific business logic methods here if needed 