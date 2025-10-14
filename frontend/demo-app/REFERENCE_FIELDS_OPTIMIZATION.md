# Reference Fields Optimization Guide

## Overview

This project implements a **react-admin inspired** optimization pattern for reference fields. There are two types of reference field components optimized for different use cases:

1. **Form Fields** - For forms/inputs (requests data per field as needed)
2. **Grid Fields** - For data grids with many rows (batches all requests)

---

## Form Fields (Input Components)

### Location
`src/components/admin/forms/`

### Components
- `DriverReferenceField.tsx`
- `TerminalReferenceField.tsx`
- `TruckReferenceField.tsx`
- `TrailerReferenceField.tsx`

### Use Case
Use these in **forms** where users need to select reference data from dropdowns.

### How It Works
1. Each field fetches its own resource data using `useDrivers()`, `useTerminals()`, etc.
2. Data is **globally cached** for 5 minutes
3. Multiple fields of the same type **share the cache** (no duplicate requests)
4. Perfect for forms where you need dropdown options

### Example Usage

```tsx
import { DriverReferenceField, TruckReferenceField } from '@/components/admin/forms';

function OrderForm() {
  return (
    <FormProvider initialData={{}}>
      <DriverReferenceField
        label="Driver"
        source="driver_id"
        placeholder="Select driver"
        required
      />
      
      <TruckReferenceField
        label="Truck"
        source="truck_id"
        placeholder="Select truck"
      />
    </FormProvider>
  );
}
```

### Key Features
✅ Automatic caching (5 minutes)
✅ Automatic ID conversion (string → number)
✅ Loading states
✅ Error handling
✅ Type-safe with generics

---

## Grid Fields (Display Components)

### Location
`src/components/admin/fields/`

### Components
- `ReferenceDriverFieldOptimized.tsx`
- `ReferenceVehicleFieldOptimized.tsx`

### Use Case
Use these in **data grids** with many rows (e.g., 100+ orders).

### The Problem
If you have 100 orders in a grid and each row calls `useDriver(id)`, you would:
- Create 100 React hook calls
- Even with caching, cause unnecessary re-renders
- Waste memory with 100 separate subscriptions

### The Solution
**Batch fetch at the grid level**, then pass lookup functions to fields.

### How It Works

```
┌─────────────────────────────────────────────────┐
│  OrderGrid Component                            │
│  ┌───────────────────────────────────────────┐  │
│  │ useReferenceDataMany()                   │  │
│  │ - Fetches ALL drivers once               │  │
│  │ - Fetches ALL trucks once                │  │
│  │ - Fetches ALL trailers once              │  │
│  │ - Returns lookup functions               │  │
│  └───────────────────────────────────────────┘  │
│                     │                            │
│                     ▼                            │
│  ┌─────────────────────────────────────────┐    │
│  │  For each row (100 times):              │    │
│  │  ReferenceDriverFieldOptimized          │    │
│  │  - Receives getDriver function          │    │
│  │  - Instant lookup (no API call!)        │    │
│  │  - No loading state needed              │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘

Result: 3 API calls total instead of 300!
```

### Example Usage

```tsx
import { useReferenceDataMany } from '@/hooks/useReferenceDataMany';
import { ReferenceDriverFieldOptimized } from '@/components/admin/fields';

function OrderGrid({ orders }) {
  // Fetch all reference data ONCE for the entire grid
  const { getDriver, getTruck, getTrailer, loading } = useReferenceDataMany();
  
  return (
    <Datagrid data={orders} loading={loading}>
      <TextField source="reference" label="Reference" />
      
      {/* Optimized field - receives lookup function */}
      <ReferenceDriverFieldOptimized
        source="eta_driver"
        label="ETA Driver"
        prefix="eta"
        getDriver={getDriver}  {/* ← Lookup function */}
      />
      
      <ReferenceVehicleFieldOptimized
        source="eta_vehicle"
        label="ETA Vehicle"
        prefix="eta"
        getTruck={getTruck}      {/* ← Lookup functions */}
        getTrailer={getTrailer}
      />
    </Datagrid>
  );
}
```

### Performance Benefits

| Scenario | Without Optimization | With Optimization |
|----------|---------------------|-------------------|
| 100 orders, 4 reference fields each | 400 API calls* | 4 API calls |
| Component re-renders | High (400 subscriptions) | Low (4 subscriptions) |
| Memory usage | 400 hook instances | 4 hook instances |
| Initial load time | Slow | Fast |

*Even with caching, without optimization you create 400 hook instances

---

## Architecture

### Hook Structure

```
useReferenceData.ts (Base hooks)
├── useDrivers()     ← Fetches all drivers with caching
├── useTerminals()   ← Fetches all terminals with caching
├── useTrucks()      ← Fetches all trucks with caching
└── useTrailers()    ← Fetches all trailers with caching

useReferenceDataMany.ts (Grid optimization)
├── useDriversMany()     ← Creates Map lookup for drivers
├── useTerminalsMany()   ← Creates Map lookup for terminals
├── useTrucksMany()      ← Creates Map lookup for trucks
├── useTrailersMany()    ← Creates Map lookup for trailers
└── useReferenceDataMany() ← Convenience hook for all resources
```

