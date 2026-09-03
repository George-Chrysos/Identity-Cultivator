-- Tighten live daily_entries from 0–100 to 1–5. Does not drop tables.
alter table public.daily_entries drop constraint if exists daily_entries_body_check;
alter table public.daily_entries drop constraint if exists daily_entries_mind_check;
alter table public.daily_entries drop constraint if exists daily_entries_soul_check;

update public.daily_entries
set
  body = case when body is null or body < 1 then null when body > 5 then 5 else body end,
  mind = case when mind is null or mind < 1 then null when mind > 5 then 5 else mind end,
  soul = case when soul is null or soul < 1 then null when soul > 5 then 5 else soul end;

alter table public.daily_entries
  add constraint daily_entries_body_check check (body is null or body between 1 and 5);
alter table public.daily_entries
  add constraint daily_entries_mind_check check (mind is null or mind between 1 and 5);
alter table public.daily_entries
  add constraint daily_entries_soul_check check (soul is null or soul between 1 and 5);
