"""
Pytest configuration and fixtures for backend tests.

Provides database setup, test client, and sample data fixtures.
"""

import os
import pytest
import pytest_asyncio
import uuid
from datetime import date, time, datetime
from typing import AsyncGenerator, Generator

from sqlalchemy.orm import sessionmaker, Session
from httpx import AsyncClient, ASGITransport

# Set up minimal environment variables BEFORE importing app modules
# This prevents Settings validation errors when modules are imported
# Note: Database credentials are managed by testcontainers, these are just for Settings validation
os.environ.setdefault("POSTGRES_DB", "test_db")
os.environ.setdefault("POSTGRES_USER", "test_user")
os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("POSTGRES_PASSWORD", "test_password")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ.setdefault("PGADMIN_DEFAULT_EMAIL", "test@example.com")
os.environ.setdefault("PGADMIN_DEFAULT_PASSWORD", "test_password")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("FILES_PATH", "test_files")

from app.main import app
from app.database.conn import get_db
from app.database.base_model import BASE_MODEL
from app.database.models import *

from tests.database_manager import DatabaseManager

# Check Docker availability (required for testcontainers in both local and CI)
import docker

env_type = "CI" if DatabaseManager.is_ci_environment() else "local"
try:
    docker_client = docker.from_env()
    docker_client.ping()
    print(f"✅ Docker is available - testcontainers ready ({env_type} environment)")
except Exception as e:
    print(f"\n⚠️  Docker not available: {e}")
    print("💡 Testcontainers requires Docker to be installed and running.")
    print(f"   Environment: {env_type}")
    raise e


# Module-level database manager
_db_manager: DatabaseManager = DatabaseManager()


def pytest_configure(config):
    """Configure pytest with database setup."""
    del config  # Unused but required by pytest
    try:
        sync_engine, async_engine = _db_manager.setup()
        del async_engine  # Created but not needed here

        # Create database schema
        print("🔄 Creating database tables...")
        BASE_MODEL.metadata.create_all(bind=sync_engine)
        print("✅ Database schema created successfully")

    except Exception as e:
        print(f"\n❌ Failed to configure database: {e}")
        _db_manager.teardown()
        raise


def pytest_unconfigure(config):
    """Clean up after all tests."""
    del config  # Unused but required by pytest
    _db_manager.teardown()


@pytest.fixture(scope="function")
def test_db_session() -> Generator[Session, None, None]:
    """
    Provide a transactional database session for a test.

    Each test gets a fresh session with automatic rollback.
    """
    if not _db_manager.sync_engine:
        raise RuntimeError("Database not initialized")

    # Create a connection and transaction
    connection = _db_manager.sync_engine.connect()
    transaction = connection.begin()

    # Create session bound to this connection
    session_factory = sessionmaker(bind=connection)
    session = session_factory()

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest_asyncio.fixture
async def async_client(test_db_session: Session) -> AsyncGenerator[AsyncClient, None]:
    """
    Provide an async HTTP client with database dependency override.

    Args:
        test_db_session: Test database session fixture

    Yields:
        AsyncClient configured for testing
    """

    class AsyncSessionWrapper:
        """Wrapper to make sync session compatible with async context."""

        def __init__(self, sync_session: Session):
            self.sync_session = sync_session

        def add(self, obj):
            return self.sync_session.add(obj)

        async def delete(self, obj):
            return self.sync_session.delete(obj)

        async def execute(self, query):
            return self.sync_session.execute(query)

        async def commit(self):
            return self.sync_session.commit()

        async def flush(self):
            return self.sync_session.flush()

        async def refresh(self, obj):
            return self.sync_session.refresh(obj)

        async def close(self):
            return self.sync_session.close()

    # Override the database dependency
    async def override_get_db():
        yield AsyncSessionWrapper(test_db_session)

    app.dependency_overrides[get_db] = override_get_db

    # Create AsyncClient
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    # Clear dependency overrides
    app.dependency_overrides.clear()


# =====================================================================
# Sample Data Fixtures
# =====================================================================


@pytest.fixture
def sample_terminal(test_db_session: Session) -> Terminal:
    """Create a sample terminal for testing."""
    terminal = Terminal(
        id=uuid.uuid4(),
        name="Test Terminal",
        time_zone="Europe/Oslo",
        address="123 Test Street",
        short_name="TEST",
        account_code="T001",
    )
    test_db_session.add(terminal)
    test_db_session.flush()
    test_db_session.refresh(terminal)
    return terminal


@pytest.fixture
def sample_driver(test_db_session: Session) -> Driver:
    """Create a sample driver for testing."""
    driver = Driver(id=uuid.uuid4(), name="John Doe", phone="+1234567890")
    test_db_session.add(driver)
    test_db_session.flush()
    test_db_session.refresh(driver)
    return driver


@pytest.fixture
def sample_truck(test_db_session: Session) -> Truck:
    """Create a sample truck for testing."""
    truck = Truck(id=uuid.uuid4(), name="Test Truck", license_plate="ABC123")
    test_db_session.add(truck)
    test_db_session.flush()
    test_db_session.refresh(truck)
    return truck


