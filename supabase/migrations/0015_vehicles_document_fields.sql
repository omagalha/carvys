alter table public.vehicles
  add column if not exists renavam       text,
  add column if not exists chassis       text,
  add column if not exists motor_number  text,
  add column if not exists fuel          text,
  add column if not exists body_type     text,
  add column if not exists transmission  text,
  add column if not exists doors         integer,
  add column if not exists purchase_date date,
  add column if not exists supplier_name text;
