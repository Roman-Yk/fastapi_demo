# FastAPI Enhanced Architecture Documentation

## Overview

This document describes the comprehensive architectural improvements made to the FastAPI application, implementing modern software design patterns and best practices.

## Architecture Patterns Implemented

### 1. Domain-Driven Design (DDD)
- **Domain Models**: Pure business logic models in `app/domain/models/`
- **Domain Services**: Business logic coordination in `app/domain/services/`
- **Domain Validators**: Complex business rule validation in `app/domain/validators/`

### 2. Repository Pattern
- **Base Repository**: Generic CRUD operations in `app/infrastructure/repositories/base_repository.py`
- **Specific Repositories**: Entity-specific operations for Order, Driver, Vehicle, Terminal
- **Benefits**: Decoupled data access, testable, swappable data sources

### 3. Unit of Work Pattern
- **Transaction Management**: Coordinates multiple repositories in a single transaction
- **Location**: `app/infrastructure/unit_of_work.py`
- **Benefits**: ACID compliance, automatic rollback on errors

### 4. Event-Driven Architecture
- **Event Bus**: In-memory event publishing and subscription
- **Domain Events**: Order lifecycle events in `app/shared/events/order_events.py`
- **Event Handlers**: Cross-cutting concerns like logging, caching, notifications

### 5. Dependency Injection
- **Container**: Centralized dependency management in `app/core/dependencies.py`
- **FastAPI Integration**: Dependency providers for clean injection
- **Benefits**: Testable, configurable, maintainable

### 6. CQRS (Command Query Responsibility Segregation)
- **Commands**: Write operations through domain services
- **Queries**: Read operations through repositories
- **Benefits**: Scalable, optimized for different access patterns

## Directory Structure

```
backend/app/
├── api/                    # FastAPI routes and endpoints
│   ├── orders/            # Order-related endpoints
│   └── _shared/           # Shared API components
├── core/                  # Core application components
│   ├── dependencies.py   # Dependency injection container
│   ├── exceptions.py     # Custom exceptions
│   ├── exception_handlers.py # Global exception handlers
│   └── settings.py       # Configuration
├── domain/                # Domain layer (business logic)
│   ├── models/           # Domain models (pure business objects)
│   ├── services/         # Domain services (business logic coordinators)
│   └── validators/       # Business rule validators
├── infrastructure/        # Infrastructure layer
│   ├── repositories/     # Data access implementations
│   └── unit_of_work.py   # Transaction management
├── shared/                # Shared components
│   └── events/           # Event system
├── database/              # Database layer
│   ├── models/           # SQLAlchemy ORM models
│   └── conn.py           # Database connections
├── modules/               # Existing modules (cache, redis, etc.)
└── utils/                 # Utilities and helpers
```

## Key Components

### Domain Models
```python
# app/domain/models/order.py
@dataclass
class Order:
    """Domain model with business logic and validation."""
    
    def validate(self) -> list[str]:
        """Business rule validation."""
        
    def can_be_updated(self) -> bool:
        """Business rule checking."""
```

### Repositories
```python
# app/infrastructure/repositories/order_repository.py
class OrderRepository(BaseRepository):
    """Data access for Order entity."""
    
    async def get_by_reference(self, reference: str) -> Optional[OrderModel]:
        """Domain-specific query."""
```

### Domain Services
```python
# app/domain/services/order_service.py
class OrderDomainService:
    """Coordinates business operations."""
    
    async def create_order(self, order_data: CreateOrderSchema) -> OrderModel:
        """Full business logic with validation and events."""
```

### Unit of Work
```python
# Usage in API endpoints
async with transactional_uow as uow:
    order_service = OrderDomainService(uow)
    result = await order_service.create_order(order_data)
    # Automatic commit/rollback
```

### Events
```python
# Domain events are automatically published
await self.event_bus.publish(OrderCreatedEvent(
    order_id=order.id,
    reference=order.reference,
    created_by=created_by
))
```

## API Improvements

### Enhanced Error Handling
- **Custom Exceptions**: Domain-specific error types
- **Global Handlers**: Consistent error responses
- **Validation**: Comprehensive business rule validation

### New Endpoints
- `GET /orders/search` - Search orders
- `GET /orders/statistics` - Order metrics
- `POST /orders/{id}/transport` - Assign transport
- `POST /orders/bulk/priority` - Bulk operations
- `GET /health` - Health check
- `GET /metrics` - Application metrics

### Response Enhancements
- **Caching Headers**: ETags and Cache-Control
- **Location Headers**: For created resources
- **Content-Range**: For pagination
- **Consistent Error Format**: Structured error responses

## Event System

