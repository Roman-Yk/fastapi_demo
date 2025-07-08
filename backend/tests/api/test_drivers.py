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
        # sample_driver = await sample_driver
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
        # sample_driver = await sample_driver
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

    # @pytest.mark.asyncio
    # async def test_create_driver_success(self, async_client: AsyncClient):
    #     """Test creating a new driver with valid data."""
    #     driver_data = {
    #         "name": "John Doe",
    #         "phone": "+1234567890",
    #     }

    #     response = await async_client.post("/api/v1/drivers", json=driver_data)
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert data["name"] == driver_data["name"]
    #     assert data["phone"] == driver_data["phone"]

    # @pytest.mark.asyncio
    # async def test_create_driver_missing_required_fields(
    #     self, async_client: AsyncClient
    # ):
    #     """Test creating a driver with missing required fields."""
    #     incomplete_data = {"name": "John Doe"}

    #     response = await async_client.post("/api/v1/drivers", json=incomplete_data)
    #     assert response.status_code == 422

    # @pytest.mark.asyncio
    # async def test_create_driver_invalid_phone(self, async_client: AsyncClient):
    #     """Test creating a driver with invalid phone number."""
    #     invalid_data = {
    #         "name": "John Doe",
    #         "phone": "invalid-phone",
    #     }

    #     response = await async_client.post("/api/v1/drivers", json=invalid_data)
    #     assert response.status_code == 422

    # @pytest.mark.asyncio
    # async def test_create_driver_empty_fields(self, async_client: AsyncClient):
    #     """Test creating a driver with empty fields."""
    #     empty_data = {"name": "", "phone": ""}

    #     response = await async_client.post("/api/v1/drivers", json=empty_data)
    #     assert response.status_code == 422

    # @pytest.mark.asyncio
    # async def test_update_driver_success(
    #     self, async_client: AsyncClient, sample_driver: Driver
    # ):
    #     """Test updating an existing driver."""
    #     sample_driver = await sample_driver
    #     update_data = {
    #         "name": "Updated Driver Name",
    #         "phone": "+0987654321",
    #     }

    #     response = await async_client.put(
    #         f"/api/v1/drivers/{sample_driver.id}", json=update_data
    #     )
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert data["name"] == update_data["name"]
    #     assert data["phone"] == update_data["phone"]

    # @pytest.mark.asyncio
    # async def test_update_driver_not_found(self, async_client: AsyncClient):
    #     """Test updating a non-existent driver."""
    #     non_existent_id = uuid.uuid4()
    #     update_data = {
    #         "name": "Updated Driver Name",
    #         "phone": "+0987654321",
    #     }

    #     response = await async_client.put(
    #         f"/api/v1/drivers/{non_existent_id}", json=update_data
    #     )
    #     assert response.status_code == 404

    # @pytest.mark.asyncio
    # async def test_delete_driver_success(
    #     self, async_client: AsyncClient, sample_driver: Driver
    # ):
    #     """Test deleting an existing driver."""
    #     sample_driver = await sample_driver
    #     response = await async_client.delete(f"/api/v1/drivers/{sample_driver.id}")
    #     assert response.status_code == 200

    #     # Verify driver is deleted
    #     get_response = await async_client.get(f"/api/v1/drivers/{sample_driver.id}")
    #     assert get_response.status_code == 404

    # @pytest.mark.asyncio
    # async def test_drivers_pagination(self, async_client: AsyncClient):
    #     """Test drivers pagination."""
    #     # Create multiple drivers via API for pagination test
    #     for i in range(15):
    #         driver_data = {
    #             "name": f"Driver {i}",
    #             "phone": f"+123456{i:04d}",
    #         }
    #         response = await async_client.post("/api/v1/drivers", json=driver_data)
    #         assert response.status_code == 200

    #     # Test pagination
    #     response = await async_client.get("/api/v1/drivers?page=1&perPage=10")
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert len(data) <= 10

    # @pytest.mark.asyncio
    # async def test_driver_duplicate_phone(
    #     self, async_client: AsyncClient, sample_driver: Driver
    # ):
    #     """Test creating a driver with duplicate phone number."""
    #     sample_driver = await sample_driver
    #     duplicate_data = {
    #         "name": "Duplicate Driver",
    #         "phone": sample_driver.phone,
    #     }

    #     response = await async_client.post("/api/v1/drivers", json=duplicate_data)
    #     assert response.status_code in [409, 422, 400]

    # @pytest.mark.asyncio
    # async def test_driver_field_validation(self, async_client: AsyncClient):
    #     """Test driver field validation."""
    #     test_cases = [
    #         {
    #             "data": {"name": "", "phone": "+1234567890"},
    #             "expected_status": 422,
    #         },
    #         {
    #             "data": {"name": "John Doe", "phone": ""},
    #             "expected_status": 422,
    #         },
    #         {
    #             "data": {"name": "John Doe", "phone": "123"},  # Too short
    #             "expected_status": 422,
    #         },
    #     ]

    #     for test_case in test_cases:
    #         response = await async_client.post(
    #             "/api/v1/drivers", json=test_case["data"]
    #         )
    #         assert response.status_code == test_case["expected_status"]

    # @pytest.mark.asyncio
    # async def test_driver_phone_formats(self, async_client: AsyncClient):
    #     """Test various phone number formats."""
    #     valid_formats = [
    #         "+1234567890",
    #         "+123 456 7890",
    #         "+1-234-567-8900",
    #         "+1 (234) 567-8900",
    #     ]

    #     for phone in valid_formats:
    #         driver_data = {
    #             "name": f"Test Driver for {phone}",
    #             "phone": phone,
    #         }
    #         response = await async_client.post("/api/v1/drivers", json=driver_data)
    #         # Should either pass or provide consistent validation error
    #         assert response.status_code in [200, 422]
