# Frontend Architecture Analysis: Practical Issues & Recommendations

## Current State Summary

The frontend is a React + TypeScript application with:
- **Framework**: React 18 with Vite
- **UI Libraries**: Mantine + Material-UI (DataGrid)
- **Structure**: Mix of generic admin components, feature-specific components, centralized types, and services
- **Current Issues**: Mixing concerns, poor type organization, misleading "admin" folder structure

---

## 1. Types Folder Organization Problem

### Current Structure
```
src/types/
├── common.ts          (Base types like ID, Nullable, BaseEntity)
├── order.ts           (Order domain + enums, labels, and UI filters)
├── driver.ts          (Driver domain types)
├── terminal.ts        (Terminal domain types)
├── vehicle.ts         (Truck, Trailer domain types)
├── document.ts        (Document domain types)
└── index.ts           (Re-exports everything)
```

### Problems with Centralized Types

1. **Mixed Concerns in Single Files**
   - `order.ts` contains:
     - Domain model: `Order` interface (44 lines)
     - Business enums: `OrderService`, `CommodityType`
     - UI enums: `DateFilterOption`, `LocationFilter`, `StatusFilter`
     - UI labels: `OrderServiceLabels`, `CommodityLabels`, `DateFilterLabels`, `LocationFilterLabels`, `StatusFilterLabels`
     - UI filters model: `OrderFilters` interface

   ```typescript
   // From order.ts - Mixed domain + UI concerns
   export enum OrderService { ... }           // Backend domain
   export const OrderServiceLabels = { ... }  // Frontend UI
   export enum DateFilterOption { ... }       // Frontend UI concept
   export interface OrderFilters { ... }      // Frontend UI state model
   ```

2. **Difficult to Scale**
   - Adding new domains requires editing the central types folder
   - Hard to see which parts are reused across features vs. feature-specific
   - New team members don't know whether to add types here or create feature-local types

3. **Unclear Dependencies**
   - No clear relationship between domain types and their UI representations
   - When you change `Order`, unclear what UI models depend on it
   - Filter logic tightly coupled to type definitions

4. **Namespace Collision Risk**
   - `OrderDocumentType` enum defined in `document.ts` but used in `orders` components
   - No clear ownership or boundaries

### Real Issues in Current Codebase

**File**: `/src/components/orders/OrderDocumentsUpload.tsx` (lines 38-59)
```typescript
// Enum DUPLICATED in component - diverges from types/document.ts
export enum OrderDocumentType {
  T1 = "T1",
  MIO = "MIO",
  // ... etc
}
```

**File**: `/src/types/order.ts` (lines 83-127)
```typescript
// UI filter enums that have nothing to do with order domain
export enum DateFilterOption { TODAY = 'today', ... }
export enum LocationFilter { OSLO = 'oslo', ... }
export enum StatusFilter { NOT_ACTIVE = 'not_active', ... }
export const LocationFilterLabels = { ... }  // UI strings
export const DateFilterLabels = { ... }      // UI strings
```

### Recommendation: Domain-Driven Type Organization

```
src/domains/
├── orders/
│   ├── types/
│   │   ├── order.ts          (Domain: Order interface only)
│   │   ├── constants.ts      (OrderService, CommodityType enums)
│   │   ├── filters.ts        (DateFilterOption, LocationFilter, etc.)
│   │   └── index.ts          (Re-export for internal use)
│   ├── components/
│   ├── services/
│   └── hooks/
├── drivers/
│   ├── types/
│   ├── components/
│   └── services/
├── vehicles/
│   ├── types/
│   ├── components/
│   └── services/
├── documents/
│   ├── types/
│   ├── components/
│   └── services/
└── common/
    └── types/
        ├── common.ts        (Shared base types)
        └── index.ts
```

**Benefits:**
- Filter enums stay with the feature that uses them
- Domain types are clearly separated from UI models
- Each domain owns its types, components, and services
- Easier to refactor features independently
- Clear import paths: `from '@/domains/orders/types'`

---

## 2. The "Admin" Folder Problem

