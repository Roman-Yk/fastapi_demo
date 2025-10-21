# Domain-Driven Architecture Violations Report

## Summary
The frontend codebase has several domain-specific hooks, utilities, and components mixed into shared/root-level folders that should be moved into their respective domain directories.

---

## 1. HOOKS VIOLATIONS

### Current Location: `/src/hooks/`

#### Violation 1.1: useReferenceData.ts
**Current Path:** `/src/hooks/useReferenceData.ts`
**Domain:** Cross-domain (references: Drivers, Terminals, Vehicles)
**Issue:** Contains multiple domain-specific hooks that fetch reference data

**Specific Hooks to Move:**
- `useDrivers()` → Drivers domain
- `useDriver(driverId)` → Drivers domain
- `useTerminals()` → Terminals domain
- `useTerminal(terminalId)` → Terminals domain
- `useTrucks()` → Vehicles domain
- `useTruck(truckId)` → Vehicles domain
- `useTrailers()` → Vehicles domain
- `useTrailer(trailerId)` → Vehicles domain
- `useDriversByIds(ids)` → Drivers domain
- `useTerminalsByIds(ids)` → Terminals domain
- `useTrucksByIds(ids)` → Vehicles domain
- `useTrailersByIds(ids)` → Vehicles domain

**Action Required:** 
- Break into domain-specific hook files
- Move `useDriver(s)` hooks to `/src/domains/drivers/hooks/useDriver.ts`
- Move `useTerminal(s)` hooks to `/src/domains/terminals/hooks/useTerminal.ts`
- Move `useTruck(s)` and `useTrailer(s)` hooks to `/src/domains/vehicles/hooks/useVehicles.ts`

---

#### Violation 1.2: useReferenceDataMany.ts
**Current Path:** `/src/hooks/useReferenceDataMany.ts`
**Domain:** Orders (specifically used for grid rendering in orders context)
**Issue:** Hook for fetching multiple reference data records by IDs, tightly coupled to orders domain

**Specific Hooks:**
- `useReferenceDataForGrid(records)` → Orders domain

**Action Required:**
- Move to `/src/domains/orders/hooks/useReferenceDataForGrid.ts`
- Update import path throughout orders components

---

#### Violation 1.3: useFormData.ts
**Current Path:** `/src/hooks/useFormData.ts`
**Domain:** Generic form utility, but has ORDER_FORM_CONFIG coupling
**Issue:** Generic hook but used primarily for forms across domains

**Note:** This hook is generic and can stay in `/src/hooks/` BUT should not have domain-specific config exports

**Action Required:**
- Remove ORDER_FORM_CONFIG from this file if present
- Move domain-specific form configs to respective domains
- Keep generic useFormData hook as shared utility

---

### Shared Hooks (Stay in `/src/hooks/`)
These are truly generic and should remain:
- `useFormData.ts` (generic form management)
- `useFormContext.tsx` (generic context provider)
- `useFormValidation.ts` (generic validation with Zod)
- `useApi.ts` (generic API calls)
- `useFilteredData.ts` (generic data filtering)

---

## 2. UTILITIES VIOLATIONS

### Current Location: `/src/utils/`

#### Violation 2.1: mockData.ts
**Current Path:** `/src/utils/mockData.ts`
**Domain:** Orders
**Issue:** Contains mock order data and filtering logic specific to orders domain

**Specific Content to Move:**
- `mockOrders[]` array → Orders mock data
- `filterOrders()` function → Orders filtering logic
- `getDateRange()` helper → Orders utility
- Date/time/order-specific helper functions → Orders utilities

**Action Required:**
- Create `/src/domains/orders/utils/mockData.ts`
- Move order-specific mock data and utilities there
- Update imports in order-related components

---

#### Violation 2.2: formTransform.ts
**Current Path:** `/src/utils/formTransform.ts`
**Domain:** Orders (has ORDER_FORM_CONFIG and ORDER_DATE_FIELDS)
**Issue:** Contains order-specific transformation configuration

**Specific Content to Move:**
- `ORDER_FORM_CONFIG` → Orders domain
- `ORDER_DATE_FIELDS` constant → Orders domain
- Order-specific transformation logic → Orders domain

**Action Required:**
- Keep generic `transformFormData()` and `populateFormFromApi()` functions in `/src/utils/`
- Move ORDER-specific config to `/src/domains/orders/utils/formTransform.ts`
- Update imports in order forms

---

#### Violation 2.3: config.ts
**Current Path:** `/src/utils/config.ts`
**Status:** OKAY - This is truly shared application configuration
**Note:** No violations here; keep as-is

---

## 3. COMPONENTS VIOLATIONS

### Current Location: `/src/components/`

#### Violation 3.1: AppRoutes.tsx
**Current Path:** `/src/components/common/AppRoutes.tsx`
**Domain:** Orders (hardcoded only orders routes)
**Issue:** Routes component imports and renders only orders pages

**Current Routes:**
- `/orders`
- `/orders/create`
- `/orders/:orderId/edit`

**Action Required:**
- This component should be routing-agnostic or moved to a more appropriate location
- Either:
  - Move to `/src/pages/AppRoutes.tsx` or
  - Make it configurable to support multiple domain routes
  - Move to `/src/domains/orders/pages/AppRoutes.tsx` if orders-only
- Consider creating a shared routing module that supports domain registration

---

#### Violation 3.2: DataLoader.tsx
**Current Path:** `/src/components/common/DataLoader.tsx`
**Status:** OKAY - Generic loading/error/empty state component
**Note:** This is a truly shared UI component; no violations

---

#### Violation 3.3: ActionButton.tsx
**Current Path:** `/src/components/common/ActionButton.tsx`
**Status:** OKAY - Generic action button component
**Note:** This is a truly shared UI component; no violations

