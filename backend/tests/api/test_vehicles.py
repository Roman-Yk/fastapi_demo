import pytest
import uuid
from httpx import AsyncClient
from app.database.models.vehicles import Truck, Trailer


class TestTrucksAPI:
    """Test suite for Trucks API endpoints."""

    @pytest.mark.asyncio
    async def test_get_trucks_empty_database(self, async_client: AsyncClient):
        """Test getting trucks when database is empty."""
        response = await async_client.get("/api/v1/trucks")
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_get_trucks_with_data(
        self, async_client: AsyncClient, sample_truck
    ):
        """Test getting trucks with existing data."""
        # sample_truck = await sample_truck
        response = await async_client.get("/api/v1/trucks")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == sample_truck.name
        assert data[0]["license_plate"] == sample_truck.license_plate
        assert data[0]["id"] == str(sample_truck.id)

    @pytest.mark.asyncio
    async def test_get_truck_by_id_success(
        self, async_client: AsyncClient, sample_truck
    ):
        """Test getting a specific truck by ID."""
        # sample_truck = await sample_truck
        response = await async_client.get(f"/api/v1/trucks/{sample_truck.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(sample_truck.id)
        assert data["name"] == sample_truck.name
        assert data["license_plate"] == sample_truck.license_plate

    @pytest.mark.asyncio
    async def test_get_truck_by_id_not_found(self, async_client: AsyncClient):
        """Test getting a non-existent truck by ID."""
        non_existent_id = uuid.uuid4()
        response = await async_client.get(f"/api/v1/trucks/{non_existent_id}")
        assert response.status_code == 404

    # @pytest.mark.asyncio
    # async def test_create_truck_success(self, async_client: AsyncClient):
    #     """Test creating a new truck with valid data."""
    #     truck_data = {"name": "Test Truck", "license_plate": "ABC-123"}

    #     response = await async_client.post("/api/v1/trucks", json=truck_data)
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert data["name"] == truck_data["name"]
    #     # License plate should be converted to lowercase as per model validation
    #     assert data["license_plate"] == truck_data["license_plate"].lower()
    #     assert "id" in data

    # @pytest.mark.asyncio
    # async def test_create_truck_missing_required_fields(
    #     self, async_client: AsyncClient
    # ):
    #     """Test creating a truck with missing required fields."""
    #     incomplete_data = {"name": "Test Truck"}  # Missing license_plate

    #     response = await async_client.post("/api/v1/trucks", json=incomplete_data)
    #     assert response.status_code == 422  # Validation error

    # @pytest.mark.asyncio
    # async def test_create_truck_empty_fields(self, async_client: AsyncClient):
    #     """Test creating a truck with empty fields."""
    #     empty_data = {"name": "", "license_plate": ""}

    #     response = await async_client.post("/api/v1/trucks", json=empty_data)
    #     assert response.status_code == 422  # Validation error

    # @pytest.mark.asyncio
    # async def test_create_truck_license_plate_case_conversion(
    #     self, async_client: AsyncClient
    # ):
    #     """Test that license plate is converted to lowercase."""
    #     truck_data = {"name": "Test Truck", "license_plate": "ABC-123-XYZ"}

    #     response = await async_client.post("/api/v1/trucks", json=truck_data)
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert data["license_plate"] == "abc-123-xyz"

    # @pytest.mark.asyncio
    # async def test_update_truck_success(
    #     self, async_client: AsyncClient, sample_truck: Truck
    # ):
    #     """Test updating an existing truck with valid data."""
    #     update_data = {"name": "Updated Truck Name", "license_plate": "XYZ-789"}

    #     response = await async_client.put(
    #         f"/api/v1/trucks/{sample_truck.id}", json=update_data
    #     )
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert data["name"] == update_data["name"]
    #     assert data["license_plate"] == update_data["license_plate"].lower()

    # @pytest.mark.asyncio
    # async def test_update_truck_not_found(self, async_client: AsyncClient):
    #     """Test updating a non-existent truck."""
    #     non_existent_id = uuid.uuid4()
    #     update_data = {"name": "Updated Name", "license_plate": "XYZ-789"}

    #     response = await async_client.put(
    #         f"/api/v1/trucks/{non_existent_id}", json=update_data
    #     )
    #     assert response.status_code == 404

    # @pytest.mark.asyncio
    # async def test_delete_truck_success(
    #     self, async_client: AsyncClient, sample_truck
    # ):
    #     """Test deleting an existing truck."""
    #     sample_truck = await sample_truck
    #     response = await async_client.delete(f"/api/v1/trucks/{sample_truck.id}")
    #     assert response.status_code == 200 or response.status_code == 204

    #     # Verify truck is deleted
    #     get_response = await async_client.get(f"/api/v1/trucks/{sample_truck.id}")
    #     assert get_response.status_code == 404

    # @pytest.mark.asyncio
    # async def test_trucks_pagination(self, async_client: AsyncClient):
    #     """Test trucks pagination."""
    #     # Create multiple trucks via API
    #     for i in range(15):
    #         truck_data = {"name": f"Truck {i}", "license_plate": f"T{i:03d}-ABC"}
    #         response = await async_client.post("/api/v1/trucks", json=truck_data)
    #         assert response.status_code == 200

    #     # Test pagination
    #     response = await async_client.get("/api/v1/trucks?page=1&perPage=10")
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert len(data) <= 10

    # @pytest.mark.asyncio
    # async def test_truck_duplicate_license_plate(
    #     self, async_client: AsyncClient, sample_truck
    # ):
    #     """Test creating a truck with duplicate license plate."""
    #     sample_truck = await sample_truck
    #     duplicate_data = {
    #         "name": "Different Truck",
    #         "license_plate": sample_truck.license_plate,
    #     }

    #     response = await async_client.post("/api/v1/trucks", json=duplicate_data)
    #     # This might succeed or fail depending on business rules
    #     assert response.status_code in [200, 400, 422]


class TestTrailersAPI:
    """Test suite for Trailers API endpoints."""

    @pytest.mark.asyncio
    async def test_get_trailers_empty_database(self, async_client: AsyncClient):
        """Test getting trailers when database is empty."""
        response = await async_client.get("/api/v1/trailers")
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_get_trailers_with_data(
        self, async_client: AsyncClient, sample_trailer
    ):
        """Test getting trailers with existing data."""
        response = await async_client.get("/api/v1/trailers")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == sample_trailer.name
        assert data[0]["license_plate"] == sample_trailer.license_plate
        assert data[0]["id"] == str(sample_trailer.id)

    @pytest.mark.asyncio
    async def test_get_trailer_by_id_success(
        self, async_client: AsyncClient, sample_trailer: Trailer
    ):
        """Test getting a specific trailer by ID."""
        response = await async_client.get(f"/api/v1/trailers/{sample_trailer.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(sample_trailer.id)
        assert data["name"] == sample_trailer.name
        assert data["license_plate"] == sample_trailer.license_plate

    @pytest.mark.asyncio
    async def test_get_trailer_by_id_not_found(self, async_client: AsyncClient):
        """Test getting a non-existent trailer by ID."""
        non_existent_id = uuid.uuid4()
        response = await async_client.get(f"/api/v1/trailers/{non_existent_id}")
        assert response.status_code == 404