### Current Structure
```
src/components/admin/
├── List.tsx                    (Generic list layout wrapper)
├── datagrid/
│   ├── Datagrid.tsx            (Generic DataGrid component)
│   ├── DatagridToolbar.tsx     (Generic toolbar)
│   └── index.ts
├── fields/
│   ├── TextField.tsx           (Generic text field for grids)
│   ├── BadgeField.tsx          (Generic badge field)
│   ├── ActionField.tsx         (Generic action column field)
│   ├── DateTimeField.tsx       (Generic datetime field)
│   ├── PriorityField.tsx       (Order-specific!)
│   ├── ReferenceDriverField.tsx (Order-specific!)
│   ├── ReferenceDriverFieldOptimized.tsx (Order-specific!)
│   ├── ReferenceVehicleField.tsx (Order-specific!)
│   ├── ReferenceVehicleFieldOptimized.tsx (Order-specific!)
│   └── index.ts
├── filters/
│   ├── Filter.tsx              (Generic filter base)
│   ├── FilterForm.tsx          (Generic form)
│   ├── ListFilters.tsx         (Generic container)
│   ├── DateRangeFilter.tsx     (Generic)
│   ├── TextFilter.tsx          (Generic)
│   ├── SelectFilter.tsx        (Generic)
│   └── index.ts
├── forms/
│   ├── Form.tsx                (Generic form wrapper)
│   ├── FormTextInput.tsx       (Generic)
│   ├── DriverReferenceField.tsx (Order/Driver-specific!)
│   ├── ReferenceField.tsx      (Generic)
│   ├── TerminalReferenceField.tsx (Order/Terminal-specific!)
│   ├── TrailerReferenceField.tsx (Order/Vehicle-specific!)
│   ├── TruckReferenceField.tsx (Order/Vehicle-specific!)
│   └── index.ts
└── index.ts
```

### The Real Problem: "Admin" Doesn't Mean What It Says

**Issue**: The folder is called "admin" but it contains:
1. **Generic reusable components** (List, Datagrid, basic fields)
2. **Feature-specific components** (Order reference fields, Priority field)

All mixed together with no distinction. This violates single responsibility and makes the folder misleading.

### Problems in Current Code

**File**: `/src/components/admin/fields/PriorityField.tsx`
```typescript
// This is NOT generic - it's order-specific
// Why is it in "admin"?
export const PriorityField: React.FC<FieldProps> = ({ value, record }) => {
  return <IconStar size={16} color={value ? 'orange' : 'gray'} />;
};
```

**File**: `/src/components/admin/fields/ReferenceDriverField.tsx`
```typescript
// This is absolutely order-specific
// Fetches driver data, renders driver name/phone
// Belongs in orders domain
```

**File**: `/src/components/admin/forms/DriverReferenceField.tsx`
```typescript
// Imports from driverApi - clearly order/form specific
// Why is it in "admin/forms"?
```

**File**: `/src/components/features/orders/OrderFiltersForm.tsx` (lines 1-25)
```typescript
import { ListFilters, DateRangeFilter, SelectFilter, BooleanFilter, TextFilter } 
  from '../../admin';  // ← Importing generic filters from admin

// But these are displayed in OrderFiltersForm which is order-specific
// The "admin" folder is really just "generic reusable UI components"
```

### Usage Pattern Shows Misclassification

```typescript
// From OrderGrid.tsx - imports from admin
import { 
  Datagrid,                          // ✓ Generic
  TextField,                         // ✓ Generic
  LinkField,                         // ✓ Generic
  BadgeField,                        // ✓ Generic
  ActionField,                       // ✓ Generic
  CombinedDateTimeField,            // ✓ Generic
  PriorityField,                    // ✗ Order-specific, not generic!
  TooltipField                      // ✓ Generic
} from '../../admin';

import { ReferenceDriverFieldOptimized } from '../../admin/fields/...';  // ✗ Order-specific!
import { ReferenceVehicleFieldOptimized } from '../../admin/fields/...'; // ✗ Order-specific!
```

### Recommendation: Restructure Component Folders

