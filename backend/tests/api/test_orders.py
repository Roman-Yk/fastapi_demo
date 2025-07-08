import pytest
import uuid
import json
from datetime import date, time, datetime
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.database.models.orders import Order, OrderService, CommodityType
from app.database.models.terminals import Terminal


class TestOrdersAPI:
    """Test suite for Orders API endpoints."""

    @pytest.mark.asyncio
    async def test_get_orders_empty_database(self, async_client: AsyncClient):
        """Test getting orders when database is empty."""
        response = await async_client.get("/api/v1/orders")
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_get_orders_with_data(self, async_client: AsyncClient, sample_order):
        """Test getting orders with existing data."""
        response = await async_client.get("/api/v1/orders")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["reference"] == sample_order.reference
        assert data[0]["service"] == sample_order.service.value
        assert data[0]["commodity"] == sample_order.commodity.value

    @pytest.mark.asyncio
    async def test_get_orders_with_pagination(
        self, async_client: AsyncClient, multiple_orders
    ):
        """Test getting orders with pagination."""
        response = await async_client.get("/api/v1/orders?range=[0,9]")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 10

        # Test second page
        response = await async_client.get("/api/v1/orders?range=[5,9]")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5


    @pytest.mark.asyncio
    async def test_get_orders_with_filtering(
        self, async_client: AsyncClient, multiple_orders
    ):
        """Test getting orders with filtering."""
        response = await async_client.get(
            "/api/v1/orders",
            params={"filter": json.dumps({"service": 1})}
        )
        assert response.status_code == 200
        data = response.json()
        for order in data:
            assert order["service"] == OrderService.RELOAD_CAR_CAR

    @pytest.mark.asyncio
    async def test_get_orders_with_sorting(
        self, async_client: AsyncClient, multiple_orders
    ):
        """Test getting orders with sorting."""
        response = await async_client.get(
            "/api/v1/orders",
            params={"sort": json.dumps(["reference", "ASC"])}
        )
        assert response.status_code == 200
        data = response.json()
        if len(data) > 1:
            assert data[0]["reference"] <= data[1]["reference"]

    @pytest.mark.asyncio
    async def test_get_order_by_id_success(
        self, async_client: AsyncClient, sample_order
    ):
        """Test getting a specific order by ID."""
        # sample_order = await sample_order
        response = await async_client.get(f"/api/v1/orders/{sample_order.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(sample_order.id)
        assert data["reference"] == sample_order.reference

    @pytest.mark.asyncio
    async def test_get_order_by_id_not_found(self, async_client: AsyncClient):
        """Test getting a non-existent order by ID."""
        non_existent_id = uuid.uuid4()
        response = await async_client.get(f"/api/v1/orders/{non_existent_id}")
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_order_by_invalid_uuid(self, async_client: AsyncClient):
        """Test getting an order with invalid UUID."""
        response = await async_client.get("/api/v1/orders/invalid-uuid")
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_order_success(
        self, async_client: AsyncClient, sample_terminal, test_data_generator
    ):
        """Test creating a new order with valid data."""
        order_data = test_data_generator.valid_order_data(str(sample_terminal.id))

        response = await async_client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 200
        data = response.json()
        assert data["reference"] == order_data["reference"]
        assert data["service"] == order_data["service"]
        assert data["commodity"] == order_data["commodity"]

    @pytest.mark.asyncio
    async def test_create_order_missing_required_fields(
        self, async_client: AsyncClient, test_data_generator
    ):
        """Test creating an order with missing required fields."""
        incomplete_data = test_data_generator.invalid_order_data_missing_required()

        response = await async_client.post("/api/v1/orders", json=incomplete_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_order_invalid_data_types(
        self, async_client: AsyncClient, test_data_generator
    ):
        """Test creating an order with invalid data types."""
        invalid_data = test_data_generator.invalid_order_data_wrong_types()

        response = await async_client.post("/api/v1/orders", json=invalid_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_order_invalid_enum_values(
        self, async_client: AsyncClient, sample_terminal
    ):
        """Test creating an order with invalid enum values."""
        invalid_data = {
            "reference": "TEST-001",
            "service": "INVALID_SERVICE",
            "terminal_id": str(sample_terminal.id),
            "eta_date": date.today().isoformat(),
            "eta_time": "10:00:00",
            "commodity": "INVALID_COMMODITY",
        }

        response = await async_client.post("/api/v1/orders", json=invalid_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_order_invalid_terminal_id(
        self, async_client: AsyncClient, test_data_generator
    ):
        """Test creating an order with invalid terminal ID."""
        invalid_data = test_data_generator.valid_order_data("invalid-terminal-id")

        response = await async_client.post("/api/v1/orders", json=invalid_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_order_negative_quantities(
        self, async_client: AsyncClient, sample_terminal
    ):
        """Test creating an order with negative quantities."""
        invalid_data = {
            "reference": "TEST-NEG",
            "service": OrderService.RELOAD_CAR_CAR,
            "terminal_id": str(sample_terminal.id),
            "eta_date": date.today().isoformat(),
            "eta_time": "10:00:00",
            "commodity": CommodityType.SALMON,
            "pallets": -5,
            "boxes": -10,
            "kilos": -100.5,
        }

        response = await async_client.post("/api/v1/orders", json=invalid_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_order_past_date(
        self, async_client: AsyncClient, sample_terminal
    ):
        """Test creating an order with past date."""
        past_date = date(2020, 1, 1)
        past_data = {
            "reference": "TEST-PAST",
            "service": OrderService.RELOAD_CAR_CAR,
            "terminal_id": str(sample_terminal.id),
            "eta_date": past_date.isoformat(),
            "eta_time": "10:00:00",
            "commodity": CommodityType.SALMON,
        }

        response = await async_client.post("/api/v1/orders", json=past_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_update_order_success(self, async_client: AsyncClient, sample_order):
        """Test updating an existing order."""
        # sample_order = await sample_order
        update_data = {}
        fields = [
            "eta_truck", "eta_driver", "eta_trailer", "eta_driver_phone",
            "etd_truck", "etd_driver", "etd_trailer", "etd_driver_phone",
            "eta_date", "eta_time", "etd_date", "etd_time",
            "commodity", "notes",
            "eta_truck_id", "eta_driver_id", "eta_trailer_id",
            "etd_truck_id", "etd_driver_id", "etd_trailer_id",
            "pallets", "boxes", "kilos"
        ]
        for field in fields:
            value = getattr(sample_order, field)
            if isinstance(value, uuid.UUID):
                update_data[field] = str(value)
            elif isinstance(value, date) or isinstance(value, time):
                update_data[field] = value.isoformat()
            else:
                update_data[field] = value

        update_data["notes"] = "Updated order data"
        update_data["eta_driver"] = "eta driver new guy"

        response = await async_client.put(
            f"/api/v1/orders/{sample_order.id}",
            json=update_data, 
        )
        assert response.status_code == 200
        data = response.json()
        assert data["notes"] == update_data["notes"]
        assert data["eta_driver"] == update_data["eta_driver"]
        assert data["commodity"] == update_data["commodity"]

    @pytest.mark.asyncio
    async def test_patch_order_success(self, async_client: AsyncClient, sample_order):
        """Test partially updating an existing order."""
        # sample_order = await sample_order
        patch_data = {
            "notes": "Patched notes",
        }

        response = await async_client.patch(
            f"/api/v1/orders/{sample_order.id}", json=patch_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data["notes"] == patch_data["notes"]
        # Other fields should remain unchanged
        assert data["boxes"] == sample_order.boxes

    @pytest.mark.asyncio
    async def test_update_order_not_found(self, async_client: AsyncClient):
        """Test updating a non-existent order."""
        non_existent_id = uuid.uuid4()
        update_data = {
            "reference": "UPDATED-REF",
            "service": OrderService.RELOAD_CAR_CAR,
        }

        response = await async_client.put(
            f"/api/v1/orders/{non_existent_id}", json=update_data
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_patch_order_not_found(self, async_client: AsyncClient):
        """Test patching a non-existent order."""
        non_existent_id = uuid.uuid4()
        patch_data = {"notes": "Patched notes"}

        response = await async_client.patch(
            f"/api/v1/orders/{non_existent_id}", json=patch_data
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_update_order_invalid_data(
        self, async_client: AsyncClient, sample_order: Order
    ):
        """Test updating an order with invalid data."""
        invalid_data = {
            "pallets": -5,
        }

        response = await async_client.put(
            f"/api/v1/orders/{sample_order.id}", json=invalid_data
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_order_validation_edge_cases(
        self, async_client: AsyncClient, sample_terminal
    ):
        """Test order validation edge cases."""
        test_cases = [
            {
                "data": {
                    "reference": "A" * 300,  # Very long reference
                    "service": OrderService.RELOAD_CAR_CAR,
                    "terminal_id": str(sample_terminal.id),
                    "eta_date": date.today().isoformat(),
                    "eta_time": "10:00:00",
                    "commodity": CommodityType.SALMON,
                },
                "expected_status": 422,
            },
            {
                "data": {
                    "reference": "TEST-ZERO",
                    "service": OrderService.RELOAD_CAR_CAR,
                    "terminal_id": str(sample_terminal.id),
                    "eta_date": date.today().isoformat(),
                    "eta_time": "10:00:00",
                    "commodity": CommodityType.SALMON,
                    "pallets": 0,
                    "boxes": 0,
                    "kilos": 0.0,
                },
                "expected_status": 422,
            },
        ]

        for test_case in test_cases:
            response = await async_client.post("/api/v1/orders", json=test_case["data"])
            assert response.status_code == test_case["expected_status"]


    @pytest.mark.asyncio
    async def test_concurrent_order_creation(
        self, async_client: AsyncClient, sample_terminal, test_data_generator
    ):
        """Test creating multiple orders concurrently."""
        import asyncio

        async def create_order(ref_suffix):
            order_data = test_data_generator.valid_order_data(str(sample_terminal.id))
            order_data["reference"] = f"CONCURRENT-{ref_suffix}"
            return await async_client.post("/api/v1/orders", json=order_data)

        # Create multiple orders concurrently
        tasks = [create_order(i) for i in range(5)]
        responses = await asyncio.gather(*tasks)

        # All should succeed
        for response in responses:
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_order_json_serialization(
        self, async_client: AsyncClient, sample_order
    ):
        """Test that order JSON serialization works correctly."""
        # sample_order = await sample_order
        response = await async_client.get(f"/api/v1/orders/{sample_order.id}")
        assert response.status_code == 200
        data = response.json()

        # Check that all fields are properly serialized
        assert "id" in data
        assert "reference" in data
        assert "service" in data
        assert "terminal_id" in data
        assert "eta_date" in data
        assert "eta_time" in data
        assert "commodity" in data

    @pytest.mark.asyncio
    async def test_order_field_validation_lengths(
        self, async_client: AsyncClient, sample_terminal: Terminal
    ):
        """Test order field validation for string lengths."""
        # sample_terminal = await sample_terminal
        test_cases = [
            {
                "field": "reference",
                "value": "A" * 1000,  # Very long reference
                "expected_status": 422,
            },
            {
                "field": "notes",
                "value": "A" * 5000,  # Very long notes
                "expected_status": 422,
            },
        ]

        for test_case in test_cases:
            order_data = {
                "reference": "TEST-LENGTH",
                "service": OrderService.RELOAD_CAR_CAR,
                "terminal_id": str(sample_terminal.id),
                "eta_date": date.today().isoformat(),
                "eta_time": "10:00:00",
                "commodity": CommodityType.SALMON,
            }
            order_data[test_case["field"]] = test_case["value"]

            response = await async_client.post("/api/v1/orders", json=order_data)
            assert response.status_code == test_case["expected_status"]

    @pytest.mark.asyncio
    async def test_order_with_null_values(
        self, async_client: AsyncClient, sample_terminal: Terminal
    ):
        """Test creating an order with null values for optional fields."""
        # sample_terminal = await sample_terminal
        null_data = {
            "reference": "TEST-NULL",
            "service": OrderService.RELOAD_CAR_CAR,
            "terminal_id": str(sample_terminal.id),
            "eta_date": date.today().isoformat(),
            "eta_time": "10:00:00",
            "commodity": CommodityType.SALMON,
            "etd_date": None,
            "etd_time": None,
            "pallets": None,
            "boxes": None,
            "kilos": None,
            "notes": None,
            "priority": None,
        }

        response = await async_client.post("/api/v1/orders", json=null_data)
        assert response.status_code == 200
        data = response.json()
        assert data["reference"] == null_data["reference"]


