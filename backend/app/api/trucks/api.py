import uuid

from fastapi import Depends, Response
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.conn import get_db
from app.utils.queries.queries import generate_range

from .schemas import (
    ResponseTruckSchema,
    CollectionTruckQueryParams,
)
from .service import TruckService


trucks_router = InferringRouter(tags=["trucks"])


@cbv(trucks_router)
class TrucksResource:
    """
    Class based view for handling trucks resources.
    """

    def __init__(self, response: Response, db: AsyncSession = Depends(get_db)):
        """
        Initialize the TrucksResource with a database session, TruckService and response object
        to not pass for every route separately.
        """
        self.db = db
        self.truck_service = TruckService(self.db)
        self.response = response

    @trucks_router.get("/trucks", response_model=list[ResponseTruckSchema])
    async def get_trucks(self, query_params: CollectionTruckQueryParams = Depends()):
        """
        Get all trucks with optional filtering, sorting, and pagination.
        """
        """
        query_params: CollectionTruckQueryParams = Depends()
        need to be called like that because it's not a pydantic model and needs to be initialized
        """
        trucks, count = await self.truck_service.get_all_trucks(query_params)
        if query_params.dict_data.get("range"):
            self.response.headers["Content-Range"] = generate_range(
                query_params.dict_data.get("range"), count
            )
        return trucks

    @trucks_router.get("/trucks/{truck_id}", response_model=ResponseTruckSchema)
    async def get_truck_by_id(self, truck_id: uuid.UUID):
        """
        Get truck by ID.
        truck_id - path parameter
        """
        truck = await self.truck_service.get_truck_by_id(truck_id)
        return truck 