```
src/components/
├── ui/                              # ← Renamed from "admin"
│   ├── List.tsx                     (Generic list layout)
│   ├── datagrid/
│   │   ├── Datagrid.tsx
│   │   ├── DatagridToolbar.tsx
│   │   └── index.ts
│   ├── fields/                      # Only GENERIC field components
│   │   ├── TextField.tsx
│   │   ├── BadgeField.tsx
│   │   ├── ActionField.tsx
│   │   ├── DateTimeField.tsx
│   │   ├── CombinedDateTimeField.tsx
│   │   ├── LinkField.tsx
│   │   ├── TooltipField.tsx
│   │   └── index.ts
│   ├── filters/                     # Only GENERIC filter components
│   │   ├── Filter.tsx
│   │   ├── FilterForm.tsx
│   │   ├── ListFilters.tsx
│   │   ├── DateRangeFilter.tsx
│   │   ├── TextFilter.tsx
│   │   ├── SelectFilter.tsx
│   │   └── index.ts
│   ├── forms/                       # Only GENERIC form components
│   │   ├── Form.tsx
│   │   ├── FormTextInput.tsx
│   │   ├── FormSelectInput.tsx
│   │   ├── FormDateInput.tsx
│   │   ├── Grid.tsx
│   │   ├── GroupGrid.tsx
│   │   └── index.ts
│   └── index.ts
├── common/                          # Shared non-UI utilities
│   ├── ErrorBoundary.tsx
│   ├── ErrorPage.tsx
│   ├── DataLoader.tsx
│   ├── AppRoutes.tsx
│   └── index.ts
├── layout/
│   ├── Navbar.tsx
│   └── index.ts
├── domains/
│   ├── orders/                      # ← NEW: Feature-specific components
│   │   ├── components/
│   │   │   ├── OrderGrid.tsx        (Uses generic UI components)
│   │   │   ├── OrderFiltersForm.tsx (Uses generic UI components)
│   │   │   ├── OrderDocumentsUpload.tsx
│   │   │   └── index.ts
│   │   ├── fields/                  # ← Order-specific field components
│   │   │   ├── PriorityField.tsx    (Was in admin/fields)
│   │   │   ├── ReferenceDriverField.tsx
│   │   │   ├── ReferenceDriverFieldOptimized.tsx
│   │   │   ├── ReferenceVehicleField.tsx
│   │   │   ├── ReferenceVehicleFieldOptimized.tsx
│   │   │   └── index.ts
│   │   ├── forms/                   # ← Order-specific form fields
│   │   │   ├── DriverReferenceField.tsx
│   │   │   ├── TerminalReferenceField.tsx
│   │   │   ├── TrailerReferenceField.tsx
│   │   │   ├── TruckReferenceField.tsx
│   │   │   └── index.ts
│   │   ├── types/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── index.ts
│   ├── drivers/
│   │   ├── components/
│   │   ├── types/
│   │   └── ...
│   ├── vehicles/
│   ├── terminals/
│   └── documents/
└── index.ts
```

**Benefits:**
- Clear separation: "ui" folder only has generic components
- Feature-specific fields/forms live with their feature
- Easy to find where a component belongs
- No confusion about "admin" meaning
- Can evolve each domain independently

---

## 3. Component Organization: Scattered and Mixed

### Current Problem

Orders components are scattered across multiple locations with mixed concerns:

```
src/components/
├── orders/                          # 1 component here
│   └── OrderDocumentsUpload.tsx
├── features/orders/                 # 2 components here
│   ├── OrderGrid.tsx
│   ├── OrderFiltersForm.tsx
│   └── index.ts
└── admin/                           # Order-specific fields hidden here
    ├── fields/
    │   ├── PriorityField.tsx
    │   ├── ReferenceDriverField.tsx
    │   └── ...
    └── forms/
        ├── DriverReferenceField.tsx
        ├── TerminalReferenceField.tsx
        └── ...

src/pages/orders/                    # Pages here
├── OrdersPage.tsx
├── CreateOrderPage.tsx
├── EditOrderPage.tsx
└── ...
```

### Real Issues

1. **Inconsistent Placement**
   - `OrderDocumentsUpload` in `/components/orders/`
   - `OrderGrid` in `/components/features/orders/`
   - `OrderFiltersForm` in `/components/features/orders/`
   - Order field components in `/components/admin/fields/`

2. **"features" Folder Confusion**
   - Currently only has `orders` subfolder
   - Not clear why some order components here and others elsewhere
   - Suggests "features" was an incomplete refactoring

3. **Order-Specific Components in "Admin"**
   ```typescript
   // From src/components/admin/fields/PriorityField.tsx
   // This file is order-specific, not reusable across admin
   
   // From src/components/admin/forms/DriverReferenceField.tsx
   // This is for order forms, not generic admin forms
   ```

4. **Imports are Confusing**
   ```typescript
   // From OrdersPage.tsx
   import { OrderFiltersComponent, OrderGrid } from "../../components/features/orders";
   import { List } from "../../components/admin";
   
   // Why are order components in "features" but List is in "admin"?
   // This is not intuitive
   ```

### Real Code Example: OrderDocumentsUpload

**File**: `/src/components/orders/OrderDocumentsUpload.tsx`

This 742-line component:
- Defines `OrderDocumentType` enum (duplicated from types)
- Contains 3 subcomponents (EditDocumentModal, DocumentEditModal, PendingDocumentCard)
- Handles document upload logic
- Has UI rendering

Should probably be:
```
src/domains/documents/
├── types/
│   ├── document.ts
│   ├── constants.ts          # OrderDocumentType here
│   └── index.ts
├── components/
│   ├── DocumentsUpload.tsx   # Rename, move to documents domain
│   ├── DocumentEditModal.tsx # Extract subcomponent
│   ├── PendingDocumentCard.tsx # Extract subcomponent
│   └── index.ts
├── services/
│   └── documentService.ts
└── hooks/
    └── useDocumentUpload.ts  # Extract upload logic
```

But used FROM orders pages:
```typescript
// In OrdersPage or EditOrderPage
import { DocumentsUpload } from '@/domains/documents/components';
```

---

## 4. Services Organization Problem

### Current Structure

```
src/services/
├── apiService.ts              (Monolithic - all CRUD for all resources)
├── baseApiService.ts          (Generic base class)
├── apiServices.ts             (Domain-specific services extending base)
└── orderDocumentService.ts    (Document-specific service)
```

### Problems

1. **Multiple "Latest" Service Files**
   - `apiService.ts`: Old monolithic approach (not used but still exists)
   - `apiServices.ts`: New modular approach (actively used)
   - `orderDocumentService.ts`: Separate for one domain

   This is confusing - why is DocumentService separate but others in apiServices?

2. **Not Co-located with Domains**
   - Services in `/src/services/`
   - Components in `/src/components/domains/orders/`
   - Harder to work on a feature holistically
   - Services aren't easily discoverable

3. **Services Don't Reflect Domain Structure**
   ```typescript
   // From apiServices.ts
   class OrderApiService extends BaseApiService<Order, ...> {
     protected endpoint = '/orders';
     // Order-specific methods here
   }
   
   class DriverApiService extends BaseApiService<Driver, ...> {
     protected endpoint = '/drivers';
   }
   
   // All mixed in one file
   export const orderApi = new OrderApiService();
   export const driverApi = new DriverApiService();
   export const terminalApi = new TerminalApiService();
   // ... etc
   ```

4. **DocumentService is Out of Place**
   ```typescript
   // orderDocumentService.ts exists separately but:
   // - Specific to OrderDocument
   // - Should probably be in documents domain
   // - Its imports suggest it's handling order documents specifically
   ```

### Recommendation: Domain-Driven Services

```
src/domains/
├── orders/
│   ├── services/
│   │   ├── orderApi.ts         (Extends BaseApiService<Order>)
│   │   └── index.ts
│   ├── components/
│   ├── types/
│   ├── hooks/
│   └── index.ts
├── drivers/
│   ├── services/
│   │   ├── driverApi.ts
│   │   └── index.ts
│   ├── components/
│   ├── types/
│   └── index.ts
├── documents/
│   ├── services/
│   │   ├── documentApi.ts      (Replaces orderDocumentService.ts)
│   │   └── index.ts
│   ├── components/
│   ├── types/
│   ├── hooks/
│   └── index.ts
├── vehicles/
│   ├── services/
│   │   ├── truckApi.ts
│   │   ├── trailerApi.ts
│   │   └── index.ts
│   ├── components/
│   ├── types/
│   └── index.ts
├── terminals/
│   ├── services/
│   │   ├── terminalApi.ts
│   │   └── index.ts
│   ├── components/
│   ├── types/
│   └── index.ts
└── shared/
    └── services/
        ├── baseApiService.ts   (Moved here, no longer in root)
        └── index.ts
```

**Benefits:**
- Services live with their domain
- Easy to find what you need
- Clear ownership
- Services can export feature hooks too
- Easier to deprecate/refactor entire domains