@pytest.fixture
def sample_trailer(test_db_session: Session) -> Trailer:
    """Create a sample trailer for testing."""
    trailer = Trailer(id=uuid.uuid4(), name="Test Trailer", license_plate="XYZ789")
    test_db_session.add(trailer)
    test_db_session.flush()
    test_db_session.refresh(trailer)
    return trailer


@pytest.fixture
def sample_order(test_db_session: Session, sample_terminal: Terminal) -> Order:
    """Create a sample order for testing."""
    order = Order(
        id=uuid.uuid4(),
        reference="TEST-001",
        service=OrderService.RELOAD_CAR_CAR,
        terminal_id=sample_terminal.id,
        eta_date=date.today(),
        eta_time=time(10, 0),
        etd_date=date.today(),
        etd_time=time(18, 0),
        commodity=CommodityType.SALMON,
        pallets=10,
        boxes=100,
        kilos=1500.5,
        notes="Test order",
        priority=False,
    )
    test_db_session.add(order)
    test_db_session.flush()
    test_db_session.refresh(order)
    return order


@pytest.fixture
def sample_order_document(
    test_db_session: Session, sample_order: Order
) -> OrderDocument:
    """Create a sample order document for testing."""
    order_document = OrderDocument(
        id=uuid.uuid4(),
        order_id=sample_order.id,
        title="Test Document",
        src="test_document.pdf",
        thumbnail="test_thumbnail.jpg",
        type=OrderDocumentType.CMR,
        created_at=datetime.now(),
    )
    test_db_session.add(order_document)
    test_db_session.flush()
    test_db_session.refresh(order_document)
    return order_document


@pytest.fixture
def multiple_orders(test_db_session: Session, sample_terminal: Terminal) -> list[Order]:
    """Create multiple sample orders for testing pagination and filtering."""
    orders = []
    for i in range(15):
        order = Order(
            id=uuid.uuid4(),
            reference=f"TEST-{i:03d}",
            service=(
                OrderService.RELOAD_CAR_CAR
                if i % 2 == 0
                else OrderService.RELOAD_CAR_TERMINAL_CAR
            ),
            terminal_id=sample_terminal.id,
            eta_date=date.today(),
            eta_time=time(10, 0),
            etd_date=date.today(),
            etd_time=time(18, 0),
            commodity=CommodityType.SALMON if i % 2 == 0 else CommodityType.TROUTH,
            pallets=10 + i,
            boxes=100 + i * 10,
            kilos=1500.5 + i * 100,
            notes=f"Test order {i}",
            priority=i % 3 == 0,
        )
        test_db_session.add(order)
        orders.append(order)

    test_db_session.flush()
    for order in orders:
        test_db_session.refresh(order)
    return orders


# =====================================================================
# Test Data Generators
# =====================================================================


class TestDataGenerator:
    """Helper class for generating test data."""

    @staticmethod
    def valid_order_data(terminal_id: str) -> dict:
        """Generate valid order data for API requests."""
        return {
            "reference": f"TEST-{uuid.uuid4().hex[:8]}",
            "service": OrderService.RELOAD_CAR_CAR,
            "terminal_id": terminal_id,
            "eta_date": date.today().isoformat(),
            "eta_time": "10:00:00",
            "etd_date": date.today().isoformat(),
            "etd_time": "18:00:00",
            "commodity": CommodityType.SALMON,
            "pallets": 10,
            "boxes": 100,
            "kilos": 1500.5,
            "notes": "Test order",
            "priority": False,
        }

    @staticmethod
    def invalid_order_data_missing_required() -> dict:
        """Generate invalid order data with missing required fields."""
        return {"notes": "Test order without required fields", "priority": False}

    @staticmethod
    def invalid_order_data_wrong_types() -> dict:
        """Generate invalid order data with wrong field types."""
        return {
            "reference": 123,
            "service": "INVALID_SERVICE",
            "terminal_id": "invalid-uuid",
            "eta_date": "invalid-date",
            "eta_time": "invalid-time",
            "pallets": -5,
            "boxes": -10,
            "kilos": -100.5,
            "priority": "not-a-boolean",
        }

    @staticmethod
    def valid_driver_data() -> dict:
        """Generate valid driver data for API requests."""
        return {"name": "John Doe", "phone": "+1234567890"}

    @staticmethod
    def invalid_driver_data() -> dict:
        """Generate invalid driver data."""
        return {"name": "", "phone": ""}

    @staticmethod
    def valid_terminal_data() -> dict:
        """Generate valid terminal data for API requests."""
        return {
            "name": "Test Terminal",
            "time_zone": "Europe/Oslo",
            "address": "123 Test Street",
            "short_name": "TEST",
            "account_code": "T001",
        }

    @staticmethod
    def invalid_terminal_data() -> dict:
        """Generate invalid terminal data."""
        return {"name": "", "time_zone": ""}


@pytest.fixture
def test_data_generator() -> TestDataGenerator:
    """Provide test data generator instance."""
    return TestDataGenerator()
