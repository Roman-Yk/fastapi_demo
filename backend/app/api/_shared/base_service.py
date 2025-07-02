from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.validation.foreign_key_validator import ForeignKeyValidator


class BaseService:
    """
    Base service class providing common functionality for all service classes.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.fk_validator = ForeignKeyValidator(db)
