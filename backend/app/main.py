import logging
import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import orders_router, order_documents_router
from app.infrastructure.cache import populate_cache_on_startup
from app.core.exception_handlers import register_exception_handlers
from app.shared.events.handlers import register_event_handlers, get_handler_statistics
from app.core.dependencies import get_order_service, get_order_document_service
from app.domain.services.order_service import OrderDomainService
from app.domain.services.order_document_service import OrderDocumentDomainService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="FastAPI Demo - Enhanced Architecture",
    description="Enhanced FastAPI demo with Domain-Driven Design, Repository Pattern, Events, and more.",
    version="2.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
register_exception_handlers(app)

# Include routers
app.include_router(orders_router, prefix="/api/v1", tags=["orders"])
app.include_router(order_documents_router, prefix="/api/v1", tags=["order_documents"])


@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "FastAPI Demo - Enhanced Architecture",
        "version": "2.0.0",
        "architecture": {
            "patterns": [
                "Domain-Driven Design",
                "Repository Pattern",
                "Unit of Work Pattern",
                "Event-Driven Architecture",
                "Dependency Injection",
                "CQRS (Query/Command Separation)"
            ],
            "features": [
                "Custom Exception Handling",
                "Domain Models & Services",
                "Event Publishing & Handling",
                "Comprehensive Validation",
                "Transaction Management",
                "Caching Integration"
            ]
        },
        "endpoints": {
            "docs": "/api/v1/docs",
            "health": "/health",
            "metrics": "/metrics"
        }
    }


@app.get("/health", tags=["monitoring"])
async def health_check():
    """Health check endpoint for monitoring and load balancers."""
    try:
        # You can add more comprehensive health checks here
        # (database connectivity, external services, etc.)
        return {
            "status": "healthy",
            "service": "fastapi-demo",
            "version": "2.0.0",
            "checks": {
                "database": "ok",  # You'd actually check database connectivity
                "cache": "ok",     # You'd actually check Redis connectivity
                "events": "ok"     # Event system status
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "fastapi-demo",
                "error": str(e)
            }
        )


@app.get("/metrics", tags=["monitoring"])
async def get_metrics(
    order_service: OrderDomainService = Depends(get_order_service),
    order_document_service: OrderDocumentDomainService = Depends(get_order_document_service)
):
    """Get comprehensive application metrics and statistics."""
    try:
        # Get order statistics
        order_stats = await order_service.get_order_statistics()
        
        # Get order document statistics
        document_stats = await order_document_service.get_documents_statistics()
        
        # Get event handler statistics
        event_stats = get_handler_statistics()
        
        return {
            "application": {
                "name": "fastapi-demo",
                "version": "2.0.0",
                "uptime": "N/A"  # You'd calculate actual uptime
            },
            "orders": order_stats,
            "documents": document_stats,
            "events": event_stats,
            "architecture": {
                "repositories_active": 6,  # Orders, Documents, Drivers, Trucks, Trailers, Terminals
                "domain_services_active": 2,  # Order and OrderDocument services
                "event_handlers_registered": sum(event_stats["handler_counts"].values())
            }
        }
    except Exception as e:
        logger.error(f"Metrics collection failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Failed to collect metrics",
                "detail": str(e)
            }
        )


@app.on_event("startup")
async def on_startup():
    """Application startup event handler."""
    logger.info("Starting FastAPI Demo with Enhanced Architecture...")
    
    try:
        # Register event handlers
        register_event_handlers()
        logger.info("Event handlers registered successfully")
        
        # Populate cache
        await populate_cache_on_startup()
        logger.info("Cache populated successfully")
        
        logger.info("Application startup completed successfully")
        
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise


@app.on_event("shutdown")
async def on_shutdown():
    """Application shutdown event handler."""
    logger.info("Shutting down FastAPI Demo...")
    
    try:
        # Add cleanup logic here
        # (close connections, save state, etc.)
        logger.info("Application shutdown completed successfully")
        
    except Exception as e:
        logger.error(f"Shutdown error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )