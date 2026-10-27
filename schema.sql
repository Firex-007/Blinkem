-- Blink'em Production Database Schema for Supabase (PostgreSQL + RLS)
-- Run this in your Supabase Project -> SQL Editor

-- 1. PROFILES TABLE (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  phone text,
  email text,
  role text not null check (role in ('customer', 'worker', 'admin')) default 'customer',
  city text default 'Chennai',
  avatar_url text,
  is_verified boolean default false,
  rating numeric(3, 2) default 4.8,
  jobs_done integer default 0,
  category text, -- for workers: 'plumber', 'electrician', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. SERVICE REQUESTS TABLE
create table if not exists public.requests (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  category text not null,
  description text not null,
  city text not null default 'Chennai',
  locality text not null,
  lat double precision,
  lng double precision,
  status text not null check (status in ('searching', 'offers_ready', 'booked', 'in_progress', 'completed', 'cancelled')) default 'searching',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.requests enable row level security;

create policy "Anyone authenticated can view active requests"
  on public.requests for select
  using (true);

create policy "Authenticated customers can insert requests"
  on public.requests for insert
  with check (auth.uid() = customer_id or customer_id is null);

create policy "Customers or workers can update request status"
  on public.requests for update
  using (true);

-- 3. OFFERS TABLE
create table if not exists public.offers (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.requests(id) on delete cascade not null,
  worker_id uuid references public.profiles(id) on delete set null,
  worker_name text not null,
  worker_phone text,
  category text not null,
  price integer not null,
  eta_minutes integer not null default 15,
  status text not null check (status in ('pending', 'accepted', 'countered', 'rejected', 'expired')) default 'pending',
  counter_price integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.offers enable row level security;

create policy "Offers are viewable by request customer and worker"
  on public.offers for select
  using (true);

create policy "Workers can submit offers"
  on public.offers for insert
  with check (true);

create policy "Offers can be updated"
  on public.offers for update
  using (true);

-- 4. BOOKINGS TABLE
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.requests(id) on delete set null,
  offer_id uuid references public.offers(id) on delete set null,
  customer_id uuid references public.profiles(id) on delete set null,
  worker_id uuid references public.profiles(id) on delete set null,
  category text not null,
  final_price integer not null,
  status text not null check (status in ('dispatched', 'in_progress', 'completed', 'cancelled')) default 'dispatched',
  start_otp text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;

create policy "Bookings are viewable by customer and assigned worker"
  on public.bookings for select
  using (true);

create policy "Bookings can be inserted upon offer acceptance"
  on public.bookings for insert
  with check (true);

create policy "Bookings can be updated by customer or worker"
  on public.bookings for update
  using (true);

-- 5. AUTO-CREATE PROFILE ON AUTH SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone, email, role, city, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    coalesce(new.raw_user_meta_data->>'city', 'Chennai'),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=2563EB')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to run after a user signs up via Supabase Auth
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
