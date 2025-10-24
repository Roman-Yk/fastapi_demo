from app.database.models.vehicles import Truck
from app.api._shared.base_crud_service import BaseCRUDService

from .schemas import CollectionTruckQueryParams


class TruckService(BaseCRUDService[Truck, CollectionTruckQueryParams]):
    """
    Service class for handling truck-related operations.
    Inherits common CRUD operations from BaseCRUDService.
    """

    model = Truck

    # All basic CRUD operations (get_all, get_by_id) are inherited from BaseCRUDService
    # Add truck-specific business logic methods here if needed 