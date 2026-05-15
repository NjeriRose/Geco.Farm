# Geco Farm — API & Data Layer Documentation

## Architecture

Geco Farm uses **Supabase** as the backend — there is no separate API server. The React frontend communicates directly with Supabase via the `@supabase/supabase-js` client library. Row-Level Security (RLS) policies in PostgreSQL handle authorization.

```
React App → supabase-js → Supabase REST API → PostgreSQL (with RLS)
```

## Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

## Authentication

Handled by `src/contexts/AuthContext.tsx`. Uses Supabase Auth (email/password).

| Method | Description |
|--------|------------|
| `signIn(email, password)` | Email/password login |
| `signUp(email, password, meta)` | Register with full_name, phone, county |
| `signOut()` | Clear session |
| `resetPassword(email)` | Send password reset email |
| `updateProfile(updates)` | Update user profile |

Auth state is available via `useAuth()` hook.

## Data Hooks

All data operations go through custom React hooks in `src/hooks/`. Each hook:
- Auto-fetches data when the active farm changes
- Returns loading state
- Provides CRUD functions that return `{ error: string | null }`
- Auto-refreshes the list after mutations

### Crops

```typescript
// useCropTypes() — Read-only reference data
{ cropTypes: CropType[], loading: boolean }

// usePlantings() — CRUD for crop plantings
{ plantings, loading, createPlanting, updatePlanting, deletePlanting, refresh }

// useHarvests(plantingId?) — Record harvests
{ harvests, loading, recordHarvest, refresh }
```

### Livestock

```typescript
// useLivestockTypes() — Read-only reference data
{ types: LivestockType[], loading }

// useLivestock() — CRUD for animals
{ livestock, loading, createLivestock, updateLivestock, deleteLivestock, refresh }

// useHealthRecords(livestockId?) — Health records
{ records, loading, addHealthRecord, refresh }

// useProduction(livestockId?) — Production records
{ records, loading, addProduction, refresh }
```

### Inventory

```typescript
// useInventoryCategories() — Read-only categories
{ categories, loading }

// useInventory() — CRUD + transactions
{ items, lowStockItems, loading, createItem, updateItem, deleteItem, recordTransaction, refresh }
```

### Financials

```typescript
// useExpenses() — Farm expenses
{ expenses, totalExpenses, loading, createExpense, deleteExpense, refresh }

// useSales() — Revenue tracking
{ sales, totalRevenue, loading, createSale, deleteSale, refresh }
```

### Tasks

```typescript
// useTasks()
{ tasks, pendingTasks, overdueTasks, loading, createTask, updateTask, deleteTask, refresh }
```

### Dashboard

```typescript
// useDashboard() — Aggregated stats
{ stats: DashboardStats, loading, refresh }
```

### Weather

```typescript
// useWeather() — OpenWeather API
{ current: WeatherData, forecast: ForecastData[], loading, error, refresh }
```

## External APIs

### OpenWeather API

Used for farm-location weather data. Requires `VITE_OPENWEATHER_API_KEY` env var.

| Endpoint | Usage |
|----------|-------|
| `/data/2.5/weather` | Current conditions (temp, humidity, wind, rain) |
| `/data/2.5/forecast` | 5-day forecast (aggregated to daily min/max) |

Parameters: `lat`, `lon`, `units=metric`, `appid`.

## Services

### PDF Service (`src/services/pdfService.ts`)

| Function | Output |
|----------|--------|
| `generateFinancialReport(farmName, expenses, sales, dateRange)` | Financial summary PDF with KSh amounts |
| `generateCropReport(farmName, plantings)` | Crop plantings PDF |
| `generateLivestockReport(farmName, livestock)` | Livestock inventory PDF |

All PDFs are branded with "Geco Farm" header in green (#16a34a) and auto-download.

### Export Service (`src/services/exportService.ts`)

```typescript
exportToCSV(data, headers, filename)
```

Generates UTF-8 CSV with BOM for Excel compatibility. Auto-downloads via file-saver.

## Currency Formatting

```typescript
import { formatKES } from './lib/utils';

formatKES(1234.5);  // "KSh 1,234.50"
formatKES(0);       // "KSh 0"
```
