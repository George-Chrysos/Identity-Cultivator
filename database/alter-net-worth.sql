-- Manual net-worth snapshots. Additive; does not drop expenses, income, or caps.
create table if not exists public.finance_net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  savings numeric(12, 2) not null default 0 check (savings >= 0),
  debt numeric(12, 2) not null default 0 check (debt >= 0),
  assets jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists finance_net_worth_snapshots_user_date_idx
  on public.finance_net_worth_snapshots (user_id, entry_date desc);

alter table public.finance_net_worth_snapshots enable row level security;

drop policy if exists "finance_net_worth_snapshots_select_own" on public.finance_net_worth_snapshots;
create policy "finance_net_worth_snapshots_select_own"
  on public.finance_net_worth_snapshots for select using (auth.uid() = user_id);
drop policy if exists "finance_net_worth_snapshots_insert_own" on public.finance_net_worth_snapshots;
create policy "finance_net_worth_snapshots_insert_own"
  on public.finance_net_worth_snapshots for insert with check (auth.uid() = user_id);
drop policy if exists "finance_net_worth_snapshots_update_own" on public.finance_net_worth_snapshots;
create policy "finance_net_worth_snapshots_update_own"
  on public.finance_net_worth_snapshots for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "finance_net_worth_snapshots_delete_own" on public.finance_net_worth_snapshots;
create policy "finance_net_worth_snapshots_delete_own"
  on public.finance_net_worth_snapshots for delete using (auth.uid() = user_id);
