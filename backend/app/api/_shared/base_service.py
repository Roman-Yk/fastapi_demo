from sqlalchemy.ext.asyncio import AsyncSession

class BaseService:
    """
    Base service class providing common functionality for all service classes.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
