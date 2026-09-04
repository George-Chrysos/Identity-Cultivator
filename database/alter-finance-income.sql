-- Two-tier income (base salary + extras). Does not drop expenses or budgets.
create table if not exists public.finance_income_base (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  cadence text not null default 'monthly',
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_income_extras (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  amount numeric(12, 2) not null check (amount > 0),
  label text,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  updated_at timestamptz not null default now()
);

create index if not exists finance_income_extras_user_month_idx
  on public.finance_income_extras (user_id, month desc);

alter table public.finance_income_base enable row level security;
alter table public.finance_income_extras enable row level security;

drop policy if exists "finance_income_base_select_own" on public.finance_income_base;
create policy "finance_income_base_select_own"
  on public.finance_income_base for select using (auth.uid() = user_id);
drop policy if exists "finance_income_base_insert_own" on public.finance_income_base;
create policy "finance_income_base_insert_own"
  on public.finance_income_base for insert with check (auth.uid() = user_id);
drop policy if exists "finance_income_base_update_own" on public.finance_income_base;
create policy "finance_income_base_update_own"
  on public.finance_income_base for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "finance_income_base_delete_own" on public.finance_income_base;
create policy "finance_income_base_delete_own"
  on public.finance_income_base for delete using (auth.uid() = user_id);

drop policy if exists "finance_income_extras_select_own" on public.finance_income_extras;
create policy "finance_income_extras_select_own"
  on public.finance_income_extras for select using (auth.uid() = user_id);
drop policy if exists "finance_income_extras_insert_own" on public.finance_income_extras;
create policy "finance_income_extras_insert_own"
  on public.finance_income_extras for insert with check (auth.uid() = user_id);
drop policy if exists "finance_income_extras_update_own" on public.finance_income_extras;
create policy "finance_income_extras_update_own"
  on public.finance_income_extras for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "finance_income_extras_delete_own" on public.finance_income_extras;
create policy "finance_income_extras_delete_own"
  on public.finance_income_extras for delete using (auth.uid() = user_id);
