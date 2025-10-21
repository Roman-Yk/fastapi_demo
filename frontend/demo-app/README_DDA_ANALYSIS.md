# Domain-Driven Architecture Violations - Complete Analysis

This directory contains a comprehensive analysis of Domain-Driven Design (DDD) violations in the frontend codebase.

## Quick Start

### For a Quick Overview (5 minutes)
Start with: **`DDA_VIOLATIONS_QUICK_REFERENCE.md`**
- Concise table of all violations
- Migration checklist
- Before/after code examples
- Best for planning the fix

### For Complete Details (15 minutes)
Read: **`DDA_VIOLATIONS_REPORT.md`**
- Detailed analysis of each violation
- Target structure diagram
- Complete migration guide
- Best for understanding the full picture

### For Structured Reference (10 minutes)
Check: **`DDA_VIOLATIONS_SUMMARY.txt`**
- Organized by category
- Action items matrix
- Impact analysis
- Best for implementation reference

---

## Violations Summary

**Total Issues Found: 7**
- HIGH Priority: 5 violations (2-3 hours to fix)
- MEDIUM Priority: 2 violations (1-2 hours to fix)
- LOW Priority: 1 violation (cleanup)

**Domains Affected:** Orders, Drivers, Terminals, Vehicles

**Risk Level:** LOW (refactoring only, no logic changes)

---

## Quick Violation Map

### Hooks (2 violations)
```
❌ /src/hooks/useReferenceData.ts
   └─ Split into 3 domain-specific files (drivers, terminals, vehicles)

❌ /src/hooks/useReferenceDataMany.ts
   └─ Move to /src/domains/orders/hooks/
```

### Utilities (2 violations)
```
❌ /src/utils/mockData.ts
   └─ Move to /src/domains/orders/utils/

❌ /src/utils/formTransform.ts (partial)
   └─ Extract ORDER_* configs to orders domain
   └─ Keep generic functions in /src/utils/
```

### Components (1 violation)
```
❌ /src/components/common/AppRoutes.tsx
   └─ Move to /src/pages/AppRoutes.tsx
```

### Services (1+ violations)
```
❌ /src/services/apiService.ts
   └─ DELETE (replaced by domain-specific services)

⚠️  /src/services/apiServices.ts
   └─ Keep for now (deprecation layer)
```

### Validation (1 violation)
```
❌ /src/validation/
   └─ DELETE empty directory
```

---

## What's Correct

The following are correctly implemented per DDD:

✓ **Hooks:**
- useFormData.ts (generic)
- useFormContext.tsx (generic)
- useFormValidation.ts (generic)
- useApi.ts (generic)
- useFilteredData.ts (generic)

✓ **Utilities:**
- config.ts (shared application config)

✓ **Components:**
- DataLoader.tsx (generic loading state)
- ErrorBoundary.tsx (generic error handling)
- ErrorPage.tsx (generic error page)
- ActionButton.tsx (generic button)

✓ **Services:**
- baseApiService.ts (generic base class)

✓ **Types:**
- No shared /src/types/ folder (correct)
- Each domain maintains own types

✓ **Domain Structure:**
- /src/domains/orders/ - All orders-specific code
- /src/domains/drivers/ - All driver-specific code
- /src/domains/terminals/ - All terminal-specific code
- /src/domains/vehicles/ - All vehicle-specific code

---

## Files to Create

After migration, these new files will exist:

1. `/src/domains/drivers/hooks/useDriver.ts`
2. `/src/domains/terminals/hooks/useTerminal.ts`
3. `/src/domains/vehicles/hooks/useVehicles.ts`
4. `/src/domains/orders/hooks/useReferenceDataForGrid.ts`
5. `/src/domains/orders/utils/formTransform.ts`

---

## Files to Delete

1. `/src/hooks/useReferenceData.ts`
2. `/src/hooks/useReferenceDataMany.ts`
3. `/src/utils/mockData.ts`
4. `/src/services/apiService.ts`
5. `/src/validation/` (empty directory)

---

## Files to Move

1. `/src/components/common/AppRoutes.tsx` → `/src/pages/AppRoutes.tsx`

---

## Migration Phases

### Phase 1: HIGH Priority (2-3 hours)
- [ ] Split useReferenceData.ts into domain hooks
- [ ] Move useReferenceDataMany.ts to orders
- [ ] Move mockData.ts to orders
- [ ] Delete apiService.ts
- [ ] Delete /src/validation/ directory

### Phase 2: MEDIUM Priority (1-2 hours)
- [ ] Extract formTransform configs to orders
- [ ] Move AppRoutes.tsx to pages

### Phase 3: LOW Priority (optional)
- [ ] Deprecate apiServices.ts
- [ ] Add documentation
- [ ] Add linting rules

---

## Recommended Reading Order

1. **START HERE:** `DDA_VIOLATIONS_QUICK_REFERENCE.md`
   - Overview and checklist
   - 5-10 minutes

2. **FOR DETAILS:** `DDA_VIOLATIONS_REPORT.md`
   - Complete analysis
   - 10-15 minutes

3. **FOR REFERENCE:** `DDA_VIOLATIONS_SUMMARY.txt`
   - Structured format
   - Use while implementing

---

## Migration Commands (When Ready)

After reading the reports, use these commands to verify your work:

```bash
# Find any remaining incorrect imports
grep -r "from.*hooks.*useDriver" src/
grep -r "from.*utils.*mockData" src/
grep -r "from.*formTransform.*ORDER" src/
grep -r "from.*components.*AppRoutes" src/

# Check for remaining references to deleted services
grep -r "from.*services.*apiService" src/
```

---

## Key Takeaways

1. **Domain Separation:** Functions and data specific to a domain should live in that domain
2. **Shared Utilities:** Only truly generic utilities belong in root-level folders
3. **Type Isolation:** Each domain manages its own types
4. **Import Organization:** Helps enforce domain boundaries at import time

---

## Questions?

Refer to the detailed reports:
- DDA_VIOLATIONS_QUICK_REFERENCE.md (best for overview)
- DDA_VIOLATIONS_REPORT.md (best for details)
- DDA_VIOLATIONS_SUMMARY.txt (best for structured reference)

---

## Next Steps

1. Review the Quick Reference guide
2. Create the implementation plan
3. Follow the migration checklist
4. Run verification commands
5. Test the application

---

Generated: 2025-10-20
Total Analysis: 7 violations across 3 areas
Estimated Implementation Time: 3-5 hours
Risk Level: LOW
