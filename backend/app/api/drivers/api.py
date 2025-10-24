import uuid

from fastapi import Depends, Response
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.conn import get_db
from app.utils.queries.queries import generate_range

from .schemas import (
    ResponseDriverSchema,
    CollectionDriverQueryParams,
)
from .service import DriverService


drivers_router = InferringRouter(tags=["drivers"])


@cbv(drivers_router)
class DriversResource:
    """
    Class based view for handling drivers resources.
    """

    def __init__(self, response: Response, db: AsyncSession = Depends(get_db)):
        """
        Initialize the DriversResource with a database session, DriverService and response object
        to not pass for every route separately.
        """
        self.db = db
        self.driver_service = DriverService(self.db)
        self.response = response

    @drivers_router.get("/drivers", response_model=list[ResponseDriverSchema])
    async def get_drivers(self, query_params: CollectionDriverQueryParams = Depends()):
        """
        Get all drivers with optional filtering, sorting, and pagination.
        """
        drivers, count = await self.driver_service.get_all(query_params)
        if query_params.dict_data.get("range"):
            self.response.headers["Content-Range"] = generate_range(
                query_params.dict_data.get("range"), count
            )
        return drivers

    @drivers_router.get("/drivers/{driver_id}", response_model=ResponseDriverSchema)
    async def get_driver_by_id(self, driver_id: uuid.UUID):
        """
        Get driver by ID.
        driver_id - path parameter
        """
        driver = await self.driver_service.get_by_id(driver_id)
        return driver 