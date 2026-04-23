do $$
begin
  if not exists (select 1 from pg_type where typname = 'tenant_status') then
    create type public.tenant_status as enum ('trial', 'active', 'past_due', 'canceled');
  end if;
end
$$;

alter table public.tenants
  add column if not exists plan_code text not null default 'trial';

alter table public.tenants
  add column if not exists status public.tenant_status not null default 'trial';

alter table public.tenants
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.tenants
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

notify pgrst, 'reload schema';
