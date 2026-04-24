-- Add customizable categories constraint JSON tracking array to profiles
alter table public.profiles
  add column if not exists category_allocations jsonb not null default '{}'::jsonb;
