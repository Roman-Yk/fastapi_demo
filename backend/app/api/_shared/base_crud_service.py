import uuid
from typing import Generic, TypeVar, Type, Tuple, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.utils.queries.fetching import fetch_all, fetch_count_query, fetch_one_or_404
from app.utils.queries.queries import apply_filter_sort_range_for_query

T = TypeVar('T')  # Model type
Q = TypeVar('Q')  # QueryParams type


class BaseCRUDService(Generic[T, Q]):
    """
    Generic CRUD service providing common database operations for simple resources.

    Type Parameters:
        T: SQLAlchemy model class
        Q: Collection query parameters class

    Usage:
        class DriverService(BaseCRUDService[Driver, CollectionDriverQueryParams]):
            model = Driver
    """

    model: Type[T]

    def __init__(self, db: AsyncSession):
        """
        Initialize the service with a database session.

        Args:
            db: Async SQLAlchemy session
        """
        self.db = db

    async def get_all(self, querystring: Q) -> Tuple[list[T], int]:
        """
        Fetch all records with optional filtering, sorting, and pagination.

        Args:
            querystring: Query parameters containing filter, sort, and range options

        Returns:
            Tuple of (list of records, total count)
        """
        select_query = select(self.model)
        count_query = select(func.count()).select_from(self.model)

        query, count_query = apply_filter_sort_range_for_query(
            self.model,
            select_query,
            count_query,
            querystring.dict_data,
        )

        items = await fetch_all(self.db, query)
        count = await fetch_count_query(self.db, count_query)
        return items, count

    async def get_by_id(self, id: uuid.UUID) -> T:
        """
        Retrieve a single record by its ID.

        Args:
            id: UUID of the record to retrieve

        Returns:
            The requested record

        Raises:
            HTTPException: 404 if record not found
        """
        query = select(self.model).where(self.model.id == id)
        item = await fetch_one_or_404(
            self.db,
            query,
            detail=f"{self.model.__name__} not found"
        )
        return item
