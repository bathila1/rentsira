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