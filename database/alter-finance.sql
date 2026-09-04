-- Finance pulse tables. Does not drop existing HUD tables.
create table if not exists public.finance_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  logged_at timestamptz not null default now(),
  amount numeric(12, 2) not null check (amount > 0),
  category text not null check (
    category in ('food', 'business', 'utilities', 'groceries', 'shopping', 'bills', 'other')
  ),
  updated_at timestamptz not null default now()
);

create index if not exists finance_expenses_user_date_idx
  on public.finance_expenses (user_id, entry_date desc);

create table if not exists public.finance_incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  amount numeric(12, 2) not null check (amount >= 0),
  source text,
  updated_at timestamptz not null default now(),
  unique (user_id, month)
);

create table if not exists public.finance_budgets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  caps jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.finance_expenses enable row level security;
alter table public.finance_incomes enable row level security;
alter table public.finance_budgets enable row level security;

drop policy if exists "finance_expenses_select_own" on public.finance_expenses;
create policy "finance_expenses_select_own"
  on public.finance_expenses for select using (auth.uid() = user_id);
drop policy if exists "finance_expenses_insert_own" on public.finance_expenses;
create policy "finance_expenses_insert_own"
  on public.finance_expenses for insert with check (auth.uid() = user_id);
drop policy if exists "finance_expenses_update_own" on public.finance_expenses;
create policy "finance_expenses_update_own"
  on public.finance_expenses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "finance_expenses_delete_own" on public.finance_expenses;
create policy "finance_expenses_delete_own"
  on public.finance_expenses for delete using (auth.uid() = user_id);

drop policy if exists "finance_incomes_select_own" on public.finance_incomes;
create policy "finance_incomes_select_own"
  on public.finance_incomes for select using (auth.uid() = user_id);
drop policy if exists "finance_incomes_insert_own" on public.finance_incomes;
create policy "finance_incomes_insert_own"
  on public.finance_incomes for insert with check (auth.uid() = user_id);
drop policy if exists "finance_incomes_update_own" on public.finance_incomes;
create policy "finance_incomes_update_own"
  on public.finance_incomes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "finance_incomes_delete_own" on public.finance_incomes;
create policy "finance_incomes_delete_own"
  on public.finance_incomes for delete using (auth.uid() = user_id);

drop policy if exists "finance_budgets_select_own" on public.finance_budgets;
create policy "finance_budgets_select_own"
  on public.finance_budgets for select using (auth.uid() = user_id);
drop policy if exists "finance_budgets_insert_own" on public.finance_budgets;
create policy "finance_budgets_insert_own"
  on public.finance_budgets for insert with check (auth.uid() = user_id);
drop policy if exists "finance_budgets_update_own" on public.finance_budgets;
create policy "finance_budgets_update_own"
  on public.finance_budgets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "finance_budgets_delete_own" on public.finance_budgets;
create policy "finance_budgets_delete_own"
  on public.finance_budgets for delete using (auth.uid() = user_id);
