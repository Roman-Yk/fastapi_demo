import uuid
from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.vehicles import Truck
from app.api._shared.base_service import BaseService

from app.utils.queries.fetching import fetch_one_or_none, fetch_all, fetch_count_query, fetch_one_or_404
from app.utils.queries.queries import apply_filter_sort_range_for_query

from .schemas import CollectionTruckQueryParams


class TruckService(BaseService):
    """
    Service class for handling truck-related operations.
    """

    async def get_all_trucks(self, querystring: CollectionTruckQueryParams):
        """
        Fetch all trucks with optional filtering, sorting, and pagination.
        """
        select_query = select(Truck)
        count_query = select(func.count()).select_from(Truck)

        query, count_query = apply_filter_sort_range_for_query(
            Truck,
            select_query,
            count_query,
            querystring.dict_data,
        )

        trucks = await fetch_all(self.db, query)
        trucks_count = await fetch_count_query(self.db, count_query)
        return trucks, trucks_count

    async def get_truck_by_id(self, truck_id: uuid.UUID):
        """
        Retrieve a single truck by its ID.
        """
        query = select(Truck).where(Truck.id == truck_id)
        truck = await fetch_one_or_404(self.db, query, detail="Truck not found")
        return truck 