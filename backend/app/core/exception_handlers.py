"""
Global exception handlers for the FastAPI application.
Provides consistent error responses and logging.
"""
import logging
from typing import Union
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import (
    DomainException, ResourceNotFoundException, ValidationException,
    BusinessRuleException, ExternalServiceException
)

logger = logging.getLogger(__name__)


async def domain_exception_handler(request: Request, exc: DomainException) -> JSONResponse:
    """Handle domain-specific exceptions."""
    logger.error(f"Domain exception: {exc.message}", extra={"details": exc.details})
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "Domain Error",
            "message": exc.message,
            "details": exc.details,
            "type": "domain_error"
        }
    )


async def resource_not_found_handler(request: Request, exc: ResourceNotFoundException) -> JSONResponse:
    """Handle resource not found exceptions."""
    logger.warning(f"Resource not found: {exc.message}")
    
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "Resource Not Found",
            "message": exc.message,
            "details": exc.details,
            "type": "not_found"
        }
    )


async def validation_exception_handler(request: Request, exc: ValidationException) -> JSONResponse:
    """Handle validation exceptions."""
    logger.warning(f"Validation error: {exc.message}", extra={"details": exc.details})
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": exc.message,
            "details": exc.details,
            "type": "validation_error"
        }
    )


async def business_rule_exception_handler(request: Request, exc: BusinessRuleException) -> JSONResponse:
    """Handle business rule violations."""
    logger.warning(f"Business rule violation: {exc.message}", extra={"details": exc.details})
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Business Rule Violation",
            "message": exc.message,
            "details": exc.details,
            "type": "business_rule_error"
        }
    )


async def external_service_exception_handler(request: Request, exc: ExternalServiceException) -> JSONResponse:
    """Handle external service exceptions."""
    logger.error(f"External service error: {exc.message}", extra={"details": exc.details})
    
    return JSONResponse(
        status_code=status.HTTP_502_BAD_GATEWAY,
        content={
            "error": "External Service Error",
            "message": "An external service is temporarily unavailable",
            "type": "external_service_error"
        }
    )


async def http_exception_handler(request: Request, exc: Union[HTTPException, StarletteHTTPException]) -> JSONResponse:
    """Handle HTTP exceptions with consistent format."""
    logger.warning(f"HTTP {exc.status_code}: {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "message": exc.detail,
            "status_code": exc.status_code,
            "type": "http_error"
        }
    )


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle request validation errors."""
    logger.warning(f"Request validation error: {exc.errors()}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Request Validation Error",
            "message": "The request data is invalid",
            "details": exc.errors(),
            "type": "request_validation_error"
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle any unhandled exceptions."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "type": "internal_error"
        }
    )


def register_exception_handlers(app):
    """Register all exception handlers with the FastAPI app."""
    
    # Domain exceptions
    app.add_exception_handler(DomainException, domain_exception_handler)
    app.add_exception_handler(ResourceNotFoundException, resource_not_found_handler)
    app.add_exception_handler(ValidationException, validation_exception_handler)
    app.add_exception_handler(BusinessRuleException, business_rule_exception_handler)
    app.add_exception_handler(ExternalServiceException, external_service_exception_handler)
    
    # HTTP exceptions
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    
    # Validation exceptions
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    
    # General exception handler (catch-all)
    app.add_exception_handler(Exception, general_exception_handler) 