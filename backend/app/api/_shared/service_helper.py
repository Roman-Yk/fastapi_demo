"""Helper functions for services to ensure consistency across all service classes."""

import logging
from typing import Dict, Type, Any
from app.database.exceptions import ForeignKeyError
from app.utils.queries.fetching import is_record_exists
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


async def validate_foreign_keys(
    db: AsyncSession,
    data: dict,
    fk_validation_map: Dict[str, Type[Any]]
) -> None:
    """
    Validate all foreign key references exist.

    Args:
        db: Database session
        data: Dictionary of data to validate
        fk_validation_map: Mapping of field names to model classes

    Raises:
        ForeignKeyError: If a foreign key reference doesn't exist
    """
    for field, model in fk_validation_map.items():
        if fk_id := data.get(field):
            if not await is_record_exists(db, model, fk_id):
                raise ForeignKeyError(field, model.__name__)
