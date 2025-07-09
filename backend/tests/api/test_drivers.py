import pytest
import uuid
from httpx import AsyncClient

from app.database.models.drivers import Driver


class TestDriversAPI:
    """Test suite for Drivers API endpoints."""

    @pytest.mark.asyncio
    async def test_get_drivers_empty_database(self, async_client: AsyncClient):
        """Test getting drivers when database is empty."""
        response = await async_client.get("/api/v1/drivers")
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_get_drivers_with_data(
        self, async_client: AsyncClient, sample_driver: Driver
    ):
        """Test getting drivers with existing data."""
        response = await async_client.get("/api/v1/drivers")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == sample_driver.name
        assert data[0]["phone"] == sample_driver.phone

    @pytest.mark.asyncio
    async def test_get_driver_by_id_success(
        self, async_client: AsyncClient, sample_driver: Driver
    ):
        """Test getting a specific driver by ID."""
        response = await async_client.get(f"/api/v1/drivers/{sample_driver.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(sample_driver.id)
        assert data["name"] == sample_driver.name

    @pytest.mark.asyncio
    async def test_get_driver_by_id_not_found(self, async_client: AsyncClient):
        """Test getting a non-existent driver by ID."""
        non_existent_id = uuid.uuid4()
        response = await async_client.get(f"/api/v1/drivers/{non_existent_id}")
        assert response.status_code == 404

  