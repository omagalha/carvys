create schema if not exists private;

grant usage on schema public to authenticated, service_role;
grant usage on schema private to authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on all functions in schema public to authenticated, service_role;
grant execute on all functions in schema private to authenticated, service_role;

alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated, service_role;

alter default privileges in schema public
grant usage, select on sequences to authenticated, service_role;

alter default privileges in schema public
grant execute on functions to authenticated, service_role;

create or replace function public.create_tenant_with_owner(
  p_name text,
  p_slug text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tenant_id uuid := gen_random_uuid();
begin
  if v_user_id is null then
    raise exception 'User must be authenticated'
      using errcode = '42501';
  end if;

  if coalesce(trim(p_name), '') = '' then
    raise exception 'Tenant name is required'
      using errcode = '22023';
  end if;

  if coalesce(trim(p_slug), '') = '' then
    raise exception 'Tenant slug is required'
      using errcode = '22023';
  end if;

  insert into public.tenants (id, name, slug)
  values (v_tenant_id, trim(p_name), trim(p_slug));

  insert into public.tenant_memberships (tenant_id, user_id, role, status)
  values (v_tenant_id, v_user_id, 'owner', 'active');

  return v_tenant_id;
end;
$$;

grant execute on function public.create_tenant_with_owner(text, text) to authenticated, service_role;
