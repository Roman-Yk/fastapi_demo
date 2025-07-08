import pytest
import pytest_asyncio
from typing import AsyncGenerator
import os

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
import asyncio
import uuid
from typing import AsyncGenerator, Generator
from datetime import date, time, datetime

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database.conn import get_db
from app.database.base_model import BASE_MODEL
from app.database.models import *
from contextlib import asynccontextmanager

from testcontainers.postgres import PostgresContainer
from alembic.config import Config
from alembic.command import upgrade
import docker

# Check if Docker is available and running
try:
    docker_client = docker.from_env()
    docker_client.ping()
    print("✅ Docker is available and testcontainers ready")
except Exception as e:
    print(f"\n⚠️  Docker not available: {e}")
    print("💡 To use testcontainers, make sure Docker is installed and running.")
    # Exit with an error to prevent tests from running without Docker
    raise e


# Test database configuration

# Global container instance for testcontainers
_postgres_container = None
_sync_engine = None
_async_engine = None


def pytest_configure(config):
    """Configure pytest with our custom settings."""
    global _postgres_container, _sync_engine, _async_engine

    # Start PostgreSQL container once for all tests
    try:
        _postgres_container = PostgresContainer(
            image="postgres:15",
            username="test_user",
            password="test_password",
            dbname="test_db",
            port=5432,
        )
        _postgres_container.start()

        # Get connection details
        host = _postgres_container.get_container_host_ip()
        port = _postgres_container.get_exposed_port(5432)

        async_url = (
            f"postgresql+asyncpg://test_user:test_password@{host}:{port}/test_db"
        )
        sync_url = f"postgresql://test_user:test_password@{host}:{port}/test_db"

        print(f"\n🚀 PostgreSQL container started at {host}:{port}")

        # Create both sync and async engines
        _sync_engine = create_engine(sync_url, echo=False)
        _async_engine = create_async_engine(async_url, echo=False, future=True)

        # Create tables using synchronous approach (more reliable)
        print("🔄 Creating database tables...")

        try:
            BASE_MODEL.metadata.create_all(bind=_sync_engine)
            print("✅ Database schema created with metadata.create_all")
        except Exception as e:
            print(f"⚠️  metadata.create_all failed: {e}")

            # Fallback to Alembic migrations
            try:
                print("🔄 Trying Alembic migrations as fallback...")
                alembic_ini_path = os.path.join(
                    os.path.dirname(__file__), "..", "alembic.ini"
                )
                alembic_cfg = Config(alembic_ini_path)
                alembic_cfg.set_main_option("script_location", "app:alembic")
                alembic_cfg.set_main_option("sqlalchemy.url", sync_url)
                alembic_cfg.set_main_option("prepend_sys_path", ".")

                upgrade(alembic_cfg, "head")
                print("✅ Database schema created with Alembic")
            except Exception as alembic_error:
                print(f"❌ Both metadata.create_all and Alembic failed!")
                print(f"   metadata.create_all error: {e}")
                print(f"   Alembic error: {alembic_error}")
                raise Exception("Failed to create database schema") from alembic_error

    except Exception as e:
        print(f"\n❌ Failed to start PostgreSQL container: {e}")
        raise e


def pytest_unconfigure(config):
    """Clean up after all tests."""
    global _postgres_container, _sync_engine, _async_engine

    if _sync_engine:
        _sync_engine.dispose()

    if _async_engine:
        # We can't await here, but the engine will be cleaned up when the process exits
        pass

    if _postgres_container:
        print(f"\n🛑 Stopping PostgreSQL container")
        _postgres_container.stop()


@pytest.fixture(scope="function")
def test_db_session():
    """
    Create a synchronous database session for a test, with proper transaction isolation.
    """
    global _sync_engine

    # Create a connection and transaction
    connection = _sync_engine.connect()
    trans = connection.begin()

    # Create session bound to this connection
    session_maker = sessionmaker(bind=connection)
    session = session_maker()

    try:
        yield session
    finally:
        session.close()
        trans.rollback()
        connection.close()


@pytest_asyncio.fixture
async def async_client(test_db_session):
    """Return an async client with DB override."""

    # Create an async session that wraps the sync session
    # This is a bit of a hack but works for testing
    class AsyncSessionWrapper:
        def __init__(self, sync_session):
            self.sync_session = sync_session

        def add(self, obj):
            return self.sync_session.add(obj)

        def delete(self, obj):
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

    # Override the database dependency to return the wrapped session
    async def override_get_db():
        yield AsyncSessionWrapper(test_db_session)

    app.dependency_overrides[get_db] = override_get_db

    # Create AsyncClient with ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    # Clear dependency overrides
    app.dependency_overrides.clear()


# ---- Test data fixtures ----


@pytest.fixture
def sample_terminal(test_db_session):
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
def sample_driver(test_db_session):
    driver = Driver(id=uuid.uuid4(), name="John Doe", phone="+1234567890")
    test_db_session.add(driver)
    test_db_session.flush()
    test_db_session.refresh(driver)
    return driver


@pytest.fixture
def sample_truck(test_db_session):
    truck = Truck(id=uuid.uuid4(), name="Test Truck", license_plate="ABC123")
    test_db_session.add(truck)
    test_db_session.flush()
    test_db_session.refresh(truck)
    return truck


@pytest.fixture
def sample_trailer(test_db_session):
    trailer = Trailer(id=uuid.uuid4(), name="Test Trailer", license_plate="XYZ789")
    test_db_session.add(trailer)
    test_db_session.flush()
    test_db_session.refresh(trailer)
    return trailer


@pytest.fixture
def sample_order(test_db_session, sample_terminal):
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
def sample_order_document(test_db_session, sample_order):
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
def multiple_orders(test_db_session, sample_terminal):
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


# ---- Test data generator ----


class TestDataGenerator:
    @staticmethod
    def valid_order_data(terminal_id: str) -> dict:
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
        return {"notes": "Test order without required fields", "priority": False}

    @staticmethod
    def invalid_order_data_wrong_types() -> dict:
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
        return {"name": "John Doe", "phone": "+1234567890"}

    @staticmethod
    def invalid_driver_data() -> dict:
        return {"name": "", "phone": ""}

    @staticmethod
    def valid_terminal_data() -> dict:
        return {
            "name": "Test Terminal",
            "time_zone": "Europe/Oslo",
            "address": "123 Test Street",
            "short_name": "TEST",
            "account_code": "T001",
        }

    @staticmethod
    def invalid_terminal_data() -> dict:
        return {"name": "", "time_zone": ""}


@pytest.fixture
def test_data_generator():
    return TestDataGenerator()
