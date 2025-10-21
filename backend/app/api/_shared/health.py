"""Health check endpoints for monitoring application status."""

import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel

from app.database.conn import get_db
from app.modules.redis import REDIS_CLIENT

logger = logging.getLogger(__name__)

health_router = APIRouter(tags=["health"])


class HealthStatus(BaseModel):
    """Health status response model."""
    status: str
    checks: dict = {}


@health_router.get("/health", response_model=HealthStatus)
async def health_check():
    """
    Basic health check endpoint.
    Returns 200 if the application is running.
    """
    return HealthStatus(status="ok")


@health_router.get("/health/detailed", response_model=HealthStatus)
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """
    Detailed health check with dependency verification.
    Checks database and Redis connectivity.
    """
    health_status = HealthStatus(status="ok", checks={})

    # Check database
    try:
        await db.execute(text("SELECT 1"))
        health_status.checks["database"] = "ok"
        logger.debug("Database health check passed")
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status.checks["database"] = "error"
        health_status.status = "degraded"

    # Check Redis
    try:
        REDIS_CLIENT.ping()
        health_status.checks["redis"] = "ok"
        logger.debug("Redis health check passed")
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        health_status.checks["redis"] = "error"
        health_status.status = "degraded"

    return health_status


@health_router.get("/health/ready", status_code=status.HTTP_200_OK)
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Readiness probe for Kubernetes/orchestration.
    Returns 200 only if all critical dependencies are available.
    """
    try:
        # Check database
        await db.execute(text("SELECT 1"))

        # Check Redis
        REDIS_CLIENT.ping()

        return {"status": "ready"}
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return {"status": "not ready", "error": str(e)}


@health_router.get("/health/live", status_code=status.HTTP_200_OK)
async def liveness_check():
    """
    Liveness probe for Kubernetes/orchestration.
    Returns 200 if the application process is alive.
    """
    return {"status": "alive"}
