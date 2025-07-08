# FastAPI Demo - Testing Guide

This document provides comprehensive information about the testing setup for the FastAPI Demo project.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Test Runner Script](#test-runner-script)
- [Manual Testing](#manual-testing)
- [Test Coverage](#test-coverage)
- [Test Categories](#test-categories)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The FastAPI Demo project includes a comprehensive test suite that covers:

- **API Endpoints**: All REST API endpoints with valid and invalid data scenarios
- **Database Operations**: CRUD operations, data validation, and constraints
- **Business Logic**: Core application functionality and edge cases
- **Error Handling**: Proper error responses and validation
- **Performance**: Load testing and concurrent operations

### Test Framework Stack

- **pytest**: Primary testing framework
- **pytest-asyncio**: Async test support
- **httpx**: HTTP client for API testing
- **SQLAlchemy**: Database testing with SQLite in-memory
- **Factory Boy**: Test data generation
- **pytest-cov**: Code coverage reporting

## Test Structure

```
backend/
├── tests/
│   ├── conftest.py              # Test configuration and fixtures
│   └── api/
│       ├── test_orders.py       # Order API tests
│       ├── test_drivers.py      # Driver API tests
│       ├── test_terminals.py    # Terminal API tests
│       └── test_vehicles.py     # Truck and Trailer API tests
├── pytest.ini                  # Pytest configuration
└── requirements.in              # Updated with test dependencies
```

## Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)
- Git

### Required Docker Services

- **PostgreSQL**: Database service
- **Redis**: Caching and task queue
- **FastAPI Backend**: API application

## Quick Start

### Using the Test Runner Script (Recommended)

The project includes a comprehensive test runner script that handles all setup and cleanup:

```bash
# Run all tests
./run_tests.sh

# Run tests with coverage report
./run_tests.sh --coverage

# Run specific test pattern
./run_tests.sh --pattern "test_orders"

# Run with verbose output and keep services running
./run_tests.sh --verbose --keep

# See all options
./run_tests.sh --help
```

### Manual Docker Setup

If you prefer manual setup:

```bash
# Start services
docker-compose up -d database redis backend

# Wait for services to be ready
sleep 30

# Run database migrations
docker-compose exec backend alembic upgrade head

# Run tests
docker-compose exec backend python -m pytest tests/

# Stop services
docker-compose down
```

## Test Runner Script

The `run_tests.sh` script provides a comprehensive testing solution:

### Features

- **Automated Setup**: Starts all required services
- **Health Checks**: Waits for services to be ready
- **Database Migrations**: Runs automatically
- **Flexible Options**: Multiple configuration options
- **Error Handling**: Proper cleanup on failures
- **Coverage Reports**: Optional HTML coverage reports
- **Parallel Execution**: Faster test execution

### Command Options

| Option | Description | Example |
|--------|-------------|---------|
| `-h, --help` | Show help message | `./run_tests.sh --help` |
| `-c, --coverage` | Generate coverage report | `./run_tests.sh -c` |
| `-v, --verbose` | Verbose test output | `./run_tests.sh -v` |
| `-k, --keep` | Keep services running | `./run_tests.sh -k` |
| `-p, --pattern` | Run specific tests | `./run_tests.sh -p "orders"` |
| `-s, --sequential` | Run tests sequentially | `./run_tests.sh -s` |
| `-r, --rebuild` | Rebuild Docker images | `./run_tests.sh -r` |
| `--timeout` | Set test timeout | `./run_tests.sh --timeout 600` |

### Examples

```bash
# Development workflow
./run_tests.sh -c -v -k          # Coverage, verbose, keep running

# CI/CD pipeline
./run_tests.sh -c -r             # Coverage with image rebuild

# Debug specific feature
./run_tests.sh -p "test_orders" -v -k    # Orders only, verbose, keep running

# Quick smoke test
./run_tests.sh -p "smoke"        # Run only smoke tests
```

## Manual Testing

### Local Development Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if testing locally)
pip install -r requirements.txt

# Set up test database (SQLite in-memory by default)
# Run tests
python -m pytest tests/ -v
```

### Individual Test Files

```bash
# Test specific API
python -m pytest tests/api/test_orders.py -v

# Test with coverage
python -m pytest tests/api/test_orders.py --cov=app.api.orders

# Test specific function
python -m pytest tests/api/test_orders.py::TestOrdersAPI::test_create_order_success -v
```

## Test Coverage

### Generating Coverage Reports

```bash
# HTML report (recommended)
./run_tests.sh --coverage

# Open report
open htmlcov/index.html  # macOS
# or
xdg-open htmlcov/index.html  # Linux
```

### Coverage Targets

- **Overall Coverage**: Target > 90%
- **API Endpoints**: Target > 95%
- **Business Logic**: Target > 95%
- **Error Handling**: Target > 85%

### Coverage Configuration

Coverage settings are configured in `pytest.ini`:

```ini
[coverage:run]
source = app
omit = 
    */tests/*
    */migrations/*
    */alembic/*

[coverage:report]
show_missing = True
precision = 2
```

## Test Categories

### API Tests (`@pytest.mark.api`)

- **Orders API**: CRUD operations, validation, edge cases
- **Drivers API**: Driver management, validation
- **Terminals API**: Terminal operations, timezone handling
- **Vehicles API**: Truck and trailer management

### Database Tests (`@pytest.mark.database`)

- Model validation
- Foreign key constraints
- Data integrity
- Migration testing

### Integration Tests (`@pytest.mark.integration`)

- End-to-end workflows
- Service interactions
- External dependencies

### Performance Tests (`@pytest.mark.slow`)

- Load testing
- Concurrent operations
- Memory usage
- Response times

## Writing Tests

### Test Structure

```python
import pytest
from fastapi.testclient import TestClient

class TestOrdersAPI:
    """Test suite for Orders API endpoints."""

    @pytest.mark.asyncio
    async def test_create_order_success(self, test_client: TestClient, sample_terminal):
        """Test creating a new order with valid data."""
        order_data = {
            "reference": "TEST-001",
            "service": "RELOAD_CAR_CAR",
            "terminal_id": str(sample_terminal.id)
        }
        
        response = test_client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 200
        data = response.json()
        assert data["reference"] == order_data["reference"]

    @pytest.mark.asyncio
    async def test_create_order_invalid_data(self, test_client: TestClient):
        """Test creating an order with invalid data."""
        invalid_data = {"invalid": "data"}
        
        response = test_client.post("/api/v1/orders", json=invalid_data)
        assert response.status_code == 422  # Validation error
```

### Available Fixtures

- `test_client`: FastAPI test client
- `test_db_session`: Database session
- `sample_terminal`: Test terminal
- `sample_driver`: Test driver
- `sample_truck`: Test truck
- `sample_trailer`: Test trailer
- `sample_order`: Test order
- `multiple_orders`: Multiple test orders
- `test_data_generator`: Helper for generating test data

### Test Data Generation

```python
def test_order_creation(test_client, sample_terminal, test_data_generator):
    """Example using test data generator."""
    order_data = test_data_generator.valid_order_data(str(sample_terminal.id))
    response = test_client.post("/api/v1/orders", json=order_data)
    assert response.status_code == 200
```

### Testing Patterns

#### Valid Data Tests
```python
def test_create_with_valid_data(self, test_client, test_data):
    """Test successful creation with valid data."""
    response = test_client.post("/api/v1/endpoint", json=test_data)
    assert response.status_code == 200
```

#### Invalid Data Tests
```python
def test_create_with_invalid_data(self, test_client):
    """Test validation errors with invalid data."""
    invalid_data = {"field": "invalid_value"}
    response = test_client.post("/api/v1/endpoint", json=invalid_data)
    assert response.status_code == 422
```

#### Edge Cases
```python
def test_edge_case_scenario(self, test_client):
    """Test edge case handling."""
    # Test with boundary values, null values, etc.
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Run Tests
      run: ./run_tests.sh --coverage
    
    - name: Upload Coverage
      uses: codecov/codecov-action@v1
      with:
        file: ./coverage.xml
```

### GitLab CI Example

```yaml
test:
  stage: test
  script:
    - ./run_tests.sh --coverage
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
```

## Troubleshooting

### Common Issues

#### Services Not Starting

```bash
# Check Docker status
docker info

# Check service logs
docker-compose logs backend
docker-compose logs database

# Restart services
docker-compose down
docker-compose up -d
```

#### Test Database Issues

```bash
# Reset test database
docker-compose down -v
docker-compose up -d database
docker-compose exec backend alembic upgrade head
```

#### Permission Issues

```bash
# Make script executable
chmod +x run_tests.sh

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
```

#### Port Conflicts

```bash
# Check port usage
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8000  # FastAPI

# Stop conflicting services
sudo systemctl stop postgresql
sudo systemctl stop redis
```

### Debug Mode

```bash
# Run tests with debug output
./run_tests.sh --verbose --keep

# Access running container
docker-compose exec backend sh

# Check service status
docker-compose ps
```

### Performance Issues

```bash
# Run tests sequentially if parallel execution fails
./run_tests.sh --sequential

# Increase timeout for slow tests
./run_tests.sh --timeout 600

# Run specific test subset
./run_tests.sh --pattern "not slow"
```

### Memory Issues

```bash
# Clean up Docker resources
docker system prune -f

# Increase Docker memory limits
# Edit Docker Desktop settings or daemon.json
```

## Test Maintenance

### Regular Tasks

1. **Update test data** when models change
2. **Review coverage reports** regularly
3. **Refactor tests** to reduce duplication
4. **Update fixtures** for new features
5. **Performance test** new endpoints

### Best Practices

- Write tests before implementing features (TDD)
- Keep tests independent and isolated
- Use descriptive test names
- Test both success and failure scenarios
- Mock external dependencies
- Keep test data minimal and focused
- Regular test maintenance and cleanup

---

## Support

For questions or issues with the testing setup:

1. Check this documentation first
2. Review the test runner script help: `./run_tests.sh --help`
3. Check Docker logs: `docker-compose logs`
4. Create an issue in the project repository

Happy testing! 🧪 