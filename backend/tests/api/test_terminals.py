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

 