create table uploaded_rent_vehicles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text,
  make text,
  model text,
  year int,
  seller_id uuid references auth.users(id) on delete cascade not null
);
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Create a policy to allow anyone to view profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();



-- 1. Enable PostGIS in the extensions schema
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 2. Grant usage so your functions can see the types
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Delete the old one first
DROP FUNCTION IF EXISTS get_nearby_vehicles;

-- Create the updated version with explicit schema paths
CREATE OR REPLACE FUNCTION get_nearby_vehicles(
  user_lat FLOAT, 
  user_lon FLOAT, 
  search_district TEXT, 
  search_type TEXT
)
RETURNS TABLE (
  id UUID,
  make TEXT,
  model TEXT,
  district TEXT,
  type TEXT,
  image_urls TEXT[],
  daily_rate INT,
  latitude FLOAT,
  longitude FLOAT,
  dist_meters FLOAT
) 
LANGUAGE sql
AS $$
  SELECT 
    id, 
    make, 
    model, 
    district, 
    type,
    image_urls,
    daily_rate,
    latitude,
    longitude,
    -- We use the full path to extensions.geography to avoid the 'type does not exist' error
    ST_Distance(
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::extensions.geography,
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::extensions.geography
    ) AS dist_meters
  FROM uploaded_rent_vehicles
  WHERE 
    (district = search_district OR search_district IS NULL OR search_district = '')
    AND (type = search_type OR search_type IS NULL OR search_type = '')
  ORDER BY dist_meters ASC;
$$;