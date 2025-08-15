-- Supabase Setup Script for LuvLang Professional Dating Platform
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table for user data
create table if not exists public.profiles (
  id uuid references auth.users(id) primary key,
  email text,
  full_name text,
  avatar_url text,
  bio text,
  age integer,
  location text,
  preferences jsonb default '{}',
  photos text[] default array[]::text[],
  voice_recording_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create membership_plans table
create table if not exists public.membership_plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  monthly_price decimal(10,2) not null,
  annual_price decimal(10,2),
  features jsonb default '[]',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default membership plans
insert into public.membership_plans (name, description, monthly_price, annual_price, features) 
values 
  (
    'Premium',
    'Advanced AI matching with voice compatibility',
    19.99,
    199.00,
    '[
      "Advanced AI matching",
      "Voice compatibility analysis", 
      "Unlimited messages",
      "Priority customer support"
    ]'::jsonb
  ),
  (
    'VIP',
    'Complete dating experience with personal coaching',
    39.99,
    399.00,
    '[
      "Everything in Premium",
      "Profile boost & highlights",
      "Advanced search filters", 
      "Exclusive VIP events",
      "Personal dating coach"
    ]'::jsonb
  )
on conflict (name) do update set
  monthly_price = excluded.monthly_price,
  annual_price = excluded.annual_price,
  features = excluded.features;

-- Create user_subscriptions table
create table if not exists public.user_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  plan_id uuid references public.membership_plans(id) not null,
  paypal_order_id text,
  paypal_subscription_id text,
  status text default 'pending',
  billing_cycle text default 'monthly',
  amount decimal(10,2) not null,
  started_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create matches table for N8N integration
create table if not exists public.matches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  matched_user_id uuid references public.profiles(id) not null,
  compatibility_score decimal(5,2),
  match_algorithm text default 'ai_voice_analysis',
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_match unique(user_id, matched_user_id)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.matches enable row level security;

-- Create policies for profiles
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Create policies for subscriptions
create policy "Users can view their own subscriptions" on public.user_subscriptions
  for select using (user_id = auth.uid());

create policy "Users can insert their own subscriptions" on public.user_subscriptions
  for insert with check (user_id = auth.uid());

-- Create policies for matches
create policy "Users can view their own matches" on public.matches
  for select using (user_id = auth.uid() or matched_user_id = auth.uid());

-- Create storage buckets for file uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  (
    'profile-photos',
    'profile-photos',
    true,
    5242880, -- 5MB limit
    array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  ),
  (
    'voice-recordings', 
    'voice-recordings',
    true,
    10485760, -- 10MB limit
    array['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Create storage policies for profile photos
create policy "Users can upload their own photos" on storage.objects
  for insert with check (
    bucket_id = 'profile-photos' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view all profile photos" on storage.objects
  for select using (bucket_id = 'profile-photos');

create policy "Users can update their own photos" on storage.objects
  for update using (
    bucket_id = 'profile-photos' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own photos" on storage.objects
  for delete using (
    bucket_id = 'profile-photos' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policies for voice recordings
create policy "Users can upload their own voice recordings" on storage.objects
  for insert with check (
    bucket_id = 'voice-recordings' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view all voice recordings" on storage.objects
  for select using (bucket_id = 'voice-recordings');

create policy "Users can update their own voice recordings" on storage.objects
  for update using (
    bucket_id = 'voice-recordings' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own voice recordings" on storage.objects
  for delete using (
    bucket_id = 'voice-recordings' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to handle user profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Create trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.user_subscriptions
  for each row execute procedure public.handle_updated_at();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

-- Allow anonymous users to read membership plans
create policy "Anyone can view membership plans" on public.membership_plans
  for select using (true);

comment on table public.profiles is 'User profile information';
comment on table public.membership_plans is 'Available subscription plans';
comment on table public.user_subscriptions is 'User subscription records';
comment on table public.matches is 'User matches from AI algorithm';

-- Create indexes for better performance
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_user_subscriptions_user_id on public.user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_status on public.user_subscriptions(status);
create index if not exists idx_matches_user_id on public.matches(user_id);
create index if not exists idx_matches_matched_user_id on public.matches(matched_user_id);
create index if not exists idx_matches_compatibility_score on public.matches(compatibility_score desc);

-- Display setup completion message
select 'LuvLang Supabase setup completed successfully!' as status;
select 'Created tables: profiles, membership_plans, user_subscriptions, matches' as tables_created;
select 'Created buckets: profile-photos, voice-recordings' as buckets_created;
select 'Configured RLS policies and storage permissions' as security_configured;