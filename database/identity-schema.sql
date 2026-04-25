-- ============================================================================
-- Identity Cultivator schema (fresh start)
--
-- Drop any legacy tables from the old Rank/Seal/Path/Trinity/Quest/Shop system
-- and stand up the slim Identity Cultivator model: profiles, user_identities,
-- identity_completions. Row-level security is owner-only everywhere.
--
-- Idempotent: safe to re-run. Data in legacy tables will be destroyed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Drop every known legacy table.
-- ----------------------------------------------------------------------------
drop table if exists public.trial_attempts          cascade;
drop table if exists public.trials                  cascade;
drop table if exists public.gate_attempts           cascade;
drop table if exists public.gates                   cascade;
drop table if exists public.path_levels             cascade;
drop table if exists public.player_identities       cascade;
drop table if exists public.identity_templates      cascade;
drop table if exists public.paths                   cascade;
drop table if exists public.seal_logs               cascade;
drop table if exists public.seals                   cascade;
drop table if exists public.runes                   cascade;
drop table if exists public.rune_entries            cascade;
drop table if exists public.grimoire_entries        cascade;
drop table if exists public.quests                  cascade;
drop table if exists public.quest_logs              cascade;
drop table if exists public.shop_items              cascade;
drop table if exists public.inventory_items         cascade;
drop table if exists public.player_inventory        cascade;
drop table if exists public.item_templates          cascade;
drop table if exists public.tickets                 cascade;
drop table if exists public.streaks                 cascade;
drop table if exists public.mercy_grants            cascade;
drop table if exists public.daily_logs              cascade;

-- Also drop the new tables so this script is idempotent.
drop table if exists public.identity_completions    cascade;
drop table if exists public.user_identities         cascade;
drop table if exists public.profiles                cascade;

-- ----------------------------------------------------------------------------
-- 2. Enable required extensions.
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 3. profiles: one row per auth.user. Slim metadata.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  dashboard_state jsonb,
  dashboard_updated_at timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

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

-- ----------------------------------------------------------------------------
-- 4. user_identities: a user's bindings. Max active enforced in app + trigger.
-- ----------------------------------------------------------------------------
create table public.user_identities (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  template_id          text not null,
  level                integer not null default 1 check (level >= 1 and level <= 1000),
  xp_into_level        integer not null default 0 check (xp_into_level >= 0),
  last_completed_date  date,
  bound_at             timestamptz not null default now(),

  unique (user_id, template_id)
);

create index user_identities_user_idx on public.user_identities (user_id);

alter table public.user_identities enable row level security;

create policy "user_identities_select_own"
  on public.user_identities for select
  using (auth.uid() = user_id);

create policy "user_identities_insert_own"
  on public.user_identities for insert
  with check (auth.uid() = user_id);

create policy "user_identities_update_own"
  on public.user_identities for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_identities_delete_own"
  on public.user_identities for delete
  using (auth.uid() = user_id);

-- Enforce the 3-identity cap at the database level so buggy clients cannot
-- exceed it. Keep this value in sync with IDENTITY_LIMITS.MAX_ACTIVE (3).
create or replace function public.enforce_identity_cap()
returns trigger
language plpgsql
as $$
declare
  bound_count integer;
begin
  select count(*) into bound_count
    from public.user_identities
    where user_id = new.user_id;

  if bound_count >= 3 then
    raise exception 'identity_cap_reached'
      using hint = 'A user may bind at most 3 identities at once.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_identity_cap on public.user_identities;
create trigger enforce_identity_cap
  before insert on public.user_identities
  for each row execute function public.enforce_identity_cap();

-- ----------------------------------------------------------------------------
-- 5. identity_completions: one row per identity per day completed.
-- ----------------------------------------------------------------------------
create table public.identity_completions (
  id                 uuid primary key default gen_random_uuid(),
  user_identity_id   uuid not null references public.user_identities(id) on delete cascade,
  completed_date     date not null,
  created_at         timestamptz not null default now(),

  unique (user_identity_id, completed_date)
);

create index identity_completions_identity_idx
  on public.identity_completions (user_identity_id, completed_date desc);

alter table public.identity_completions enable row level security;

-- Owner-only access goes through the parent user_identity row.
create policy "identity_completions_select_own"
  on public.identity_completions for select
  using (
    exists (
      select 1 from public.user_identities ui
      where ui.id = user_identity_id and ui.user_id = auth.uid()
    )
  );

create policy "identity_completions_insert_own"
  on public.identity_completions for insert
  with check (
    exists (
      select 1 from public.user_identities ui
      where ui.id = user_identity_id and ui.user_id = auth.uid()
    )
  );

create policy "identity_completions_delete_own"
  on public.identity_completions for delete
  using (
    exists (
      select 1 from public.user_identities ui
      where ui.id = user_identity_id and ui.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 6. Auto-create a profile row on new auth.user signup.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