### Caching Strategy

1. **Global cache object** - Shared across all components
2. **5-minute TTL** - Data stays fresh, auto-refreshes after expiry
3. **Subscriber pattern** - Components subscribe to cache updates
4. **Stale-while-revalidate** - Shows old data while fetching new
5. **Deduplication** - Multiple requests = one API call

### Data Flow

```
Form Component                Grid Component
      │                            │
      ▼                            ▼
useDrivers()              useDriversMany()
      │                            │
      └────────┬───────────────────┘
               ▼
       Global Cache
               │
      ┌────────┴────────┐
      ▼                 ▼
   5min fresh?        API Call
   return cache      update cache
```

---

## Best Practices

### ✅ DO

**In Forms:**
```tsx
// Direct hook usage - automatic caching
<DriverReferenceField source="driver_id" label="Driver" />
```

**In Grids:**
```tsx
// Batch fetch at grid level
const { getDriver } = useReferenceDataMany();
<ReferenceDriverFieldOptimized getDriver={getDriver} />
```

### ❌ DON'T

**In Grids - Don't do this:**
```tsx
// BAD: Creates 100 hook instances for 100 rows
{orders.map(order => (
  <DriverReferenceField key={order.id} ... />  // ❌
))}
```

**In Forms - Don't do this:**
```tsx
// BAD: Unnecessary complexity in forms
const { getDriver } = useReferenceDataMany();  // ❌
<SomeCustomField getDriver={getDriver} />
```

---

## When to Use What?

| Use Case | Component | Hook |
|----------|-----------|------|
| Form dropdown/select | `DriverReferenceField` | `useDrivers()` |
| Single item display | `ReferenceDriverField` | `useDriver(id)` |
| Grid with 10-100s rows | `ReferenceDriverFieldOptimized` | `useReferenceDataMany()` |
| Grid with <10 rows | Either works | Either works |

---

## API Reference

### useReferenceDataMany()

Returns an object with lookup functions:

```typescript
const {
  getDriver: (id: string) => Driver | null,
  getTerminal: (id: string) => Terminal | null,
  getTruck: (id: string) => Truck | null,
  getTrailer: (id: string) => Trailer | null,
  loading: boolean
} = useReferenceDataMany();
```

### ReferenceDriverFieldOptimized Props

```typescript
interface ReferenceDriverFieldOptimizedProps {
  record: any;                    // The data record
  source?: string;                // Field name (not used in optimized version)
  prefix?: 'eta' | 'etd';        // Field prefix for driver_id
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;             // Show user icon
  showPhone?: boolean;            // Show phone number
  getDriver: (id: string) => Driver | null;  // REQUIRED lookup function
}
```

---

## Migration Guide

### From Old Pattern to New Pattern

**Before:**
```tsx
import { ReferenceDataProvider } from '@/context/ReferenceDataContext';
import { ReferenceDriverField } from '@/components/admin/fields';

function OrderGrid({ orders }) {
  return (
    <ReferenceDataProvider>  {/* Fetches ALL resources */}
      <Datagrid data={orders}>
        {orders.map(order => (
          <ReferenceDriverField record={order} />  {/* Each row hooks into context */}
        ))}
      </Datagrid>
    </ReferenceDataProvider>
  );
}
```

**After:**
```tsx
import { useReferenceDataMany } from '@/hooks/useReferenceDataMany';
import { ReferenceDriverFieldOptimized } from '@/components/admin/fields';

function OrderGrid({ orders }) {
  const { getDriver, loading } = useReferenceDataMany();  // Batch fetch
  
  return (
    <Datagrid data={orders} loading={loading}>
      {/* Fields receive lookup function - no individual hooks */}
      <ReferenceDriverFieldOptimized getDriver={getDriver} />
    </Datagrid>
  );
}
```

---

## Performance Monitoring

To verify the optimization is working:

1. Open DevTools Network tab
2. Load a grid with 100 orders
3. Look for API calls to `/drivers`, `/trucks`, etc.
4. **Should see**: 4 calls total (one per resource type)
5. **Should NOT see**: 100+ calls

---

## Future Improvements

Potential enhancements:

- [ ] Add request deduplication at API level
- [ ] Implement pagination for large reference datasets
- [ ] Add cache preloading on app startup
- [ ] Smarter cache invalidation (on mutations)
- [ ] Optional infinite cache (until manual invalidation)
- [ ] GraphQL-style field selection to fetch only needed fields

---

## Summary

This optimization follows the **react-admin pattern**:

1. **Form fields** - Self-contained, automatic caching
2. **Grid fields** - Batch data at parent level, pass lookups down
3. **Global cache** - Shared across all components
4. **Type-safe** - Full TypeScript support
5. **Performance** - Scales to 100s of rows efficiently

The key insight: **In grids, batch fetch at the top, lookup at the bottom**. This prevents the "N+1 problem" while maintaining clean component APIs.
