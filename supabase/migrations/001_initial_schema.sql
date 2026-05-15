-- Geco Farm — Initial Database Schema
-- All financial fields in Kenyan Shillings (KES)
-- RLS policies for multi-tenant farm isolation

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  phone text,
  role text not null default 'farmer' check (role in ('admin','manager','worker','farmer')),
  avatar_url text,
  county text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- ============================================================
-- 2. FARMS
-- ============================================================
create table if not exists farms (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users on delete cascade,
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

alter table farms enable row level security;
create policy "Farm members can view farms" on farms for select using (
  id in (select farm_id from farm_members where user_id = auth.uid())
  or owner_id = auth.uid()
);
create policy "Owner can update farm" on farms for update using (owner_id = auth.uid());
create policy "Authenticated users can create farms" on farms for insert with check (auth.uid() = owner_id);
create policy "Owner can delete farm" on farms for delete using (owner_id = auth.uid());

-- ============================================================
-- 3. FARM_MEMBERS
-- ============================================================
create table if not exists farm_members (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'worker' check (role in ('owner','manager','worker')),
  created_at timestamptz default now(),
  unique(farm_id, user_id)
);

alter table farm_members enable row level security;
create policy "Members can view farm members" on farm_members for select using (
  farm_id in (select farm_id from farm_members as fm where fm.user_id = auth.uid())
);
create policy "Farm owner can manage members" on farm_members for all using (
  farm_id in (select id from farms where owner_id = auth.uid())
);

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

alter table fields enable row level security;
create policy "Farm members can manage fields" on fields for all using (
  farm_id in (select farm_id from farm_members where user_id = auth.uid())
  or farm_id in (select id from farms where owner_id = auth.uid())
);

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

alter table crop_types enable row level security;
create policy "Anyone can read crop types" on crop_types for select using (true);

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

alter table plantings enable row level security;
create policy "Farm members can manage plantings" on plantings for all using (
  farm_id in (select farm_id from farm_members where user_id = auth.uid())
  or farm_id in (select id from farms where owner_id = auth.uid())
);

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

alter table harvests enable row level security;
create policy "Farm members can manage harvests" on harvests for all using (
  farm_id in (select farm_id from farm_members where user_id = auth.uid())
  or farm_id in (select id from farms where owner_id = auth.uid())
);

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

alter table livestock_types enable row level security;
create policy "Anyone can read livestock types" on livestock_types for select using (true);

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

alter table livestock enable row level security;
create policy "Farm members can manage livestock" on livestock for all using (
  farm_id in (select farm_id from farm_members where user_id = auth.uid())
  or farm_id in (select id from farms where owner_id = auth.uid())
);

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

alter table livestock_health_records enable row level security;
create policy "Farm members can manage health records" on livestock_health_records for all using (
  farm_id in (select farm_id from farm_members where user_id = auth.uid())
  or farm_id in (select id from farms where owner_id = auth.uid())
);

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

alter table production_records enable row level security;
create policy "Farm members can manage production" on production_records for all using (
  farm_id in (select farm_id from farm_members where user_id = auth.uid())
  or farm_id in (select id from farms where owner_id = auth.uid())
);

-- ============================================================
-- 12. INVENTORY_CATEGORIES (global reference)
-- ============================================================
create table if not exists inventory_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

alter table inventory_categories enable row level security;
create policy "Anyone can read categories" on inventory_categories for select using (true);

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

alter table inventory enable row level security;
create policy "Farm members can manage inventory" on inventory for all using (
  farm_id in (select farm_id from farm_members where user_id = auth.uid())
  or farm_id in (select id from farms where owner_id = auth.uid())
);

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

alter table inventory_transactions enable row level security;
create policy "Farm members can manage transactions" on inventory_transactions for all using (
  farm_id in (select farm_id from farm_members where user_id = auth.uid())
  or farm_id in (select id from farms where owner_id = auth.uid())
);

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
  recorded_by uuid references auth.users,
  receipt_url text,
  notes text,
  created_at timestamptz default now()
);

alter table expenses enable row level security;
create policy "Farm members can manage expenses" on expenses for all using (
  farm_id in (select farm_id from farm_members where user_id = auth.uid())
  or farm_id in (select id from farms where owner_id = auth.uid())
);

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
  recorded_by uuid references auth.users,
  notes text,
  created_at timestamptz default now()
);

alter table sales enable row level security;
create policy "Farm members can manage sales" on sales for all using (
  farm_id in (select farm_id from farm_members where user_id = auth.uid())
  or farm_id in (select id from farms where owner_id = auth.uid())
);

-- ============================================================
-- 17. TASKS
-- ============================================================
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references auth.users,
  priority text default 'medium' check (priority in ('low','medium','high','urgent')),
  status text default 'pending' check (status in ('pending','in_progress','completed','cancelled','overdue')),
  category text default 'general' check (category in ('planting','harvesting','irrigation','spraying','feeding','milking','veterinary','maintenance','transport','general')),
  due_date date,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;
create policy "Farm members can manage tasks" on tasks for all using (
  farm_id in (select farm_id from farm_members where user_id = auth.uid())
  or farm_id in (select id from farms where owner_id = auth.uid())
);

-- ============================================================
-- 18. ACTIVITY_LOG
-- ============================================================
create table if not exists activity_log (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid not null references farms on delete cascade,
  user_id uuid references auth.users,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

alter table activity_log enable row level security;
create policy "Farm members can read activity" on activity_log for select using (
  farm_id in (select farm_id from farm_members where user_id = auth.uid())
  or farm_id in (select id from farms where owner_id = auth.uid())
);
create policy "System can insert activity" on activity_log for insert with check (true);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, phone, county, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'county',
    'farmer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
