# Domain-Driven Architecture Violations - Quick Reference

## At a Glance: 7 Violations Found

### Violations by Category

#### 1. HOOKS (2 violations - HIGH PRIORITY)

| File | Current | Target | Status |
|------|---------|--------|--------|
| `useReferenceData.ts` | `/src/hooks/` | 3 domain-specific files | SPLIT |
| `useReferenceDataMany.ts` | `/src/hooks/` | `/src/domains/orders/hooks/` | MOVE |

**Details:**
- `useReferenceData.ts` contains 12 functions for 4 different domains
  - 4 driver hooks → `/src/domains/drivers/hooks/useDriver.ts`
  - 4 terminal hooks → `/src/domains/terminals/hooks/useTerminal.ts`
  - 4 vehicle hooks → `/src/domains/vehicles/hooks/useVehicles.ts`
- `useReferenceDataMany.ts` is orders-only → Move to orders domain hooks

---

#### 2. UTILITIES (2 violations)

| File | Current | Target | Issue | Priority |
|------|---------|--------|-------|----------|
| `mockData.ts` | `/src/utils/` | `/src/domains/orders/utils/` | Orders-specific | HIGH |
| `formTransform.ts` | `/src/utils/` | Extract configs | ORDER_* configs | MEDIUM |

**Details:**
- `mockData.ts`: Move entire file (mock orders + filter logic)
- `formTransform.ts`: Extract `ORDER_FORM_CONFIG` and `ORDER_DATE_FIELDS` only

---

#### 3. COMPONENTS (1 violation - MEDIUM PRIORITY)

| File | Current | Target | Issue |
|------|---------|--------|-------|
| `AppRoutes.tsx` | `/src/components/common/` | `/src/pages/` | Orders-specific routes |

**Details:** Hardcoded orders routes should be at app level, not in components

---

#### 4. SERVICES (1+ violations - HIGH PRIORITY)

| File | Current | Action | Reason |
|------|---------|--------|--------|
| `apiService.ts` | `/src/services/` | DELETE | Already replaced by domain services |
| `apiServices.ts` | `/src/services/` | Keep (deprecate) | Backwards compatibility layer |

---

#### 5. VALIDATION (1 violation - LOW PRIORITY)

| Item | Current | Action |
|------|---------|--------|
| `/src/validation/` | Empty directory | DELETE |

---

#### 6. TYPES (0 violations)

✓ No shared types folder - correct per DDA

---

## Migration Checklist

### Phase 1: High Priority (2-3 hours)

- [ ] Split `useReferenceData.ts`:
  - [ ] Create `/src/domains/drivers/hooks/useDriver.ts` with driver functions
  - [ ] Create `/src/domains/terminals/hooks/useTerminal.ts` with terminal functions
  - [ ] Create `/src/domains/vehicles/hooks/useVehicles.ts` with vehicle functions
  - [ ] Delete original `/src/hooks/useReferenceData.ts`
  - [ ] Update `/src/hooks/index.ts` exports

- [ ] Move `useReferenceDataMany.ts`:
  - [ ] Create `/src/domains/orders/hooks/useReferenceDataForGrid.ts`
  - [ ] Delete original `/src/hooks/useReferenceDataMany.ts`
  - [ ] Update imports in order components

- [ ] Move `mockData.ts`:
  - [ ] Create `/src/domains/orders/utils/mockData.ts`
  - [ ] Delete original `/src/utils/mockData.ts`
  - [ ] Update imports in order components

- [ ] Delete `apiService.ts`:
  - [ ] Verify all domain services exist
  - [ ] Delete `/src/services/apiService.ts`

- [ ] Clean up validation:
  - [ ] Delete `/src/validation/` directory

### Phase 2: Medium Priority (1-2 hours)

- [ ] Extract formTransform configs:
  - [ ] Create `/src/domains/orders/utils/formTransform.ts`
  - [ ] Move `ORDER_FORM_CONFIG` and `ORDER_DATE_FIELDS` there
  - [ ] Keep generic functions in `/src/utils/formTransform.ts`
  - [ ] Update imports in order forms

- [ ] Relocate AppRoutes:
  - [ ] Move `/src/components/common/AppRoutes.tsx` to `/src/pages/AppRoutes.tsx`
  - [ ] Update imports in main app

### Phase 3: Low Priority (optional)

- [ ] Add deprecation notice to `apiServices.ts`
- [ ] Document domain boundaries
- [ ] Add linting rules (ESLint)

---

## Files to Import After Migration

### Before
```typescript
import { useDriver, useDrivers } from '../hooks';
import { useReferenceDataForGrid } from '../hooks';
import { mockOrders, filterOrders } from '../utils/mockData';
import { ORDER_FORM_CONFIG } from '../utils/formTransform';
import { AppRoutes } from '../components/common';
```

### After
```typescript
import { useDriver, useDrivers } from '../domains/drivers/hooks';
import { useReferenceDataForGrid } from '../domains/orders/hooks';
import { mockOrders, filterOrders } from '../domains/orders/utils/mockData';
import { ORDER_FORM_CONFIG } from '../domains/orders/utils/formTransform';
import { AppRoutes } from '../pages';
```

---

## Impact Summary

- **Total Files to Move/Modify**: 7
- **Breaking Changes**: None (imports only)
- **Domains Affected**: Orders, Drivers, Terminals, Vehicles
- **Estimated Time**: 3-5 hours total
- **Risk Level**: LOW

---

## Files to Create

1. `/src/domains/drivers/hooks/useDriver.ts` (8 functions)
2. `/src/domains/terminals/hooks/useTerminal.ts` (4 functions)
3. `/src/domains/vehicles/hooks/useVehicles.ts` (8 functions)
4. `/src/domains/orders/hooks/useReferenceDataForGrid.ts` (moved from hooks)
5. `/src/domains/orders/utils/formTransform.ts` (extracted configs)

---

## Files to Update

1. `/src/hooks/index.ts` - Remove moved hooks
2. `/src/domains/orders/index.ts` - Export new hooks/utils
3. `/src/domains/drivers/index.ts` - Export new hooks
4. `/src/domains/terminals/index.ts` - Export new hooks
5. `/src/domains/vehicles/index.ts` - Export new hooks
6. All components importing removed items

---

## Verification

After migration, run:
```bash
# Find any remaining incorrect imports
grep -r "from.*hooks.*useDriver" src/
grep -r "from.*utils.*mockData" src/
grep -r "from.*formTransform.*ORDER" src/

# Should find only domain-specific imports
```

---

## References

- Full Report: `DDA_VIOLATIONS_REPORT.md`
- Quick Summary: `DDA_VIOLATIONS_SUMMARY.txt`
- This File: `DDA_VIOLATIONS_QUICK_REFERENCE.md`

