import uuid
from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.vehicles import Trailer

from app.utils.queries.fetching import fetch_one_or_none, fetch_all, fetch_count_query, fetch_one_or_404
from app.utils.queries.queries import apply_filter_sort_range_for_query

from .schemas import CollectionTrailerQueryParams


class TrailerService:
    """
    Service class for handling trailer-related operations.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_trailers(self, querystring: CollectionTrailerQueryParams):
        """
        Fetch all trailers with optional filtering, sorting, and pagination.
        """
        try:
            select_query = select(Trailer)
            count_query = select(func.count()).select_from(Trailer)

            query, count_query = apply_filter_sort_range_for_query(
                Trailer,
                select_query,
                count_query,
                querystring.dict_data,
            )

            trailers = await fetch_all(self.db, query)
            trailers_count = await fetch_count_query(self.db, count_query)
            return trailers, trailers_count
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error fetching trailers: {str(e)}")

    async def get_trailer_by_id(self, trailer_id: uuid.UUID):
        """
        Retrieve a single trailer by its ID.
        """
        query = select(Trailer).where(Trailer.id == trailer_id)
        trailer = await fetch_one_or_404(self.db, query, detail="Trailer not found")
        if not trailer:
            raise HTTPException(status_code=404, detail="Trailer not found")
        return trailer 