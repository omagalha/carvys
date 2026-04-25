alter table public.tenants
  add column if not exists contact_email   text,
  add column if not exists contact_phone   text,
  add column if not exists address         text,
  add column if not exists business_hours  text;
