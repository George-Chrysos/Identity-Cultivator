-- ============================================================================
-- Life Widgets schema (Finance / Self-Care / Home / Motorcycle)
--
-- Manual entry now, integrations later.
-- Owner-only row level security everywhere.
-- Idempotent-ish: uses create table if not exists + drops policies by name.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- FINANCE
-- ----------------------------------------------------------------------------
create table if not exists public.finance_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  category text not null,
  created_at timestamptz not null default now()
);

create index if not exists finance_expenses_user_created_idx
  on public.finance_expenses (user_id, created_at desc);

alter table public.finance_expenses enable row level security;

drop policy if exists finance_expenses_select_own on public.finance_expenses;
create policy finance_expenses_select_own
  on public.finance_expenses for select
  using (auth.uid() = user_id);

drop policy if exists finance_expenses_insert_own on public.finance_expenses;
create policy finance_expenses_insert_own
  on public.finance_expenses for insert
  with check (auth.uid() = user_id);

drop policy if exists finance_expenses_update_own on public.finance_expenses;
create policy finance_expenses_update_own
  on public.finance_expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists finance_expenses_delete_own on public.finance_expenses;
create policy finance_expenses_delete_own
  on public.finance_expenses for delete
  using (auth.uid() = user_id);

-- Accounts: manual balances (liquid money)
create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  balance_cents integer not null,
  updated_at timestamptz not null default now()
);

create index if not exists finance_accounts_user_updated_idx
  on public.finance_accounts (user_id, updated_at desc);

alter table public.finance_accounts enable row level security;

drop policy if exists finance_accounts_select_own on public.finance_accounts;
create policy finance_accounts_select_own
  on public.finance_accounts for select
  using (auth.uid() = user_id);

drop policy if exists finance_accounts_insert_own on public.finance_accounts;
create policy finance_accounts_insert_own
  on public.finance_accounts for insert
  with check (auth.uid() = user_id);

drop policy if exists finance_accounts_update_own on public.finance_accounts;
create policy finance_accounts_update_own
  on public.finance_accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists finance_accounts_delete_own on public.finance_accounts;
create policy finance_accounts_delete_own
  on public.finance_accounts for delete
  using (auth.uid() = user_id);

-- Debts: manual balances
create table if not exists public.finance_debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  balance_cents integer not null,
  apr numeric,
  updated_at timestamptz not null default now()
);

create index if not exists finance_debts_user_updated_idx
  on public.finance_debts (user_id, updated_at desc);

alter table public.finance_debts enable row level security;

drop policy if exists finance_debts_select_own on public.finance_debts;
create policy finance_debts_select_own
  on public.finance_debts for select
  using (auth.uid() = user_id);

drop policy if exists finance_debts_insert_own on public.finance_debts;
create policy finance_debts_insert_own
  on public.finance_debts for insert
  with check (auth.uid() = user_id);

drop policy if exists finance_debts_update_own on public.finance_debts;
create policy finance_debts_update_own
  on public.finance_debts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists finance_debts_delete_own on public.finance_debts;
create policy finance_debts_delete_own
  on public.finance_debts for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- SELF-CARE
-- ----------------------------------------------------------------------------
create table if not exists public.selfcare_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  sleep_quality integer check (sleep_quality >= 0 and sleep_quality <= 100),
  meals_count integer check (meals_count >= 0 and meals_count <= 10),
  meals_quality integer check (meals_quality >= 0 and meals_quality <= 100),
  activated boolean not null default false,
  stretched boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

create index if not exists selfcare_checkins_user_day_idx
  on public.selfcare_checkins (user_id, day desc);

alter table public.selfcare_checkins enable row level security;

drop policy if exists selfcare_checkins_select_own on public.selfcare_checkins;
create policy selfcare_checkins_select_own
  on public.selfcare_checkins for select
  using (auth.uid() = user_id);

drop policy if exists selfcare_checkins_insert_own on public.selfcare_checkins;
create policy selfcare_checkins_insert_own
  on public.selfcare_checkins for insert
  with check (auth.uid() = user_id);

drop policy if exists selfcare_checkins_update_own on public.selfcare_checkins;
create policy selfcare_checkins_update_own
  on public.selfcare_checkins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists selfcare_checkins_delete_own on public.selfcare_checkins;
create policy selfcare_checkins_delete_own
  on public.selfcare_checkins for delete
  using (auth.uid() = user_id);

create table if not exists public.hygiene_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now()
);

