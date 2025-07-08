import pytest
import pytest_asyncio
from typing import AsyncGenerator

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
from app.core.settings import settings
from contextlib import asynccontextmanager


# Test database configuration


@pytest_asyncio.fixture(scope="session")
def event_loop():
    """Create a session-wide event loop."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """Create the PostgreSQL test database engine."""
    engine = create_async_engine(settings.TEST_DATABASE_URL, echo=False, future=True)

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(BASE_MODEL.metadata.create_all)

    yield engine

    # Drop all tables after the session
    async with engine.begin() as conn:
        await conn.run_sync(BASE_MODEL.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_db_session(test_engine):
    """Create a new database session for a test."""
    async_session = async_sessionmaker(
        bind=test_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except SQLAlchemyError as sql_ex:
            await session.rollback()
            raise sql_ex
        except HTTPException as http_ex:
            await session.rollback()
            raise http_ex
        finally:
            await session.close()


@pytest_asyncio.fixture
async def async_client(test_db_session):
    """Return an async client with DB override."""

    # Override the database dependency to return the test session
    async def override_get_db():
        yield test_db_session

    app.dependency_overrides[get_db] = override_get_db

    # Create AsyncClient with ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    # Clear dependency overrides
    app.dependency_overrides.clear()


# ---- Test data fixtures ----


@pytest_asyncio.fixture
async def sample_terminal(test_db_session):
    terminal = Terminal(
        id=uuid.uuid4(),
        name="Test Terminal",
        time_zone="Europe/Oslo",
        address="123 Test Street",
        short_name="TEST",
        account_code="T001",
    )
    test_db_session.add(terminal)
    await test_db_session.commit()
    await test_db_session.refresh(terminal)
    return terminal


@pytest_asyncio.fixture
async def sample_driver(test_db_session):
    driver = Driver(id=uuid.uuid4(), name="John Doe", phone="+1234567890")
    test_db_session.add(driver)
    await test_db_session.commit()
    await test_db_session.refresh(driver)
    return driver


@pytest_asyncio.fixture
async def sample_truck(test_db_session):
    truck = Truck(id=uuid.uuid4(), name="Test Truck", license_plate="ABC123")
    test_db_session.add(truck)
    await test_db_session.commit()
    await test_db_session.refresh(truck)
    return truck


@pytest_asyncio.fixture
async def sample_trailer(test_db_session):
    trailer = Trailer(id=uuid.uuid4(), name="Test Trailer", license_plate="XYZ789")
    test_db_session.add(trailer)
    await test_db_session.commit()
    await test_db_session.refresh(trailer)
    return trailer


@pytest_asyncio.fixture
async def sample_order(test_db_session, sample_terminal):
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
    await test_db_session.commit()
    await test_db_session.refresh(order)
    return order


@pytest_asyncio.fixture
async def sample_order_document(test_db_session, sample_order):
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
    await test_db_session.commit()
    await test_db_session.refresh(order_document)
    return order_document


@pytest_asyncio.fixture
async def multiple_orders(test_db_session, sample_terminal):
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

    await test_db_session.commit()
    for order in orders:
        await test_db_session.refresh(order)
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


@pytest_asyncio.fixture
def test_data_generator():
    return TestDataGenerator()
