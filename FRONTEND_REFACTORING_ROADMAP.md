# Frontend Refactoring Roadmap

## Visual: Current vs Proposed Structure

### CURRENT STATE (Problems)
```
src/
├── types/                          ❌ Centralized, mixed concerns
│   ├── common.ts
│   ├── order.ts                   (Has: Order + OrderService + DateFilterOption + UI labels)
│   ├── driver.ts
│   ├── terminal.ts
│   ├── vehicle.ts
│   ├── document.ts                (OrderDocumentType enum here)
│   └── index.ts
├── components/
│   ├── admin/                     ❌ Misleading name (generic + specific mixed)
│   │   ├── List.tsx              (✓ Generic)
│   │   ├── datagrid/
│   │   │   ├── Datagrid.tsx      (✓ Generic)
│   │   │   └── DatagridToolbar.tsx (✓ Generic)
│   │   ├── fields/
│   │   │   ├── TextField.tsx     (✓ Generic)
│   │   │   ├── BadgeField.tsx    (✓ Generic)
│   │   │   ├── ActionField.tsx   (✓ Generic)
│   │   │   ├── PriorityField.tsx          ❌ Order-specific!
│   │   │   ├── ReferenceDriverField.tsx   ❌ Order-specific!
│   │   │   ├── ReferenceVehicleField.tsx  ❌ Order-specific!
│   │   │   └── index.ts
│   │   ├── filters/
│   │   │   ├── Filter.tsx        (✓ Generic)
│   │   │   ├── DateRangeFilter.tsx (✓ Generic)
│   │   │   └── ... (all ✓ generic)
│   │   └── forms/
│   │       ├── Form.tsx          (✓ Generic)
│   │       ├── DriverReferenceField.tsx   ❌ Order-specific!
│   │       ├── TerminalReferenceField.tsx ❌ Order-specific!
│   │       └── ...
│   ├── orders/                    ❌ Incomplete
│   │   └── OrderDocumentsUpload.tsx (Also defines OrderDocumentType - DUPLICATED!)
│   ├── features/                  ❌ Unclear purpose
│   │   └── orders/
│   │       ├── OrderGrid.tsx
│   │       ├── OrderFiltersForm.tsx
│   │       └── index.ts
│   ├── common/                    (✓ Good)
│   ├── layout/                    (✓ Good)
│   └── index.ts
├── services/                      ❌ Scattered, not discoverable
│   ├── apiService.ts            (Old, not used)
│   ├── baseApiService.ts        (✓ Generic base)
│   ├── apiServices.ts           (✓ Modular approach)
│   └── orderDocumentService.ts  (Why separate?)
├── pages/
│   ├── orders/                  (✓ Good)
│   └── index.ts
├── hooks/                       (✓ Good)
├── utils/                       (✓ Good)
└── shared/                      (✓ Good)
```

