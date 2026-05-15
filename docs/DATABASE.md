# Geco Farm — Database Documentation

## Overview

The database runs on Supabase (PostgreSQL) with Row-Level Security (RLS) for multi-tenant farm isolation. All financial amounts are stored in Kenyan Shillings (KES).

## Entity-Relationship Summary

```
auth.users ──→ profiles (1:1)
auth.users ──→ farms (1:many, via owner_id)
farms ──→ farm_members (1:many) ←── auth.users (many:1)
farms ──→ fields (1:many)
farms ──→ plantings (1:many) ──→ crop_types (many:1)
fields ──→ plantings (1:many)
plantings ──→ harvests (1:many)
farms ──→ livestock (1:many) ──→ livestock_types (many:1)
livestock ──→ livestock_health_records (1:many)
farms ──→ production_records (1:many) ──→ livestock (many:1)
farms ──→ inventory (1:many) ──→ inventory_categories (many:1)
inventory ──→ inventory_transactions (1:many)
farms ──→ expenses (1:many)
farms ──→ sales (1:many)
farms ──→ tasks (1:many) ──→ auth.users (many:1, assigned_to)
farms ──→ activity_log (1:many)
```

## Tables

### 1. profiles
Extends Supabase `auth.users`. Auto-created on signup via trigger.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK, FK → auth.users) | |
| full_name | text | Required |
| phone | text | Kenyan format: +254... |
| role | text | admin, manager, worker, farmer |
| avatar_url | text | |
| county | text | One of 47 Kenyan counties |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 2. farms
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| owner_id | uuid (FK → auth.users) | |
| name | text | e.g., "Kamau Family Farm" |
| county | text | Kenyan county |
| location | text | Specific area/town |
| latitude | double precision | For weather API |
| longitude | double precision | For weather API |
| size_acres | numeric(10,2) | |
| farm_type | text | crop, livestock, mixed, aquaculture |
| description | text | |

### 3. farm_members
Multi-tenant access control. Users can belong to multiple farms.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| farm_id | uuid (FK → farms) | |
| user_id | uuid (FK → auth.users) | |
| role | text | owner, manager, worker |

Unique constraint on (farm_id, user_id).

### 4–7. Crop Tables

**fields**: Farm subdivisions with soil type and irrigation.

**crop_types** (reference): 40+ Kenyan crop varieties with categories (grain, vegetable, fruit, cash_crop, legume, tuber, herb, flower, fodder).

**plantings**: Individual crop plantings linked to a field and crop type. Tracks season (long_rains, short_rains, irrigated, year_round), dates, area, seed costs in KES, and status.

**harvests**: Harvest records with quantity, unit, quality grade (A/B/C/reject).

### 8–11. Livestock Tables

**livestock_types** (reference): 30+ Kenyan breeds across categories (dairy, beef, meat, layers, broilers, indigenous, dual_purpose, aquaculture, apiculture).

**livestock**: Individual animals with tag numbers, acquisition costs in KES, health status, weight.

**livestock_health_records**: Vaccinations, treatments, dewormings, AI, pregnancy checks. Tracks vet name, medicine, dosage, cost in KES.

**production_records**: Daily production (milk in litres, eggs in pieces, honey in kg, etc.).

### 12–14. Inventory Tables

**inventory_categories** (reference): Seeds, Fertilizer, Pesticides, Animal Feed, Equipment, etc.

**inventory**: Stock items with quantity, unit cost in KES, reorder levels, supplier, expiry dates.

**inventory_transactions**: Purchase, usage, adjustment, return, write-off records.

### 15–16. Financial Tables

**expenses**: Farm expenses categorized (labor, seeds, fertilizer, veterinary, etc.). Payment methods include M-Pesa with reference number support.

**sales**: Revenue tracking with item type, buyer details, phone number, payment status (paid, pending, partial, overdue).

All amounts in `_kes` columns (e.g., `amount_kes`, `total_amount_kes`).

### 17. tasks
Farm task management with priority (low–urgent), status tracking, category (planting, harvesting, feeding, milking, etc.), and due dates.

### 18. activity_log
Audit trail. Records action, entity_type, entity_id, and details (JSONB).

## Row-Level Security (RLS)

Every table has RLS enabled. The core pattern:

```sql
-- Users can only access data for farms they belong to
farm_id IN (
  SELECT farm_id FROM farm_members WHERE user_id = auth.uid()
)
OR farm_id IN (
  SELECT id FROM farms WHERE owner_id = auth.uid()
)
```

Reference tables (`crop_types`, `livestock_types`, `inventory_categories`) are readable by all authenticated users.

## Triggers

**`handle_new_user()`** — Automatically creates a `profiles` row when a new user signs up via Supabase Auth, using metadata from the signup call (full_name, phone, county).

## Migrations

Located in `supabase/migrations/`:

1. `001_initial_schema.sql` — All tables, RLS policies, triggers
2. `002_seed_data.sql` — Kenyan crop types, livestock breeds, inventory categories
