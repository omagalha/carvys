-- 0026: business_type em tenants + tabelas de maquiagem (products + inventory_movements)

alter table public.tenants
  add column if not exists business_type text not null default 'car_dealer';

-- Products
create table if not exists public.products (
  id               uuid        primary key default gen_random_uuid(),
  tenant_id        uuid        not null references public.tenants(id) on delete cascade,
  name             text        not null,
  sku              text,
  category         text,
  brand            text,
  supplier         text,
  cost_price       numeric(12, 2),
  sale_price       numeric(12, 2),
  photo_path       text,
  manufacture_date date,
  expiry_date      date,
  quantity         integer     not null default 0,
  min_quantity     integer     not null default 0,
  created_at       timestamptz not null default timezone('utc', now()),
  updated_at       timestamptz not null default timezone('utc', now())
);

-- Inventory movements
create table if not exists public.inventory_movements (
  id           uuid        primary key default gen_random_uuid(),
  tenant_id    uuid        not null references public.tenants(id) on delete cascade,
  product_id   uuid        not null references public.products(id) on delete cascade,
  type         text        not null check (type in ('in', 'out', 'return', 'discard')),
  quantity     integer     not null check (quantity > 0),
  notes        text,
  performed_by uuid        references auth.users(id) on delete set null,
  created_at   timestamptz not null default timezone('utc', now())
);

-- Indexes
create index if not exists products_tenant_id_idx
  on public.products(tenant_id);

create index if not exists products_tenant_id_expiry_idx
  on public.products(tenant_id, expiry_date);

create index if not exists inventory_movements_tenant_id_idx
  on public.inventory_movements(tenant_id);

create index if not exists inventory_movements_product_id_idx
  on public.inventory_movements(product_id);

-- RLS
alter table public.products enable row level security;
alter table public.inventory_movements enable row level security;

drop policy if exists products_select_member on public.products;
create policy products_select_member on public.products
  for select to authenticated using (private.is_tenant_member(tenant_id));

drop policy if exists products_insert_member on public.products;
create policy products_insert_member on public.products
  for insert to authenticated with check (private.is_tenant_member(tenant_id));

drop policy if exists products_update_member on public.products;
create policy products_update_member on public.products
  for update to authenticated
  using (private.is_tenant_member(tenant_id))
  with check (private.is_tenant_member(tenant_id));

drop policy if exists products_delete_admin on public.products;
create policy products_delete_admin on public.products
  for delete to authenticated using (private.is_tenant_admin(tenant_id));

drop policy if exists inventory_movements_select_member on public.inventory_movements;
create policy inventory_movements_select_member on public.inventory_movements
  for select to authenticated using (private.is_tenant_member(tenant_id));

drop policy if exists inventory_movements_insert_member on public.inventory_movements;
create policy inventory_movements_insert_member on public.inventory_movements
  for insert to authenticated with check (private.is_tenant_member(tenant_id));

-- Trigger
drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();
