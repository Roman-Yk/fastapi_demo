"""
Database manager for test environments.

Handles database setup for both CI and local environments with proper
abstraction and separation of concerns.
"""

import os
from abc import ABC, abstractmethod
from typing import Optional, Tuple
from sqlalchemy import create_engine, Engine
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from testcontainers.postgres import PostgresContainer


class DatabaseConfig:
    """Configuration for database connection."""

    def __init__(
        self,
        host: str,
        port: int,
        username: str,
        password: str,
        database: str,
    ):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.database = database

    @property
    def sync_url(self) -> str:
        """Get synchronous database URL."""
        return f"postgresql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}"

    @property
    def async_url(self) -> str:
        """Get asynchronous database URL."""
        return f"postgresql+asyncpg://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}"

    @classmethod
    def from_env(cls) -> "DatabaseConfig":
        """Create config from environment variables."""
        # Try DATABASE_URL first
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            # Parse DATABASE_URL (format: postgresql://user:pass@host:port/db)
            from urllib.parse import urlparse

            parsed = urlparse(database_url)
            return cls(
                host=parsed.hostname or "localhost",
                port=parsed.port or 5432,
                username=parsed.username or "postgres",
                password=parsed.password or "postgres",
                database=parsed.path.lstrip("/") or "test_db",
            )

        # Fallback to individual variables
        return cls(
            host=os.getenv("POSTGRES_HOST", "localhost"),
            port=int(os.getenv("POSTGRES_PORT", "5432")),
            username=os.getenv("POSTGRES_USER", "postgres"),
            password=os.getenv("POSTGRES_PASSWORD", "postgres"),
            database=os.getenv("POSTGRES_DB", "test_db"),
        )


class DatabaseProvider(ABC):
    """Abstract base class for database providers."""

    @abstractmethod
    def setup(self) -> DatabaseConfig:
        """Set up database and return configuration."""
        pass

    @abstractmethod
    def teardown(self) -> None:
        """Clean up database resources."""
        pass


class TestcontainersProvider(DatabaseProvider):
    """Database provider using testcontainers for local development."""

    def __init__(self):
        self._container: Optional[PostgresContainer] = None

    def setup(self) -> DatabaseConfig:
        """Start PostgreSQL container and return configuration."""
        print("\n🚀 Local environment - starting testcontainers PostgreSQL")

        self._container = PostgresContainer(
            image="postgres:15",
            username="test_user",
            password="test_password",
            dbname="test_db",
            port=5432,
        )
        self._container.start()

        host = self._container.get_container_host_ip()
        port = int(self._container.get_exposed_port(5432))

        print(f"✅ PostgreSQL container started at {host}:{port}")

        return DatabaseConfig(
            host=host,
            port=port,
            username="test_user",
            password="test_password",
            database="test_db",
        )

    def teardown(self) -> None:
        """Stop PostgreSQL container."""
        if self._container:
            print("\n🛑 Stopping PostgreSQL container")
            self._container.stop()
            self._container = None


class ServiceProvider(DatabaseProvider):
    """Database provider using existing database service (for CI)."""

    def setup(self) -> DatabaseConfig:
        """Get configuration for existing database service."""
        print("\n🔵 CI environment - using service postgres")

        config = DatabaseConfig.from_env()
        print(f"🔗 Connecting to: {config.host}:{config.port}/{config.database}")

        return config

    def teardown(self) -> None:
        """Nothing to clean up - service is managed externally."""
        pass


class DatabaseManager:
    """
    Manages database setup and teardown for tests.

    Automatically selects the appropriate provider based on environment.
    """

    def __init__(self):
        self._provider: Optional[DatabaseProvider] = None
        self._config: Optional[DatabaseConfig] = None
        self._sync_engine: Optional[Engine] = None
        self._async_engine: Optional[AsyncEngine] = None

    @staticmethod
    def is_ci_environment() -> bool:
        """Check if running in CI environment."""
        return os.getenv("CI") == "true" or os.getenv("GITHUB_ACTIONS") == "true"

    def _get_provider(self) -> DatabaseProvider:
        """Get appropriate database provider for current environment."""
        if self.is_ci_environment():
            return ServiceProvider()
        else:
            return TestcontainersProvider()

    def setup(self) -> Tuple[Engine, AsyncEngine]:
        """
        Set up database and return engines.

        Returns:
            Tuple of (sync_engine, async_engine)
        """
        self._provider = self._get_provider()
        self._config = self._provider.setup()

        # Create engines
        self._sync_engine = create_engine(self._config.sync_url, echo=False)
        self._async_engine = create_async_engine(
            self._config.async_url, echo=False, future=True
        )

        return self._sync_engine, self._async_engine

    def teardown(self) -> None:
        """Clean up database resources."""
        if self._sync_engine:
            self._sync_engine.dispose()
            self._sync_engine = None

        if self._async_engine:
            # Async engine cleanup happens on process exit
            self._async_engine = None

        if self._provider:
            self._provider.teardown()
            self._provider = None

        self._config = None

    @property
    def sync_engine(self) -> Optional[Engine]:
        """Get synchronous database engine."""
        return self._sync_engine

    @property
    def async_engine(self) -> Optional[AsyncEngine]:
        """Get asynchronous database engine."""
        return self._async_engine

    @property
    def config(self) -> Optional[DatabaseConfig]:
        """Get database configuration."""
        return self._config
