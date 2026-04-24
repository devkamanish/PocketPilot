-- Run this only if your project was initialized before the latest schema changes.

-- 1) Ensure budgets has the expected column.
alter table public.budgets
  add column if not exists spending_limit numeric;

-- 2) Add profiles table for server-side profile persistence.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  income numeric not null default 0 check (income >= 0),
  savings_goal numeric not null default 20 check (savings_goal >= 0 and savings_goal <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "users manage own profile" on public.profiles;
create policy "users manage own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
