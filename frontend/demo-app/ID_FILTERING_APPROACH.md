# Reference Data Fetching - ID-Based Filtering

## Overview

The reference data hooks have been updated to support **ID-based filtering** instead of caching. This approach fetches only the specific records needed for the current grid data.

## How It Works

### For Grids (ID-Based Filtering)

When rendering a grid with 100 orders:

```tsx
const OrderGrid = ({ orders }) => {
  // This hook automatically:
  // 1. Collects all unique IDs from the orders
  // 2. Fetches ONLY those specific records
  // 3. Returns lookup functions
  const { getDriver, getTruck, getTrailer, loading } = useReferenceDataForGrid(orders);
  
  return (
    <Datagrid data={orders} loading={loading}>
      <ReferenceDriverFieldOptimized getDriver={getDriver} />
      <ReferenceVehicleFieldOptimized getTruck={getTruck} getTrailer={getTrailer} />
    </Datagrid>
  );
};
```

### What Happens Behind the Scenes

1. **ID Collection**: The hook extracts all driver/truck/trailer IDs from the orders
   ```javascript
   driverIds = ['id1', 'id2', 'id3', 'id4']  // From 100 orders
   ```

2. **API Request with Filter**: Makes a request like:
   ```
   GET /api/v1/drivers?ids=id1,id2,id3,id4
   ```

3. **Lookup Map Creation**: Creates a Map for O(1) lookups
   ```javascript
   driverMap = {
     'id1': { id: 'id1', name: 'John Doe', ... },
     'id2': { id: 'id2', name: 'Jane Smith', ... },
     ...
   }
   ```

4. **Field Rendering**: Each field uses the lookup function
   ```javascript
   const driver = getDriver(row.driver_id);  // Instant lookup, no API call
   ```

## Benefits

### ✅ Only Fetches What's Needed
If your grid shows 100 orders but they only reference 10 unique drivers:
- **Old approach**: Fetches ALL drivers (could be 1000+)
- **New approach**: Fetches only those 10 drivers

### ✅ No Stale Data
- No caching means always fresh data
- Each grid render fetches current IDs
- Perfect for dynamic data

### ✅ Automatic Optimization
The hook handles:
- ID deduplication (100 orders → 10 unique IDs)
- Empty array handling (no IDs = no request)
- Loading states
- Error handling

## API Contract

Your backend must support filtering by comma-separated IDs:

```
GET /api/v1/drivers?ids=uuid1,uuid2,uuid3
GET /api/v1/terminals?ids=uuid1,uuid2
GET /api/v1/trucks?ids=uuid1,uuid2,uuid3
GET /api/v1/trailers?ids=uuid1,uuid2
```

Response:
```json
[
  { "id": "uuid1", "name": "John Doe", "phone": "+123456" },
  { "id": "uuid2", "name": "Jane Smith", "phone": "+789012" },
  ...
]
```

## Hooks Available

### For Grids (ID-Based)

```typescript
// Main hook - automatically handles everything
useReferenceDataForGrid(records: any[])

// Individual resource hooks (if you need specific control)
useDriversByIds(ids: string[])
useTerminalsByIds(ids: string[])
useTrucksByIds(ids: string[])
useTrailersByIds(ids: string[])
```

### For Forms (Fetch All)

```typescript
// These fetch ALL records for dropdowns/selects
useDrivers()    // Fetches all drivers
useTerminals()  // Fetches all terminals
useTrucks()     // Fetches all trucks
useTrailers()   // Fetches all trailers
```

### For Single Item Lookup

```typescript
// These fetch all and filter client-side (good for small datasets)
useDriver(id: string)      // Returns single driver
useTerminal(id: string)    // Returns single terminal
useTruck(id: string)       // Returns single truck
useTrailer(id: string)     // Returns single trailer
```

## Example: Grid with 100 Orders

### Scenario
- 100 orders displayed
- Each order has: eta_driver_id, etd_driver_id, eta_truck_id, etd_truck_id, eta_trailer_id, etd_trailer_id, terminal_id
- But only 15 unique drivers, 8 unique trucks, 5 unique trailers, 3 unique terminals

### API Calls Made

```
GET /drivers?ids=d1,d2,d3,...,d15          // 15 drivers
GET /trucks?ids=t1,t2,t3,...,t8            // 8 trucks
GET /trailers?ids=tr1,tr2,...,tr5          // 5 trailers
GET /terminals?ids=tm1,tm2,tm3             // 3 terminals
```

**Total: 4 API calls fetching 31 total records**

### Old Approach Would Have Been

```
GET /drivers      // ALL drivers (could be 500+)
GET /trucks       // ALL trucks (could be 200+)
GET /trailers     // ALL trailers (could be 150+)
GET /terminals    // ALL terminals (could be 20+)
```

**Total: 4 API calls fetching 870+ records**

## Performance Comparison

| Metric | Old (Fetch All + Cache) | New (ID Filter) |
|--------|-------------------------|-----------------|
| Records fetched for 100 orders | 870+ | 31 |
| Network payload | ~300KB | ~10KB |
| Memory usage | High (caching all) | Low (only needed) |
| Stale data risk | Yes (5min cache) | No |
| Pagination support | Must fetch all pages | Only visible IDs |

## Migration Notes

### No Code Changes Needed in Components!

Your grid components don't need to change. The optimized fields work the same way:

```tsx
// Still works exactly the same
<ReferenceDriverFieldOptimized getDriver={getDriver} />
```

### What Changed

1. **useReferenceDataMany() behavior**:
   - Before: Fetched all data, returned lookups
   - Now: Accepts records, extracts IDs, fetches filtered data

2. **No more caching**:
   - Before: Global cache with 5-minute TTL
   - Now: Fresh fetch on each grid render (only needed IDs)

3. **Backend requirement**:
   - Must support `filter` parameter with ID array

## Testing the Implementation

1. Open DevTools → Network tab
2. Load a grid with orders
3. Look for API calls to `/drivers`, `/trucks`, etc.
3. Check the `ids` parameter in the URL
5. Verify only needed IDs are fetched

Example request you should see:
```
/api/v1/drivers?ids=uuid1,uuid2,uuid3
```

## Summary

✅ **Efficient**: Only fetches records actually needed  
✅ **Fresh**: No caching, always current data  
✅ **Automatic**: Hook handles ID collection  
✅ **Fast**: Fewer records = faster response  
✅ **Scalable**: Works with any grid size  