create index if not exists hygiene_events_user_created_idx
  on public.hygiene_events (user_id, created_at desc);

alter table public.hygiene_events enable row level security;

drop policy if exists hygiene_events_select_own on public.hygiene_events;
create policy hygiene_events_select_own
  on public.hygiene_events for select
  using (auth.uid() = user_id);

drop policy if exists hygiene_events_insert_own on public.hygiene_events;
create policy hygiene_events_insert_own
  on public.hygiene_events for insert
  with check (auth.uid() = user_id);

drop policy if exists hygiene_events_delete_own on public.hygiene_events;
create policy hygiene_events_delete_own
  on public.hygiene_events for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- HOME
-- ----------------------------------------------------------------------------
create table if not exists public.home_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  cleanliness integer check (cleanliness >= 0 and cleanliness <= 100),
  organization integer check (organization >= 0 and organization <= 100),
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

create index if not exists home_checkins_user_day_idx
  on public.home_checkins (user_id, day desc);

alter table public.home_checkins enable row level security;

drop policy if exists home_checkins_select_own on public.home_checkins;
create policy home_checkins_select_own
  on public.home_checkins for select
  using (auth.uid() = user_id);

drop policy if exists home_checkins_insert_own on public.home_checkins;
create policy home_checkins_insert_own
  on public.home_checkins for insert
  with check (auth.uid() = user_id);

drop policy if exists home_checkins_update_own on public.home_checkins;
create policy home_checkins_update_own
  on public.home_checkins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists home_checkins_delete_own on public.home_checkins;
create policy home_checkins_delete_own
  on public.home_checkins for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- MOTORCYCLE
-- ----------------------------------------------------------------------------
create table if not exists public.motorcycle_odometers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  km integer not null check (km >= 0),
  recorded_at timestamptz not null default now()
);

create index if not exists motorcycle_odometers_user_recorded_idx
  on public.motorcycle_odometers (user_id, recorded_at desc);

alter table public.motorcycle_odometers enable row level security;

drop policy if exists motorcycle_odometers_select_own on public.motorcycle_odometers;
create policy motorcycle_odometers_select_own
  on public.motorcycle_odometers for select
  using (auth.uid() = user_id);

drop policy if exists motorcycle_odometers_insert_own on public.motorcycle_odometers;
create policy motorcycle_odometers_insert_own
  on public.motorcycle_odometers for insert
  with check (auth.uid() = user_id);

drop policy if exists motorcycle_odometers_delete_own on public.motorcycle_odometers;
create policy motorcycle_odometers_delete_own
  on public.motorcycle_odometers for delete
  using (auth.uid() = user_id);

create table if not exists public.motorcycle_fuel_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  liters numeric,
  price_cents integer,
  total_cents integer,
  km_at_fill integer,
  recorded_at timestamptz not null default now()
);

create index if not exists motorcycle_fuel_logs_user_recorded_idx
  on public.motorcycle_fuel_logs (user_id, recorded_at desc);

alter table public.motorcycle_fuel_logs enable row level security;

drop policy if exists motorcycle_fuel_logs_select_own on public.motorcycle_fuel_logs;
create policy motorcycle_fuel_logs_select_own
  on public.motorcycle_fuel_logs for select
  using (auth.uid() = user_id);

drop policy if exists motorcycle_fuel_logs_insert_own on public.motorcycle_fuel_logs;
create policy motorcycle_fuel_logs_insert_own
  on public.motorcycle_fuel_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists motorcycle_fuel_logs_delete_own on public.motorcycle_fuel_logs;
create policy motorcycle_fuel_logs_delete_own
  on public.motorcycle_fuel_logs for delete
  using (auth.uid() = user_id);

create table if not exists public.motorcycle_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  recorded_at timestamptz not null default now()
);

create index if not exists motorcycle_events_user_recorded_idx
  on public.motorcycle_events (user_id, recorded_at desc);

alter table public.motorcycle_events enable row level security;

drop policy if exists motorcycle_events_select_own on public.motorcycle_events;
create policy motorcycle_events_select_own
  on public.motorcycle_events for select
  using (auth.uid() = user_id);

drop policy if exists motorcycle_events_insert_own on public.motorcycle_events;
create policy motorcycle_events_insert_own
  on public.motorcycle_events for insert
  with check (auth.uid() = user_id);

drop policy if exists motorcycle_events_delete_own on public.motorcycle_events;
create policy motorcycle_events_delete_own
  on public.motorcycle_events for delete
  using (auth.uid() = user_id);

