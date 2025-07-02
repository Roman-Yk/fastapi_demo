import uuid
from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.drivers import Driver
from app.api._shared.base_service import BaseService

from app.utils.queries.fetching import fetch_one_or_none, fetch_all, fetch_count_query, fetch_one_or_404
from app.utils.queries.queries import apply_filter_sort_range_for_query

from .schemas import CollectionDriverQueryParams


class DriverService(BaseService):
    """
    Service class for handling driver-related operations.
    """

    async def get_all_drivers(self, querystring: CollectionDriverQueryParams):
        """
        Fetch all drivers with optional filtering, sorting, and pagination.
        """
        try:
            select_query = select(Driver)
            count_query = select(func.count()).select_from(Driver)

            query, count_query = apply_filter_sort_range_for_query(
                Driver,
                select_query,
                count_query,
                querystring.dict_data,
            )

            drivers = await fetch_all(self.db, query)
            drivers_count = await fetch_count_query(self.db, count_query)
            return drivers, drivers_count
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error fetching drivers: {str(e)}")

    async def get_driver_by_id(self, driver_id: uuid.UUID):
        """
        Retrieve a single driver by its ID.
        """
        query = select(Driver).where(Driver.id == driver_id)
        driver = await fetch_one_or_404(self.db, query, detail="Driver not found")
        return driver 