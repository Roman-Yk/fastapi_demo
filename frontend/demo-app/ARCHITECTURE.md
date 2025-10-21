# Frontend Architecture

## Domain-Driven Architecture

This application follows a domain-driven architecture where each business domain (orders, drivers, terminals, vehicles) has its own self-contained module with all related code colocated.

## Directory Structure

```
src/
├── domains/                    # Business domain modules
│   ├── orders/                 # Orders domain
│   │   ├── api/               # Order-specific API services
│   │   │   ├── orderService.ts
│   │   │   └── orderDocumentService.ts
│   │   ├── components/        # Order-specific components
│   │   │   ├── OrderGrid.tsx
│   │   │   ├── OrderFiltersForm.tsx
│   │   │   └── OrderDocumentsUpload.tsx
│   │   ├── pages/             # Order pages
│   │   │   ├── OrdersPage.tsx
│   │   │   ├── CreateOrderPage.tsx
│   │   │   └── EditOrderPage.tsx
│   │   ├── types/             # Order types
│   │   │   ├── order.ts
│   │   │   └── document.ts
│   │   ├── validation/        # Order validation schemas
│   │   │   └── orderSchema.ts
│   │   └── index.ts           # Domain exports
│   │
│   ├── drivers/               # Drivers domain
│   │   ├── api/              # Driver API service
│   │   │   └── driverService.ts
│   │   ├── types/            # Driver types
│   │   │   └── driver.ts
│   │   └── index.ts
│   │
│   ├── terminals/             # Terminals domain
│   │   ├── api/              # Terminal API service
│   │   │   └── terminalService.ts
│   │   ├── types/            # Terminal types
│   │   │   └── terminal.ts
│   │   └── index.ts
│   │
│   └── vehicles/              # Vehicles domain
│       ├── api/              # Vehicle API services
│       │   ├── truckService.ts
│       │   └── trailerService.ts
│       ├── types/            # Vehicle types
│       │   └── vehicle.ts
│       └── index.ts
│
├── shared/                     # Shared/common code
│   ├── components/            # Reusable UI components
│   │   ├── datagrid/         # Data grid components
│   │   │   ├── Datagrid.tsx
│   │   │   └── DatagridToolbar.tsx
│   │   ├── fields/           # Display field components
│   │   │   ├── TextField.tsx
│   │   │   ├── BadgeField.tsx
│   │   │   ├── DateTimeField.tsx
│   │   │   └── ...
│   │   ├── forms/            # Form components
│   │   │   ├── Form.tsx
│   │   │   ├── FormTextInput.tsx
│   │   │   ├── FormSelectInput.tsx
│   │   │   └── ...
│   │   ├── ui/               # Generic UI components
│   │   │   ├── Filter.tsx
│   │   │   ├── List.tsx
│   │   │   └── ...
│   │   └── index.ts          # Component exports
│   │
│   ├── types/                 # Shared types
│   │   └── common.ts         # Common types (BaseEntity, ApiResponse, etc.)
│   │
│   ├── hooks/                 # Shared hooks
│   │   ├── useApi.ts
│   │   ├── useFormValidation.ts
│   │   └── useFilteredData.ts
│   │
│   ├── utils/                 # Utilities
│   │   └── config.ts
│   │
│   └── constants.ts           # Application constants
│
├── components/                 # Legacy component organization (being migrated)
│   ├── common/               # Common components
│   │   ├── AppRoutes.tsx
│   │   ├── DataLoader.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ErrorPage.tsx
│   └── layout/               # Layout components
│       └── Navbar.tsx
│
├── services/                   # Base services & backwards compatibility
│   ├── baseApiService.ts     # Base API service class
│   ├── apiService.ts          # Legacy service (for old imports)
│   └── apiServices.ts         # Backwards compatibility layer
│
├── hooks/                      # Legacy hooks location (being migrated)
├── pages/                      # Legacy pages location (exports from domains)
└── App.tsx                     # Application root
```

## Design Principles

### 1. Domain Cohesion
Each domain contains all code related to that business area:
- Types specific to the domain
- API services for the domain
- Components that are specific to the domain
- Pages for the domain
- Validation schemas

### 2. Shared Components
Only truly reusable, domain-agnostic components go in `shared/components`:
- Generic UI components (DataGrid, Fields, Forms)
- Components that multiple domains use
- No business logic, pure presentation

### 3. Type Colocation
- Domain types live with their domain
- Only truly shared types (like `BaseEntity`, `ApiResponse`) go in `shared/types`
- This prevents the "hundreds of types in one folder" problem

### 4. Service Organization
- Each domain has its own API service(s)
- Services extend the base `BaseApiService` for consistency
- No "god service" with hundreds of methods

## Migration Path

The application is being migrated from a traditional structure to this domain-driven structure. During the transition:

1. **Backwards Compatibility**: The old `apiServices.ts` provides backwards compatibility for existing imports
2. **Gradual Migration**: Components can be migrated one at a time
3. **Import Paths**: New code should import from domains, old code can still use legacy paths

## Benefits

1. **Scalability**: Each domain can grow independently without affecting others
2. **Maintainability**: Related code is colocated, making it easier to understand and modify
3. **Team Organization**: Different teams can own different domains
4. **Clear Dependencies**: It's obvious what depends on what
5. **Reduced Coupling**: Domains are loosely coupled through well-defined interfaces

## Import Examples

```typescript
// New way - import from domains
import { Order, orderApi, OrderGrid } from '@/domains/orders';
import { Driver, driverApi } from '@/domains/drivers';
import { Datagrid, TextField } from '@/shared/components';

// Old way - still works during migration
import ApiService from '@/services/apiService';
import { Order } from '@/types/order';
```

## Adding a New Domain

To add a new domain (e.g., "reports"):

1. Create the domain structure:
```
src/domains/reports/
├── api/
├── components/
├── pages/
├── types/
├── validation/
└── index.ts
```

2. Add domain-specific code
3. Export everything through the domain's `index.ts`
4. Import from the domain in other parts of the app

This architecture ensures the application remains maintainable and scalable as it grows.