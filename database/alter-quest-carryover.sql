-- Add carried-over flag for unfinished main quests. Does not drop tables.
alter table public.daily_entries
  add column if not exists main_task_carried_over boolean not null default false;
