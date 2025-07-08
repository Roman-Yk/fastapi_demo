import pytest
import uuid
from httpx import AsyncClient
from app.database.models.terminals import Terminal


class TestTerminalsAPI:
    """Test suite for Terminals API endpoints."""

    @pytest.mark.asyncio
    async def test_get_terminals_empty_database(self, async_client: AsyncClient):
        """Test getting terminals when database is empty."""
        response = await async_client.get("/api/v1/terminals")
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_get_terminals_with_data(
        self, async_client: AsyncClient, sample_terminal
    ):
        """Test getting terminals with existing data."""
        sample_terminal = await sample_terminal
        response = await async_client.get("/api/v1/terminals")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == sample_terminal.name
        assert data[0]["time_zone"] == sample_terminal.time_zone
        assert data[0]["address"] == sample_terminal.address
        assert data[0]["short_name"] == sample_terminal.short_name
        assert data[0]["account_code"] == sample_terminal.account_code

    @pytest.mark.asyncio
    async def test_get_terminal_by_id_success(
        self, async_client: AsyncClient, sample_terminal
    ):
        """Test getting a specific terminal by ID."""
        sample_terminal = await sample_terminal
        response = await async_client.get(f"/api/v1/terminals/{sample_terminal.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(sample_terminal.id)
        assert data["name"] == sample_terminal.name
        assert data["time_zone"] == sample_terminal.time_zone

    @pytest.mark.asyncio
    async def test_get_terminal_by_id_not_found(self, async_client: AsyncClient):
        """Test getting a non-existent terminal by ID."""
        non_existent_id = uuid.uuid4()
        response = await async_client.get(f"/api/v1/terminals/{non_existent_id}")
        assert response.status_code == 404

    # @pytest.mark.asyncio
    # async def test_create_terminal_success(
    #     self, async_client: AsyncClient, test_data_generator
    # ):
    #     """Test creating a new terminal with valid data."""
    #     terminal_data = test_data_generator.valid_terminal_data()

    #     response = await async_client.post("/api/v1/terminals", json=terminal_data)
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert data["name"] == terminal_data["name"]
    #     assert data["time_zone"] == terminal_data["time_zone"]
    #     assert data["address"] == terminal_data["address"]
    #     assert data["short_name"] == terminal_data["short_name"]
    #     assert data["account_code"] == terminal_data["account_code"]

    # @pytest.mark.asyncio
    # async def test_create_terminal_missing_required_fields(
    #     self, async_client: AsyncClient
    # ):
    #     """Test creating a terminal with missing required fields."""
    #     incomplete_data = {"name": "Test Terminal"}

    #     response = await async_client.post("/api/v1/terminals", json=incomplete_data)
    #     assert response.status_code == 422

    # @pytest.mark.asyncio
    # async def test_create_terminal_invalid_data(
    #     self, async_client: AsyncClient, test_data_generator
    # ):
    #     """Test creating a terminal with invalid data."""
    #     invalid_data = test_data_generator.invalid_terminal_data()

    #     response = await async_client.post("/api/v1/terminals", json=invalid_data)
    #     assert response.status_code == 422

    # @pytest.mark.asyncio
    # async def test_create_terminal_invalid_timezone(self, async_client: AsyncClient):
    #     """Test creating a terminal with invalid timezone."""
    #     invalid_data = {
    #         "name": "Test Terminal",
    #         "time_zone": "Invalid/Timezone",
    #         "address": "123 Test Street",
    #         "short_name": "TEST",
    #         "account_code": "T001",
    #     }

    #     response = await async_client.post("/api/v1/terminals", json=invalid_data)
    #     assert response.status_code == 422

    # @pytest.mark.asyncio
    # async def test_create_terminal_valid_timezones(self, async_client: AsyncClient):
    #     """Test creating terminals with various valid timezones."""
    #     valid_timezones = [
    #         "UTC",
    #         "Europe/Oslo",
    #         "America/New_York",
    #         "Asia/Tokyo",
    #         "Australia/Sydney",
    #     ]

    #     for tz in valid_timezones:
    #         terminal_data = {
    #             "name": f"Terminal {tz}",
    #             "time_zone": tz,
    #             "address": "123 Test Street",
    #             "short_name": f"T{tz[:2]}",
    #             "account_code": f"T{tz[:3]}",
    #         }

    #         response = await async_client.post("/api/v1/terminals", json=terminal_data)
    #         assert response.status_code == 200
    #         data = response.json()
    #         assert data["time_zone"] == tz

    # @pytest.mark.asyncio
    # async def test_update_terminal_success(
    #     self, async_client: AsyncClient, sample_terminal
    # ):
    #     """Test updating an existing terminal."""
    #     sample_terminal = await sample_terminal
    #     update_data = {
    #         "name": "Updated Terminal Name",
    #         "time_zone": "America/New_York",
    #         "address": "456 Updated Street",
    #         "short_name": "UPDATED",
    #         "account_code": "U001",
    #     }

    #     response = await async_client.put(
    #         f"/api/v1/terminals/{sample_terminal.id}", json=update_data
    #     )
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert data["name"] == update_data["name"]
    #     assert data["time_zone"] == update_data["time_zone"]
    #     assert data["address"] == update_data["address"]
    #     assert data["short_name"] == update_data["short_name"]
    #     assert data["account_code"] == update_data["account_code"]

    # @pytest.mark.asyncio
    # async def test_update_terminal_not_found(self, async_client: AsyncClient):
    #     """Test updating a non-existent terminal."""
    #     non_existent_id = uuid.uuid4()
    #     update_data = {
    #         "name": "Updated Terminal Name",
    #         "time_zone": "America/New_York",
    #         "address": "456 Updated Street",
    #         "short_name": "UPDATED",
    #         "account_code": "U001",
    #     }

    #     response = await async_client.put(
    #         f"/api/v1/terminals/{non_existent_id}", json=update_data
    #     )
    #     assert response.status_code == 404

    # @pytest.mark.asyncio
    # async def test_terminal_field_validation(self, async_client: AsyncClient):
    #     """Test terminal field validation edge cases."""
    #     test_cases = [
    #         {
    #             "data": {
    #                 "name": "",
    #                 "time_zone": "UTC",
    #                 "address": "123 Test Street",
    #                 "short_name": "TEST",
    #                 "account_code": "T001",
    #             },
    #             "expected_status": 422,
    #         },
    #         {
    #             "data": {
    #                 "name": "Test Terminal",
    #                 "time_zone": "",
    #                 "address": "123 Test Street",
    #                 "short_name": "TEST",
    #                 "account_code": "T001",
    #             },
    #             "expected_status": 422,
    #         },
    #         {
    #             "data": {
    #                 "name": "A" * 300,  # Very long name
    #                 "time_zone": "UTC",
    #                 "address": "123 Test Street",
    #                 "short_name": "TEST",
    #                 "account_code": "T001",
    #             },
    #             "expected_status": [200, 422],
    #         },
    #     ]

    #     for test_case in test_cases:
    #         response = await async_client.post(
    #             "/api/v1/terminals", json=test_case["data"]
    #         )
    #         if isinstance(test_case["expected_status"], list):
    #             assert response.status_code in test_case["expected_status"]
    #         else:
    #             assert response.status_code == test_case["expected_status"]

    # @pytest.mark.asyncio
    # async def test_terminals_pagination(self, async_client: AsyncClient):
    #     """Test terminals pagination."""
    #     # Create multiple terminals via API
    #     for i in range(15):
    #         terminal_data = {
    #             "name": f"Terminal {i}",
    #             "time_zone": "UTC",
    #             "address": f"Address {i}",
    #             "short_name": f"T{i:02d}",
    #             "account_code": f"AC{i:03d}",
    #         }
    #         response = await async_client.post("/api/v1/terminals", json=terminal_data)
    #         assert response.status_code == 200

    #     # Test pagination
    #     response = await async_client.get("/api/v1/terminals?page=1&perPage=10")
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert len(data) <= 10

    #     # Test second page
    #     response = await async_client.get("/api/v1/terminals?page=2&perPage=10")
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert len(data) <= 10

    # @pytest.mark.asyncio
    # async def test_terminals_filtering(self, async_client: AsyncClient):
    #     """Test terminals filtering by various criteria."""
    #     # Create terminals with different timezones via API
    #     timezones = ["UTC", "Europe/Oslo", "America/New_York"]
    #     for i, tz in enumerate(timezones):
    #         terminal_data = {
    #             "name": f"Terminal {i}",
    #             "time_zone": tz,
    #             "address": f"Address {i}",
    #             "short_name": f"T{i:02d}",
    #             "account_code": f"AC{i:03d}",
    #         }
    #         response = await async_client.post("/api/v1/terminals", json=terminal_data)
    #         assert response.status_code == 200

    #     # Test filtering by timezone
    #     response = await async_client.get("/api/v1/terminals?time_zone=UTC")
    #     assert response.status_code == 200
    #     data = response.json()
    #     for terminal in data:
    #         assert terminal["time_zone"] == "UTC"

    # @pytest.mark.asyncio
    # async def test_delete_terminal_success(
    #     self, async_client: AsyncClient, sample_terminal
    # ):
    #     """Test deleting an existing terminal."""
    #     sample_terminal = await sample_terminal
    #     response = await async_client.delete(f"/api/v1/terminals/{sample_terminal.id}")
    #     assert response.status_code == 200 or response.status_code == 204

    #     # Verify terminal is deleted
    #     get_response = await async_client.get(f"/api/v1/terminals/{sample_terminal.id}")
    #     assert get_response.status_code == 404

    # @pytest.mark.asyncio
    # async def test_delete_terminal_not_found(self, async_client: AsyncClient):
    #     """Test deleting a non-existent terminal."""
    #     non_existent_id = uuid.uuid4()
    #     response = await async_client.delete(f"/api/v1/terminals/{non_existent_id}")
    #     assert response.status_code == 404

    # @pytest.mark.asyncio
    # async def test_terminal_with_optional_fields(self, async_client: AsyncClient):
    #     """Test creating a terminal with optional fields."""
    #     terminal_data = {
    #         "name": "Complete Terminal",
    #         "time_zone": "Europe/Oslo",
    #         "address": "123 Complete Street",
    #         "short_name": "COMP",
    #         "account_code": "COMP001",
    #     }

    #     response = await async_client.post("/api/v1/terminals", json=terminal_data)
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert data["name"] == terminal_data["name"]
    #     assert data["time_zone"] == terminal_data["time_zone"]
    #     assert data["address"] == terminal_data["address"]
    #     assert data["short_name"] == terminal_data["short_name"]
    #     assert data["account_code"] == terminal_data["account_code"]

    # @pytest.mark.asyncio
    # async def test_terminal_duplicate_name(
    #     self, async_client: AsyncClient, sample_terminal: Terminal
    # ):
    #     """Test creating a terminal with duplicate name."""
    #     sample_terminal = await sample_terminal
    #     duplicate_data = {
    #         "name": sample_terminal.name,
    #         "time_zone": "UTC",
    #         "address": "Different Address",
    #         "short_name": "DIFF",
    #         "account_code": "DIFF001",
    #     }

    #     response = await async_client.post("/api/v1/terminals", json=duplicate_data)
    #     # This might succeed or fail depending on business rules
    #     assert response.status_code in [200, 400, 422]
