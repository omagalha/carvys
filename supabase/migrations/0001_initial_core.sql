create extension if not exists pgcrypto;

create schema if not exists private;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tenant_role') then
    create type public.tenant_role as enum ('owner', 'admin', 'sales');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'membership_status') then
    create type public.membership_status as enum ('active', 'invited', 'disabled');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tenant_status') then
    create type public.tenant_status as enum ('trial', 'active', 'past_due', 'canceled');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'vehicle_status') then
    create type public.vehicle_status as enum ('draft', 'available', 'reserved', 'sold', 'archived');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_stage') then
    create type public.lead_stage as enum ('new', 'contacted', 'negotiating', 'won', 'lost');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'follow_up_status') then
    create type public.follow_up_status as enum ('pending', 'done', 'canceled', 'overdue');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'integration_status') then
    create type public.integration_status as enum ('disconnected', 'connecting', 'connected', 'error');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan_code text not null default 'trial',
  status public.tenant_status not null default 'trial',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.tenant_role not null default 'sales',
  status public.membership_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, user_id)
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  brand text not null,
  model text not null,
  version text,
  year_manufacture integer,
  year_model integer,
  mileage integer,
  color text,
  plate text,
  price numeric(12, 2) not null default 0,
  cost_price numeric(12, 2),
  status public.vehicle_status not null default 'draft',
  featured boolean not null default false,
  cover_image_path text,
  gallery jsonb not null default '[]'::jsonb,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  assigned_user_id uuid references auth.users (id) on delete set null,
  interest_vehicle_id uuid references public.vehicles (id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  source text,
  stage public.lead_stage not null default 'new',
  notes text,
  last_contact_at timestamptz,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  assigned_user_id uuid references auth.users (id) on delete set null,
  title text not null,
  notes text,
  channel text not null default 'whatsapp',
  due_at timestamptz not null,
  completed_at timestamptz,
  status public.follow_up_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.whatsapp_instances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  provider text not null default 'zapi',
  instance_external_id text,
  phone_number text,
  status public.integration_status not null default 'disconnected',
  webhook_secret text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  provider text not null default 'asaas',
  provider_customer_id text,
  provider_subscription_id text unique,
  plan_code text not null default 'trial',
  status text not null default 'trial',
  next_billing_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants (id) on delete cascade,
  provider text not null,
  external_event_id text,
  event_type text not null,
  status text not null default 'received',
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists webhook_events_provider_external_event_id_key
  on public.webhook_events (provider, external_event_id)
  where external_event_id is not null;

create index if not exists tenant_memberships_user_id_idx
  on public.tenant_memberships (user_id);

create index if not exists tenant_memberships_tenant_id_idx
  on public.tenant_memberships (tenant_id);

create index if not exists vehicles_tenant_id_status_idx
  on public.vehicles (tenant_id, status);

create index if not exists leads_tenant_id_stage_idx
  on public.leads (tenant_id, stage);

create index if not exists leads_tenant_id_next_follow_up_at_idx
  on public.leads (tenant_id, next_follow_up_at);

create index if not exists follow_ups_tenant_id_due_at_idx
  on public.follow_ups (tenant_id, due_at);

create index if not exists follow_ups_tenant_id_status_idx
  on public.follow_ups (tenant_id, status);

create index if not exists whatsapp_instances_tenant_id_idx
  on public.whatsapp_instances (tenant_id);

create index if not exists billing_subscriptions_tenant_id_idx
  on public.billing_subscriptions (tenant_id);

create or replace function private.is_tenant_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = target_tenant_id
      and tm.user_id = (select auth.uid())
      and tm.status = 'active'
  );
$$;

create or replace function private.is_tenant_admin(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = target_tenant_id
      and tm.user_id = (select auth.uid())
      and tm.status = 'active'
      and tm.role in ('owner', 'admin')
  );
$$;

alter table public.profiles enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.vehicles enable row level security;
alter table public.leads enable row level security;
alter table public.follow_ups enable row level security;
alter table public.whatsapp_instances enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.webhook_events enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists tenants_select_member on public.tenants;
create policy tenants_select_member
on public.tenants
for select
to authenticated
using (private.is_tenant_member(id));

drop policy if exists tenants_update_admin on public.tenants;
create policy tenants_update_admin
on public.tenants
for update
to authenticated
using (private.is_tenant_admin(id))
with check (private.is_tenant_admin(id));

drop policy if exists tenant_memberships_select_member on public.tenant_memberships;
create policy tenant_memberships_select_member
on public.tenant_memberships
for select
to authenticated
using (private.is_tenant_member(tenant_id));

