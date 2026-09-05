-- ============================================================
-- site_settings — single-row table holding admin feature flags
-- ============================================================
-- Run this once against your Supabase project (SQL Editor, or
-- `supabase db push`) before using /admin/settings.
--
-- Until this table exists the app falls back to DEFAULT_SETTINGS
-- in utils/site-settings.ts, which keeps payments disabled.

create table if not exists public.site_settings (
  id                integer primary key default 1,
  payments_enabled  boolean not null default false,
  payhere_mode      text    not null default 'sandbox',
  free_bump_enabled boolean not null default true,
  updated_at        timestamptz not null default now(),
  updated_by        uuid references auth.users (id) on delete set null,
  -- Enforce the single-row invariant: only id = 1 is ever allowed.
  constraint site_settings_singleton check (id = 1),
  constraint site_settings_mode check (payhere_mode in ('sandbox', 'live'))
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.site_settings enable row level security;

-- Anyone (including logged-out visitors) may READ the flags: the public site
-- needs them to decide whether to show a payment button or a WhatsApp button.
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  using (true);

-- Only the admin account may WRITE. Replace the email below if your admin
-- address changes — it must match the ADMIN_EMAIL env var used by the app.
drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
  on public.site_settings for update
  using (auth.jwt() ->> 'email' = 'admin@renta.lk')
  with check (auth.jwt() ->> 'email' = 'admin@renta.lk');
