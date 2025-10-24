import uuid

from fastapi import Depends, Response
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.conn import get_db
from app.utils.queries.queries import generate_range

from .schemas import (
    ResponseTrailerSchema,
    CollectionTrailerQueryParams,
)
from .service import TrailerService


trailers_router = InferringRouter(tags=["trailers"])


@cbv(trailers_router)
class TrailersResource:
    """
    Class based view for handling trailers resources.
    """

    def __init__(self, response: Response, db: AsyncSession = Depends(get_db)):
        """
        Initialize the TrailersResource with a database session, TrailerService and response object
        to not pass for every route separately.
        """
        self.db = db
        self.trailer_service = TrailerService(self.db)
        self.response = response

    @trailers_router.get("/trailers", response_model=list[ResponseTrailerSchema])
    async def get_trailers(self, query_params: CollectionTrailerQueryParams = Depends()):
        """
        Get all trailers with optional filtering, sorting, and pagination.
        """
        trailers, count = await self.trailer_service.get_all(query_params)
        if query_params.dict_data.get("range"):
            self.response.headers["Content-Range"] = generate_range(
                query_params.dict_data.get("range"), count
            )
        return trailers

    @trailers_router.get("/trailers/{trailer_id}", response_model=ResponseTrailerSchema)
    async def get_trailer_by_id(self, trailer_id: uuid.UUID):
        """
        Get trailer by ID.
        trailer_id - path parameter
        """
        trailer = await self.trailer_service.get_by_id(trailer_id)
        return trailer 