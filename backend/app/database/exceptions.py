"""Custom database exceptions for better error handling."""

from fastapi import HTTPException, status


class DatabaseError(HTTPException):
    """Base class for database errors."""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )


class NotFoundError(HTTPException):
    """Raised when a resource is not found."""

    def __init__(self, resource: str, identifier: str = None):
        if identifier:
            detail = f"{resource} with id '{identifier}' not found"
        else:
            detail = f"{resource} not found"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )


class ConflictError(HTTPException):
    """Raised when a resource conflict occurs (e.g., duplicate unique field)."""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )


class ValidationError(HTTPException):
    """Raised when data validation fails."""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )


class ForeignKeyError(ValidationError):
    """Raised when a foreign key reference is invalid."""

    def __init__(self, field: str, model_name: str):
        super().__init__(
            detail=f"Invalid {field}: {model_name} does not exist"
        )