### Event Types
- `OrderCreatedEvent` - Order creation
- `OrderUpdatedEvent` - Order updates
- `OrderDeletedEvent` - Order deletion
- `OrderPriorityChangedEvent` - Priority changes
- `OrderValidationFailedEvent` - Validation failures
- `OrderTransportAssignedEvent` - Transport assignment

### Event Handlers
- **Logging**: Structured logging of all events
- **Cache Management**: Automatic cache invalidation
- **Notifications**: Priority order alerts
- **Metrics**: Event-based metrics collection

## Dependency Injection

### Container Usage
```python
# In API endpoints
async def create_order(
    order: CreateOrderSchema,
    order_service: OrderDomainService = Depends(get_order_service)
):
    """Service automatically injected."""
```

### Transactional Operations
```python
# Automatic transaction management
async def update_order(
    transactional_uow: TransactionalOperation = Depends(get_transactional_uow)
):
    async with transactional_uow as uow:
        # All operations in single transaction
        pass
```

## Validation Architecture

### Multi-Layer Validation
1. **Pydantic Schemas**: Request/response validation
2. **Domain Model Validation**: Business rule validation
3. **Repository Validation**: Database constraint validation
4. **Cross-Entity Validation**: Complex business rules

### Example Validation Flow
```python
# 1. Pydantic validates request format
order_data: CreateOrderSchema = ...

# 2. Domain model validates business rules
domain_order = convert_to_domain_model(order_data)
errors = domain_order.validate()

# 3. Domain validator checks complex rules
validation_errors = await validator.validate_order_creation(domain_order)

# 4. Repository ensures data integrity
order = await repository.create(order_data)
```

## Performance Optimizations

### Database
- **Query Optimization**: Specific repository methods
- **Connection Pooling**: SQLAlchemy async pools
- **Transaction Management**: Unit of Work pattern

### Caching
- **Response Caching**: HTTP cache headers
- **Data Caching**: Redis integration
- **Event-Based Invalidation**: Automatic cache updates

### Async Operations
- **Async/Await**: Throughout the application
- **Concurrent Event Handling**: Parallel event processing
- **Non-Blocking I/O**: Database and external service calls

## Testing Strategy

### Unit Tests
```python
# Test domain models
def test_order_validation():
    order = Order(...)
    errors = order.validate()
    assert len(errors) == 0

# Test repositories with mocks
async def test_order_repository():
    repo = OrderRepository(mock_db)
    order = await repo.create(order_data)
    assert order.id is not None
```

### Integration Tests
```python
# Test API endpoints
async def test_create_order_endpoint():
    response = await client.post("/api/v1/orders", json=order_data)
    assert response.status_code == 201
```

### Event Testing
```python
# Test event publishing
async def test_order_created_event():
    event_bus = InMemoryEventBus()
    # Test event flow
```

## Monitoring and Observability

### Health Checks
- **Database Connectivity**: Connection status
- **Cache Status**: Redis connectivity
- **Service Health**: Component status

### Metrics
- **Order Statistics**: Counts, distributions
- **Event Metrics**: Handler counts, event history
- **Performance Metrics**: Response times, error rates

### Logging
- **Structured Logging**: JSON format with context
- **Event Logging**: All domain events logged
- **Error Tracking**: Comprehensive error logging

## Deployment Considerations

### Environment Configuration
- **Settings**: Pydantic settings with .env files
- **Database**: Connection pooling configuration
- **Cache**: Redis configuration
- **Logging**: Log level configuration

### Docker
```dockerfile
# Optimized for the new architecture
FROM python:3.11-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Setup
1. **Load Balancer**: Multiple application instances
2. **Database**: PostgreSQL with read replicas
3. **Cache**: Redis cluster
4. **Monitoring**: Prometheus + Grafana
5. **Logging**: ELK stack or similar

## Migration Guide

### From Old Architecture
1. **Gradual Migration**: Implement new patterns incrementally
2. **Backward Compatibility**: Keep existing endpoints working
3. **Data Migration**: No database schema changes required
4. **Testing**: Comprehensive testing during migration

### Best Practices
1. **Domain First**: Start with domain models
2. **Repository Pattern**: Implement data access layer
3. **Event Integration**: Add events gradually
4. **Validation**: Enhance validation incrementally

## Future Enhancements

### Possible Additions
1. **CQRS with Separate Databases**: Read/write database separation
2. **Event Sourcing**: Store events as primary data
3. **Microservices**: Split into domain-bounded services
4. **GraphQL**: Alternative API layer
5. **Message Queues**: External event bus (RabbitMQ, Kafka)

### Monitoring Improvements
1. **Distributed Tracing**: OpenTelemetry integration
2. **Metrics Collection**: Prometheus metrics
3. **APM Integration**: Application performance monitoring
4. **Alert System**: Automated alerting on issues

This enhanced architecture provides a solid foundation for scaling the application while maintaining code quality, testability, and maintainability. 