### PROPOSED STATE (Improved)
```
src/
├── components/
│   ├── ui/                        ✓ Clear: only generic reusable components
│   │   ├── List.tsx
│   │   ├── datagrid/
│   │   │   ├── Datagrid.tsx
│   │   │   └── DatagridToolbar.tsx
│   │   ├── fields/               (ONLY generic)
│   │   │   ├── TextField.tsx
│   │   │   ├── BadgeField.tsx
│   │   │   ├── ActionField.tsx
│   │   │   ├── DateTimeField.tsx
│   │   │   ├── LinkField.tsx
│   │   │   ├── TooltipField.tsx
│   │   │   └── index.ts
│   │   ├── filters/              (ONLY generic)
│   │   │   ├── Filter.tsx
│   │   │   ├── FilterForm.tsx
│   │   │   ├── ListFilters.tsx
│   │   │   ├── DateRangeFilter.tsx
│   │   │   ├── TextFilter.tsx
│   │   │   ├── SelectFilter.tsx
│   │   │   └── index.ts
│   │   ├── forms/                (ONLY generic)
│   │   │   ├── Form.tsx
│   │   │   ├── FormTextInput.tsx
│   │   │   ├── FormSelectInput.tsx
│   │   │   ├── FormDateInput.tsx
│   │   │   ├── Grid.tsx
│   │   │   ├── GroupGrid.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── common/                   ✓ Shared utilities
│   │   ├── ErrorBoundary.tsx
│   │   ├── DataLoader.tsx
│   │   ├── AppRoutes.tsx
│   │   └── index.ts
│   ├── layout/                   ✓ App shell
│   │   ├── Navbar.tsx
│   │   └── index.ts
│   ├── domains/                  ✓ Feature-specific code grouped by domain
│   │   ├── orders/
│   │   │   ├── types/
│   │   │   │   ├── order.ts      (Order interface ONLY)
│   │   │   │   ├── constants.ts  (OrderService, CommodityType enums)
│   │   │   │   ├── filters.ts    (DateFilterOption, etc.)
│   │   │   │   └── index.ts
│   │   │   ├── components/
│   │   │   │   ├── OrderGrid.tsx
│   │   │   │   ├── OrderFiltersForm.tsx
│   │   │   │   └── index.ts
│   │   │   ├── fields/           (Order-specific fields)
│   │   │   │   ├── PriorityField.tsx
│   │   │   │   ├── ReferenceDriverField.tsx
│   │   │   │   ├── ReferenceDriverFieldOptimized.tsx
│   │   │   │   ├── ReferenceVehicleField.tsx
│   │   │   │   ├── ReferenceVehicleFieldOptimized.tsx
│   │   │   │   └── index.ts
│   │   │   ├── forms/            (Order-specific form fields)
│   │   │   │   ├── DriverReferenceField.tsx
│   │   │   │   ├── TerminalReferenceField.tsx
│   │   │   │   ├── TrailerReferenceField.tsx
│   │   │   │   ├── TruckReferenceField.tsx
│   │   │   │   └── index.ts
│   │   │   ├── services/
│   │   │   │   ├── orderApi.ts
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   └── index.ts
│   │   │   └── index.ts          (Barrel export)
│   │   ├── drivers/
│   │   │   ├── types/
│   │   │   │   ├── driver.ts
│   │   │   │   └── index.ts
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   │   ├── driverApi.ts
│   │   │   │   └── index.ts
│   │   │   └── ...
│   │   ├── vehicles/
│   │   │   ├── types/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   │   ├── truckApi.ts
│   │   │   │   ├── trailerApi.ts
│   │   │   │   └── index.ts
│   │   │   └── ...
│   │   ├── terminals/
│   │   │   ├── types/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   │   ├── terminalApi.ts
│   │   │   │   └── index.ts
│   │   │   └── ...
│   │   ├── documents/
│   │   │   ├── types/
│   │   │   │   ├── document.ts
│   │   │   │   ├── constants.ts  (OrderDocumentType enum)
│   │   │   │   └── index.ts
│   │   │   ├── components/
│   │   │   │   ├── DocumentsUpload.tsx      (moved from /components/orders/)
│   │   │   │   ├── DocumentEditModal.tsx    (extracted subcomponent)
│   │   │   │   ├── PendingDocumentCard.tsx  (extracted subcomponent)
│   │   │   │   └── index.ts
│   │   │   ├── services/
│   │   │   │   ├── documentApi.ts           (replaces orderDocumentService.ts)
│   │   │   │   └── index.ts
│   │   │   └── ...
│   │   └── common/                          (if needed, shared domain logic)
│   │       └── types/
│   │           ├── common.ts
│   │           └── index.ts
│   └── index.ts
├── pages/                        ✓ Page components (layout + domain components)
│   ├── orders/
│   │   ├── OrdersPage.tsx       (Uses: domains/orders/components + ui/*)
│   │   ├── CreateOrderPage.tsx
│   │   ├── EditOrderPage.tsx
│   │   └── index.ts
│   ├── drivers/
│   ├── vehicles/
│   ├── terminals/
│   └── ...
├── shared/                       ✓ App-level shared code
│   └── constants.ts
├── utils/                        ✓ Utilities
└── hooks/                        ✓ App-level hooks
    └── index.ts
```

---

## File Movement Checklist

### Critical (Fixes real bugs):
- [ ] Delete duplicate `OrderDocumentType` enum from `OrderDocumentsUpload.tsx`
- [ ] Import `OrderDocumentType` from `@/domains/documents/types` instead

### Phase 1: Directory Creation (Safe)
- [ ] Create `/src/domains/` structure
- [ ] Create `/src/components/ui/` 

