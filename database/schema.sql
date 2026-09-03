-- Anima Forger schema
-- Wipe known app tables (legacy + current). auth.users is untouched.
-- Idempotent: safe to re-run.

-- Leftover tables still present in the live project after the first wipe.
drop table if exists public.action_tokens cascade;
drop table if exists public.daily_path_progress cascade;
drop table if exists public.daily_records cascade;
drop table if exists public.events cascade;
drop table if exists public.gate_subtasks cascade;
drop table if exists public.quest_custom_rewards cascade;
drop table if exists public.quest_subtasks cascade;
drop table if exists public.registrations cascade;
drop table if exists public.subtasks cascade;
drop table if exists public.task_logs cascade;
drop table if exists public.task_templates cascade;
drop table if exists public.users cascade;

drop table if exists public.trial_attempts cascade;
drop table if exists public.trials cascade;
drop table if exists public.gate_attempts cascade;
drop table if exists public.gates cascade;
drop table if exists public.path_levels cascade;
drop table if exists public.player_identities cascade;
drop table if exists public.identity_templates cascade;
drop table if exists public.paths cascade;
drop table if exists public.seal_logs cascade;
drop table if exists public.seals cascade;
drop table if exists public.runes cascade;
drop table if exists public.rune_entries cascade;
drop table if exists public.grimoire_entries cascade;
drop table if exists public.quests cascade;
drop table if exists public.quest_logs cascade;
drop table if exists public.shop_items cascade;
drop table if exists public.inventory_items cascade;
drop table if exists public.player_inventory cascade;
drop table if exists public.item_templates cascade;
drop table if exists public.tickets cascade;
drop table if exists public.streaks cascade;
drop table if exists public.mercy_grants cascade;
drop table if exists public.daily_logs cascade;
drop table if exists public.identity_completions cascade;
drop table if exists public.user_identities cascade;
drop table if exists public.xp_ledger cascade;
drop table if exists public.sector_visits cascade;
drop table if exists public.quest_completions cascade;
drop table if exists public.main_quest_streaks cascade;
drop table if exists public.finance_expenses cascade;
drop table if exists public.finance_accounts cascade;
drop table if exists public.finance_debts cascade;
drop table if exists public.self_care_checkins cascade;
drop table if exists public.hygiene_events cascade;
drop table if exists public.home_checkins cascade;
drop table if exists public.motorcycle_odometer cascade;
drop table if exists public.motorcycle_fuel_logs cascade;
drop table if exists public.motorcycle_events cascade;
drop table if exists public.daily_entries cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_user() cascade;

create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  body smallint check (body is null or body between 1 and 5),
  mind smallint check (mind is null or mind between 1 and 5),
  soul smallint check (soul is null or soul between 1 and 5),
  main_task_text text not null default '',
  main_task_done boolean not null default false,
  main_task_carried_over boolean not null default false,
  morning_activation boolean not null default false,
  ritual boolean not null default false,
  night_protocol boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index daily_entries_user_date_idx
  on public.daily_entries (user_id, entry_date desc);

alter table public.profiles enable row level security;
alter table public.daily_entries enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

create policy "daily_entries_select_own"
  on public.daily_entries for select
  using (auth.uid() = user_id);

create policy "daily_entries_insert_own"
  on public.daily_entries for insert
  with check (auth.uid() = user_id);

create policy "daily_entries_update_own"
  on public.daily_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_entries_delete_own"
  on public.daily_entries for delete
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
