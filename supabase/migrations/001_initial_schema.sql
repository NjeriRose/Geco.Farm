-- Geco Farm — Initial Database Schema
-- Auth: Clerk (external), Database: Supabase (PostgreSQL)
-- All financial fields in Kenyan Shillings (KES)
-- User IDs are Clerk text IDs (e.g. user_xxx)

create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists profiles (
  id text primary key,
  full_name text not null,
  phone text,
  role text not null default 'farmer' check (role in ('admin','manager','worker','farmer')),
  avatar_url text,
  county text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. FARMS
-- ============================================================
create table if not exists farms (
  id uuid primary key default uuid_generate_v4(),
  owner_id text not null,
  name text not null,
  county text not null,
  location text,
  latitude double precision,
  longitude double precision,
  size_acres numeric(10,2) default 0,
  farm_type text not null default 'mixed' check (farm_type in ('crop','livestock','mixed','aquaculture')),
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_farms_owner on farms(owner_id);

-- ============================================================
-- 3. FARM_MEMBERS
-- ============================================================
create table if not exists farm_members (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  user_id text not null,
  role text not null default 'worker' check (role in ('owner','manager','worker')),
  created_at timestamptz default now(),
  unique(farm_id, user_id)
);

create index idx_farm_members_user on farm_members(user_id);

-- ============================================================
-- 4. FIELDS
-- ============================================================
create table if not exists fields (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  name text not null,
  size_acres numeric(10,2) default 0,
  soil_type text,
  irrigation_type text default 'rainfed' check (irrigation_type in ('rainfed','drip','sprinkler','furrow','flood','none')),
  status text default 'active' check (status in ('active','fallow','preparation')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_fields_farm on fields(farm_id);

-- ============================================================
-- 5. CROP_TYPES (global reference table)
-- ============================================================
create table if not exists crop_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  variety text,
  category text check (category in ('grain','vegetable','fruit','cash_crop','legume','tuber','herb','flower','fodder')),
  growing_season_days int,
  description text,
  created_at timestamptz default now()
);

-- ============================================================
-- 6. PLANTINGS
-- ============================================================
create table if not exists plantings (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  field_id uuid not null references fields on delete cascade,
  crop_type_id uuid not null references crop_types on delete restrict,
  season text check (season in ('long_rains','short_rains','irrigated','year_round')),
  planting_date date not null,
  expected_harvest_date date,
  actual_harvest_date date,
  area_acres numeric(10,2) default 0,
  seed_quantity numeric(10,2),
  seed_unit text,
  seed_cost_kes numeric(12,2) default 0,
  status text default 'planned' check (status in ('planned','planted','growing','harvested','failed')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_plantings_farm on plantings(farm_id);

-- ============================================================
-- 7. HARVESTS
-- ============================================================
create table if not exists harvests (
  id uuid primary key default uuid_generate_v4(),
  planting_id uuid not null references plantings on delete cascade,
  farm_id uuid not null references farms on delete cascade,
  harvest_date date not null,
  quantity numeric(12,2) not null,
  unit text not null,
  quality_grade text check (quality_grade in ('A','B','C','reject')),
  storage_location text,
  notes text,
  created_at timestamptz default now()
);

create index idx_harvests_farm on harvests(farm_id);

-- ============================================================
-- 8. LIVESTOCK_TYPES (global reference table)
-- ============================================================
create table if not exists livestock_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  breed text,
  category text check (category in ('dairy','beef','meat','layers','broilers','indigenous','dual_purpose','aquaculture','apiculture')),
  description text,
  created_at timestamptz default now()
);

-- ============================================================
-- 9. LIVESTOCK
-- ============================================================
create table if not exists livestock (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  livestock_type_id uuid not null references livestock_types on delete restrict,
  tag_number text,
  name text,
  date_of_birth date,
  date_acquired date,
  acquisition_cost_kes numeric(12,2) default 0,
  gender text check (gender in ('male','female')),
  status text default 'active' check (status in ('active','sold','deceased','transferred','slaughtered')),
  health_status text default 'healthy' check (health_status in ('healthy','sick','recovering','quarantine','pregnant')),
  weight_kg numeric(8,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_livestock_farm on livestock(farm_id);

-- ============================================================
-- 10. LIVESTOCK_HEALTH_RECORDS
-- ============================================================
create table if not exists livestock_health_records (
  id uuid primary key default uuid_generate_v4(),
  livestock_id uuid not null references livestock on delete cascade,
  farm_id uuid not null references farms on delete cascade,
  record_date date not null,
  record_type text not null check (record_type in ('vaccination','treatment','checkup','deworming','artificial_insemination','pregnancy_check')),
  description text not null,
  medicine text,
  dosage text,
  veterinarian text,
  cost_kes numeric(12,2) default 0,
  next_due_date date,
  notes text,
  created_at timestamptz default now()
);

create index idx_health_records_farm on livestock_health_records(farm_id);

-- ============================================================
-- 11. PRODUCTION_RECORDS
-- ============================================================
create table if not exists production_records (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  livestock_id uuid references livestock on delete set null,
  production_date date not null,
  product_type text not null check (product_type in ('milk','eggs','wool','honey','manure','other')),
  quantity numeric(12,2) not null,
  unit text not null,
  quality_grade text,
  notes text,
  created_at timestamptz default now()
);

create index idx_production_farm on production_records(farm_id);

-- ============================================================
-- 12. INVENTORY_CATEGORIES (global reference)
-- ============================================================
create table if not exists inventory_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

-- ============================================================
-- 13. INVENTORY
-- ============================================================
create table if not exists inventory (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  category_id uuid not null references inventory_categories on delete restrict,
  name text not null,
  quantity numeric(12,2) default 0,
  unit text not null,
  unit_cost_kes numeric(12,2) default 0,
  reorder_level numeric(12,2) default 0,
  supplier text,
  storage_location text,
  expiry_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_inventory_farm on inventory(farm_id);

-- ============================================================
-- 14. INVENTORY_TRANSACTIONS
-- ============================================================
create table if not exists inventory_transactions (
  id uuid primary key default uuid_generate_v4(),
  inventory_id uuid not null references inventory on delete cascade,
  farm_id uuid not null references farms on delete cascade,
  transaction_type text not null check (transaction_type in ('purchase','usage','adjustment','return','write_off')),
  quantity numeric(12,2) not null,
  unit_cost_kes numeric(12,2) default 0,
  total_cost_kes numeric(12,2) default 0,
  reference text,
  notes text,
  created_at timestamptz default now()
);

create index idx_inv_txn_farm on inventory_transactions(farm_id);

-- ============================================================
-- 15. EXPENSES
-- ============================================================
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  category text not null check (category in ('labor','seeds','fertilizer','pesticide','veterinary','feed','equipment','transport','utilities','rent','fuel','maintenance','other')),
  description text not null,
  amount_kes numeric(12,2) not null,
  payment_method text default 'cash' check (payment_method in ('cash','mpesa','bank_transfer','cheque','credit')),
  reference_number text,
  expense_date date not null,
  recorded_by text,
  receipt_url text,
  notes text,
  created_at timestamptz default now()
);

create index idx_expenses_farm on expenses(farm_id);

-- ============================================================
-- 16. SALES
-- ============================================================
create table if not exists sales (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  item_type text not null check (item_type in ('crop','livestock','produce','product','other')),
  item_description text not null,
  quantity numeric(12,2),
  unit text,
  unit_price_kes numeric(12,2),
  total_amount_kes numeric(12,2) not null,
  buyer_name text,
  buyer_phone text,
  payment_method text default 'mpesa' check (payment_method in ('cash','mpesa','bank_transfer','cheque','credit')),
  payment_status text default 'paid' check (payment_status in ('paid','pending','partial','overdue')),
  reference_number text,
  sale_date date not null,
  recorded_by text,
  notes text,
  created_at timestamptz default now()
);

create index idx_sales_farm on sales(farm_id);

-- ============================================================
-- 17. TASKS
-- ============================================================
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  title text not null,
  description text,
  assigned_to text,
  priority text default 'medium' check (priority in ('low','medium','high','urgent')),
  status text default 'pending' check (status in ('pending','in_progress','completed','cancelled','overdue')),
  category text default 'general' check (category in ('planting','harvesting','irrigation','spraying','feeding','milking','veterinary','maintenance','transport','general')),
  due_date date,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_tasks_farm on tasks(farm_id);

-- ============================================================
-- 18. ACTIVITY_LOG
-- ============================================================
create table if not exists activity_log (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  user_id text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

create index idx_activity_farm on activity_log(farm_id);