### Phase 2: Service Migration (Low risk)
- [ ] Create `domains/orders/services/orderApi.ts`
- [ ] Create `domains/drivers/services/driverApi.ts`
- [ ] Create `domains/vehicles/services/` (truck + trailer)
- [ ] Create `domains/terminals/services/terminalApi.ts`
- [ ] Create `domains/documents/services/documentApi.ts`
- [ ] Keep `baseApiService.ts` in `/src/services/shared/` for now
- [ ] Update imports in pages
- [ ] Keep compatibility wrapper in old location temporarily

### Phase 3: Type Extraction
- [ ] `domains/orders/types/order.ts` - just `Order` interface
- [ ] `domains/orders/types/constants.ts` - `OrderService`, `CommodityType`
- [ ] `domains/orders/types/filters.ts` - `DateFilterOption`, `LocationFilter`, `StatusFilter`, labels
- [ ] Do same for all domains
- [ ] Move `common` types to `domains/common/types/`
- [ ] Update all imports

### Phase 4: Component Migration
- [ ] Move generic components to `/src/components/ui/`
- [ ] Move order-specific fields from `admin/fields/` to `domains/orders/components/fields/`
- [ ] Move order-specific forms from `admin/forms/` to `domains/orders/components/forms/`
- [ ] Move `OrderDocumentsUpload` from `components/orders/` to `domains/documents/components/`
- [ ] Extract subcomponents from OrderDocumentsUpload
- [ ] Move `OrderGrid`, `OrderFiltersForm` to `domains/orders/components/`

### Phase 5: Cleanup
- [ ] Rename `/src/components/admin/` to `/src/components/ui/`
- [ ] Remove old `apiService.ts` (monolithic)
- [ ] Remove duplicate enum from OrderDocumentsUpload
- [ ] Update all imports across codebase
- [ ] Create barrel exports in each domain
- [ ] Update CLAUDE.md with new structure

---

## Import Examples (Before & After)

### Before (Confusing)
```typescript
// From pages/orders/OrdersPage.tsx
import { OrderFiltersComponent, OrderGrid } from "../../components/features/orders";
import { List } from "../../components/admin";
import { orderApi } from "../../services/apiServices";
import { Order, OrderFilters } from "../../types/order";
import { OrderDocumentType } from "../../types/document";

// From components/orders/OrderDocumentsUpload.tsx
enum OrderDocumentType { T1 = "T1", ... }  // DUPLICATE!
```

### After (Clear)
```typescript
// From pages/orders/OrdersPage.tsx
import { OrderGrid, OrderFiltersForm } from "@/domains/orders/components";
import { List } from "@/components/ui";
import { orderApi } from "@/domains/orders/services";
import { Order } from "@/domains/orders/types";
import { OrderFilters } from "@/domains/orders/types/filters";
import { DocumentsUpload } from "@/domains/documents/components";
import { OrderDocumentType } from "@/domains/documents/types";

// Everything is clear and co-located!
```

---

## Success Criteria

After refactoring, you should be able to:

1. **Find any feature's code in one place**
   ```
   Need to modify orders? → Look in /src/domains/orders/
   ```

2. **Clearly distinguish generic vs specific**
   ```
   Generic UI components? → /src/components/ui/
   Order-specific? → /src/domains/orders/
   ```

3. **No type duplication**
   ```
   OrderDocumentType defined once, imported everywhere
   ```

4. **Discoverable services**
   ```
   Need order service? → /src/domains/orders/services/
   ```

5. **Easy onboarding**
   ```
   New dev: "Where's the order filter form?"
   Answer: "/src/domains/orders/components/ - everything about orders is there"
   ```

---

## Timeline Estimate

| Phase | Tasks | Time | Risk |
|-------|-------|------|------|
| Critical Fix | Remove duplicate enum | 15 min | None |
| Phase 1 | Create directories | 10 min | None |
| Phase 2 | Move services | 2 hours | Low (services are isolated) |
| Phase 3 | Extract types | 2 hours | Medium (many imports) |
| Phase 4 | Move components | 2 hours | High (many imports) |
| Phase 5 | Cleanup & testing | 1 hour | Medium |
| **Total** | | **~7 hours** | |

**Can be done incrementally across 2-3 days without breaking main branch**
