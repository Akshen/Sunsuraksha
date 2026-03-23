-- ============================================
-- SunSuraksha — Supabase Database Schema v2
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- If you already ran v1, run the migration at the bottom instead.
-- ============================================

-- 1. USER PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  city text default 'Delhi',
  age integer,
  gender text check (gender in ('male', 'female', 'other') or gender is null),
  weight_kg integer,
  body_type text check (body_type in ('slim', 'average', 'athletic', 'heavy') or body_type is null),
  diet_preference text check (diet_preference in ('vegetarian', 'vegan', 'non-vegetarian') or diet_preference is null),
  language text not null default 'en' check (language in ('en', 'hi')),
  onboarded boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. HYDRATION LOGS
create table if not exists public.hydration_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount_ml integer not null check (amount_ml > 0 and amount_ml <= 2000),
  logged_at timestamp with time zone default now()
);

-- 3. DAILY HYDRATION SUMMARY
create table if not exists public.hydration_daily (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  total_ml integer not null default 0,
  target_ml integer not null default 3000,
  log_count integer not null default 0,
  unique (user_id, date)
);

-- 4. INDEXES
create index if not exists idx_hydration_logs_user_date
  on public.hydration_logs (user_id, logged_at desc);
create index if not exists idx_hydration_daily_user_date
  on public.hydration_daily (user_id, date desc);

-- 5. ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.hydration_logs enable row level security;
alter table public.hydration_daily enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own hydration logs"
  on public.hydration_logs for select using (auth.uid() = user_id);
create policy "Users can insert own hydration logs"
  on public.hydration_logs for insert with check (auth.uid() = user_id);
create policy "Users can delete own hydration logs"
  on public.hydration_logs for delete using (auth.uid() = user_id);

create policy "Users can view own daily hydration"
  on public.hydration_daily for select using (auth.uid() = user_id);
create policy "Users can upsert own daily hydration"
  on public.hydration_daily for insert with check (auth.uid() = user_id);
create policy "Users can update own daily hydration"
  on public.hydration_daily for update using (auth.uid() = user_id);

-- 6. TRIGGERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- ============================================
-- MIGRATION: If you already ran v1 schema, run ONLY these lines:
-- ============================================
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS job_type;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text check (gender in ('male', 'female', 'other') or gender is null);
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS body_type text check (body_type in ('slim', 'average', 'athletic', 'heavy') or body_type is null);
-- ALTER TABLE public.profiles ALTER COLUMN name DROP NOT NULL;
-- ALTER TABLE public.profiles ALTER COLUMN name DROP DEFAULT;
-- ALTER TABLE public.profiles ALTER COLUMN city DROP NOT NULL;
-- ALTER TABLE public.profiles ALTER COLUMN age DROP NOT NULL;
-- ALTER TABLE public.profiles ALTER COLUMN weight_kg DROP NOT NULL;
-- ALTER TABLE public.profiles ALTER COLUMN diet_preference DROP NOT NULL;