drop policy if exists tenant_memberships_insert_admin on public.tenant_memberships;
create policy tenant_memberships_insert_admin
on public.tenant_memberships
for insert
to authenticated
with check (private.is_tenant_admin(tenant_id));

drop policy if exists tenant_memberships_update_admin on public.tenant_memberships;
create policy tenant_memberships_update_admin
on public.tenant_memberships
for update
to authenticated
using (private.is_tenant_admin(tenant_id))
with check (private.is_tenant_admin(tenant_id));

drop policy if exists vehicles_select_member on public.vehicles;
create policy vehicles_select_member
on public.vehicles
for select
to authenticated
using (private.is_tenant_member(tenant_id));

drop policy if exists vehicles_insert_member on public.vehicles;
create policy vehicles_insert_member
on public.vehicles
for insert
to authenticated
with check (private.is_tenant_member(tenant_id));

drop policy if exists vehicles_update_member on public.vehicles;
create policy vehicles_update_member
on public.vehicles
for update
to authenticated
using (private.is_tenant_member(tenant_id))
with check (private.is_tenant_member(tenant_id));

drop policy if exists leads_select_member on public.leads;
create policy leads_select_member
on public.leads
for select
to authenticated
using (private.is_tenant_member(tenant_id));

drop policy if exists leads_insert_member on public.leads;
create policy leads_insert_member
on public.leads
for insert
to authenticated
with check (private.is_tenant_member(tenant_id));

drop policy if exists leads_update_member on public.leads;
create policy leads_update_member
on public.leads
for update
to authenticated
using (private.is_tenant_member(tenant_id))
with check (private.is_tenant_member(tenant_id));

drop policy if exists follow_ups_select_member on public.follow_ups;
create policy follow_ups_select_member
on public.follow_ups
for select
to authenticated
using (private.is_tenant_member(tenant_id));

drop policy if exists follow_ups_insert_member on public.follow_ups;
create policy follow_ups_insert_member
on public.follow_ups
for insert
to authenticated
with check (private.is_tenant_member(tenant_id));

drop policy if exists follow_ups_update_member on public.follow_ups;
create policy follow_ups_update_member
on public.follow_ups
for update
to authenticated
using (private.is_tenant_member(tenant_id))
with check (private.is_tenant_member(tenant_id));

drop policy if exists whatsapp_instances_select_admin on public.whatsapp_instances;
create policy whatsapp_instances_select_admin
on public.whatsapp_instances
for select
to authenticated
using (private.is_tenant_admin(tenant_id));

drop policy if exists whatsapp_instances_insert_admin on public.whatsapp_instances;
create policy whatsapp_instances_insert_admin
on public.whatsapp_instances
for insert
to authenticated
with check (private.is_tenant_admin(tenant_id));

drop policy if exists whatsapp_instances_update_admin on public.whatsapp_instances;
create policy whatsapp_instances_update_admin
on public.whatsapp_instances
for update
to authenticated
using (private.is_tenant_admin(tenant_id))
with check (private.is_tenant_admin(tenant_id));

drop policy if exists billing_subscriptions_select_admin on public.billing_subscriptions;
create policy billing_subscriptions_select_admin
on public.billing_subscriptions
for select
to authenticated
using (private.is_tenant_admin(tenant_id));

drop policy if exists billing_subscriptions_update_admin on public.billing_subscriptions;
create policy billing_subscriptions_update_admin
on public.billing_subscriptions
for update
to authenticated
using (private.is_tenant_admin(tenant_id))
with check (private.is_tenant_admin(tenant_id));

drop policy if exists webhook_events_select_admin on public.webhook_events;
create policy webhook_events_select_admin
on public.webhook_events
for select
to authenticated
using (tenant_id is not null and private.is_tenant_admin(tenant_id));

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_tenants_updated_at on public.tenants;
create trigger set_tenants_updated_at
before update on public.tenants
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_tenant_memberships_updated_at on public.tenant_memberships;
create trigger set_tenant_memberships_updated_at
before update on public.tenant_memberships
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_vehicles_updated_at on public.vehicles;
create trigger set_vehicles_updated_at
before update on public.vehicles
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_follow_ups_updated_at on public.follow_ups;
create trigger set_follow_ups_updated_at
before update on public.follow_ups
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_whatsapp_instances_updated_at on public.whatsapp_instances;
create trigger set_whatsapp_instances_updated_at
before update on public.whatsapp_instances
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_billing_subscriptions_updated_at on public.billing_subscriptions;
create trigger set_billing_subscriptions_updated_at
before update on public.billing_subscriptions
for each row
execute procedure public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