**Example Usage:**
```typescript
// In a component
import { orderApi } from '@/domains/orders/services';
import { useOrders } from '@/domains/orders/hooks';

// Or for documents (moved from being order-specific)
import { documentApi } from '@/domains/documents/services';
```

---

## 5. Real Practical Issues Summary

### Issue 1: Type Duplication
```typescript
// In /src/types/document.ts
export enum OrderDocumentType { T1 = 'T1', ... }

// Then DUPLICATED in /src/components/orders/OrderDocumentsUpload.tsx (line 39)
export enum OrderDocumentType { T1 = "T1", ... }

// Diverges when someone updates one but not the other
// This is a real bug waiting to happen
```

### Issue 2: Unclear Ownership
```typescript
// Where should this go?
// Currently: /src/components/admin/fields/PriorityField.tsx
// But it's only used for Order.priority

// Where should this go?
// Currently: /src/components/orders/OrderDocumentsUpload.tsx
// But documents are a separate domain

// This causes analysis paralysis and inconsistent placement
```

### Issue 3: Import Chaos
```typescript
// From OrdersPage.tsx
import { OrderFiltersComponent, OrderGrid } from "../../components/features/orders";
import { List } from "../../components/admin";
import { orderApi } from "../../services/apiServices";

// Why the inconsistency?
// Some things in "features", some in "admin", services separate
// New developers won't know where to put new components
```

### Issue 4: Hard to Extend
```typescript
// If you want to add a new field to orders:
// 1. Add type to /src/types/order.ts
// 2. Create field component... where?
//    - /src/components/admin/fields/ (generic)?
//    - /src/components/features/orders/ (specific)?
// 3. Import from... which folder?

// There's no clear answer because structure is inconsistent
```

### Issue 5: Service Discoverability
```typescript
// The document service exists at:
// /src/services/orderDocumentService.ts

// But you'd logically look for it at:
// /src/domains/documents/services/documentService.ts

// This wastes developer time
```

---

## Migration Path (Practical Steps)

### Phase 1: Create Domain Structure (Lowest Risk)
```bash
# Create new directory structure without moving files yet
mkdir -p src/domains/{orders,drivers,vehicles,terminals,documents}/{types,components,services,hooks}
mkdir -p src/components/ui/{fields,filters,forms}
```

### Phase 2: Move Services (Safe)
1. Move `OrderApiService` from `apiServices.ts` to `domains/orders/services/orderApi.ts`
2. Keep `apiServices.ts` as compatibility wrapper for a while
3. Gradually update imports

### Phase 3: Extract Domain Types
1. Create `domains/orders/types/order.ts` with just `Order` interface
2. Move `OrderService`, `CommodityType` to `domains/orders/types/constants.ts`
3. Move filter types to `domains/orders/types/filters.ts`
4. Update imports across codebase

### Phase 4: Move Components
1. Move order-specific field components to `domains/orders/components/fields/`
2. Keep generic fields in `components/ui/fields/`
3. Move `OrderGrid` to `domains/orders/components/`

### Phase 5: Rename "admin" to "ui"
1. Simple rename - won't break anything if done carefully
2. Update imports

---

## Summary of Changes

| Issue | Current | Recommended |
|-------|---------|-------------|
| Types | `/src/types/` (centralized, mixed concerns) | `/src/domains/*/types/` (domain-specific, separated) |
| Generic UI | `/src/components/admin/` (misleading name) | `/src/components/ui/` (clear purpose) |
| Order-specific fields | `/src/components/admin/fields/` | `/src/domains/orders/components/fields/` |
| Document component | `/src/components/orders/` | `/src/domains/documents/components/` |
| Services | `/src/services/` (scattered) | `/src/domains/*/services/` (co-located) |
| Pages | `/src/pages/orders/` | `/src/pages/orders/` (stays same) |

---

## Expected Outcomes

**Before refactoring:**
```
New developer asks: "Where do I put the order filter form?"
Answer: "Umm... check /components/features/orders/ or /components/admin/filters/, 
         then connect it to /services/apiServices.ts 
         and types from /types/order.ts"
         Takes 30 minutes to understand the structure.
```

**After refactoring:**
```
New developer asks: "Where do I put the order filter form?"
Answer: "/src/domains/orders/components/ - everything order-related is there,
         types in /types/, services in /services/, hooks in /hooks/"
         Takes 5 minutes.
```