---

#### Violation 3.4: ErrorBoundary.tsx & ErrorPage.tsx
**Current Path:** `/src/components/common/`
**Status:** OKAY - Generic error handling components
**Note:** These are truly shared UI components; no violations

---

## 4. SERVICES VIOLATIONS

### Current Location: `/src/services/`

#### Violation 4.1: apiService.ts
**Current Path:** `/src/services/apiService.ts`
**Domain:** Cross-domain monolithic service
**Issue:** Contains all API operations for all domains in one file

**Content Breakdown:**
- Order CRUD operations → `/src/domains/orders/api/`
- Driver CRUD operations → `/src/domains/drivers/api/`
- Terminal CRUD operations → `/src/domains/terminals/api/`
- Truck/Trailer CRUD operations → `/src/domains/vehicles/api/`
- Order Document operations → `/src/domains/orders/api/`

**Action Required:**
- Delete this file (already replaced by domain-specific services)
- Confirm all domain-specific services exist:
  - `/src/domains/orders/api/orderService.ts`
  - `/src/domains/drivers/api/driverService.ts`
  - `/src/domains/terminals/api/terminalService.ts`
  - `/src/domains/vehicles/api/truckService.ts`
  - `/src/domains/vehicles/api/trailerService.ts`
  - `/src/domains/orders/api/orderDocumentService.ts`

---

#### Violation 4.2: apiServices.ts
**Current Path:** `/src/services/apiServices.ts`
**Status:** PARTIAL VIOLATION (backwards compatibility layer)
**Issue:** Contains re-exports of domain services for backwards compatibility

**Action Required:**
- Keep as backwards compatibility layer during migration
- Eventually deprecate and remove
- Update all imports to use domain-specific services directly
- Add deprecation comments

---

#### Violation 4.3: baseApiService.ts
**Current Path:** `/src/services/baseApiService.ts`
**Status:** OKAY - Generic base service
**Note:** This is a truly shared utility; no violations

---

## 5. TYPES VIOLATIONS

### Current Location: Missing `/src/types/` directory
**Status:** OKAY - No shared types folder needed
**Note:** Each domain maintains its own types in `/src/domains/<domain>/types/`

---

## 6. VALIDATION VIOLATIONS

### Current Location: `/src/validation/` (empty directory)
**Status:** VIOLATION - Validation should be in domains
**Issue:** Empty but implies cross-domain validation location

**Action Required:**
- Remove empty `/src/validation/` directory
- Ensure order validation exists in `/src/domains/orders/validation/`
- Move any cross-domain validation to `/src/shared/`

---

## Migration Priority

### HIGH PRIORITY (Must Fix)
1. Move domain-specific hooks from `/src/hooks/` to respective domains
2. Move ORDER-specific utilities from `/src/utils/` to orders domain
3. Deprecate/remove `/src/services/apiService.ts`
4. Clean up empty `/src/validation/` directory

### MEDIUM PRIORITY (Should Fix)
1. Relocate or reconfigure AppRoutes.tsx
2. Update formTransform config separation

### LOW PRIORITY (Nice to Have)
1. Additional documentation of shared vs domain-specific separation
2. Linting rules to enforce domain boundaries

---

## Target Structure After Migration

```
src/
├── hooks/                          # Shared hooks only
│   ├── useApi.ts
│   ├── useFormData.ts
│   ├── useFormContext.tsx
│   ├── useFormValidation.ts
│   ├── useFilteredData.ts
│   └── index.ts
├── utils/                          # Shared utilities only
│   ├── config.ts
│   ├── formTransform.ts           # Generic only
│   └── index.ts
├── components/
│   ├── common/                    # Truly shared components
│   │   ├── DataLoader.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorPage.tsx
│   │   ├── ActionButton.tsx
│   │   └── index.ts
│   ├── layout/
│   ├── ui/
│   └── index.ts
├── services/
│   ├── baseApiService.ts          # Keep generic base only
│   └── apiServices.ts             # Deprecate
├── shared/                        # Truly shared
│   ├── components/
│   ├── types/
│   └── constants.ts
├── domains/
│   ├── orders/
│   │   ├── hooks/                 # Domain-specific hooks
│   │   │   ├── useReferenceDataForGrid.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── mockData.ts
│   │   │   ├── formTransform.ts
│   │   │   └── index.ts
│   │   ├── validation/
│   │   ├── types/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── index.ts
│   ├── drivers/
│   │   ├── hooks/                 # Domain-specific hooks
│   │   │   ├── useDriver.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   ├── api/
│   │   └── index.ts
│   ├── terminals/
│   │   ├── hooks/                 # Domain-specific hooks
│   │   │   ├── useTerminal.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   ├── api/
│   │   └── index.ts
│   ├── vehicles/
│   │   ├── hooks/                 # Domain-specific hooks
│   │   │   ├── useVehicles.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   ├── api/
│   │   └── index.ts
└── pages/                         # App-level pages (or routing config)
    └── AppRoutes.tsx
```

---

## Summary of Changes Required

| File | Current Location | Target Location | Action |
|------|-----------------|-----------------|--------|
| useReferenceData.ts | `/src/hooks/` | Domain-specific | Split & move |
| useReferenceDataMany.ts | `/src/hooks/` | `/src/domains/orders/hooks/` | Move |
| mockData.ts | `/src/utils/` | `/src/domains/orders/utils/` | Move |
| formTransform.ts | `/src/utils/` | Split across locations | Extract domain-specific configs |
| apiService.ts | `/src/services/` | DELETE | Remove (replaced by domain services) |
| AppRoutes.tsx | `/src/components/common/` | Relocate/Reconfigure | Move to pages or make routing-agnostic |
| validation/ | `/src/` | DELETE | Remove empty directory |

