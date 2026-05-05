-- 0027: vendas de produtos (makeup store)

create table if not exists public.product_sales (
  id            uuid        primary key default gen_random_uuid(),
  tenant_id     uuid        not null references public.tenants(id) on delete cascade,
  product_id    uuid        not null references public.products(id) on delete cascade,
  contact_name  text        not null,
  contact_phone text,
  quantity      integer     not null check (quantity > 0),
  unit_price    numeric(12, 2) not null default 0,
  notes         text,
  sold_at       date        not null default current_date,
  created_at    timestamptz not null default timezone('utc', now())
);

create index if not exists product_sales_tenant_id_idx
  on public.product_sales(tenant_id);

create index if not exists product_sales_product_id_idx
  on public.product_sales(product_id);

create index if not exists product_sales_contact_phone_idx
  on public.product_sales(tenant_id, contact_phone);

alter table public.product_sales enable row level security;

drop policy if exists product_sales_select_member on public.product_sales;
create policy product_sales_select_member on public.product_sales
  for select to authenticated using (private.is_tenant_member(tenant_id));

drop policy if exists product_sales_insert_member on public.product_sales;
create policy product_sales_insert_member on public.product_sales
  for insert to authenticated with check (private.is_tenant_member(tenant_id));

drop policy if exists product_sales_delete_admin on public.product_sales;
create policy product_sales_delete_admin on public.product_sales
  for delete to authenticated using (private.is_tenant_admin(tenant_id));
