import asyncio
import uuid
from typing import Dict, Any, Type
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.utils.queries.fetching import is_record_exists


class ForeignKeyValidator:
    """
    Centralized service for validating foreign key references across the application.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def validate_single_reference(
        self,
        model_class: Type[DeclarativeBase],
        record_id: uuid.UUID,
        field_name: str = None,
    ) -> None:
        """
        Validate a single foreign key reference.

        Args:
            model_class: The SQLAlchemy model class to check against
            record_id: The ID to validate
            field_name: Optional field name for better error messages
        """

        is_exists = await is_record_exists(self.db, model_class, record_id)
        if not is_exists:
            field_info = f" for field '{field_name}'" if field_name else ""
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {model_class.__name__.lower()}_id{field_info}: {record_id}",
            )


    async def validate_references_from_mapping(
        self, data: Dict[str, Any], validation_mapping: Dict[str, Type[DeclarativeBase]]
    ) -> None:
        """
        Validate multiple foreign key references based on a field-to-model mapping.

        Args:
            data: Dictionary containing the data to validate
            validation_mapping: Mapping of field names to model classes
        """
        for field_name, model_class in validation_mapping.items():
            if field_name in data and data[field_name] is not None:
                await self.validate_single_reference(model_class, data[field_name], field_name)


