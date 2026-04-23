create schema if not exists private;

grant usage on schema private to authenticated, service_role;

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

grant execute on function private.is_tenant_member(uuid) to authenticated, service_role;
grant execute on function private.is_tenant_admin(uuid) to authenticated, service_role;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tenant_memberships'
  loop
    execute format(
      'drop policy if exists %I on public.tenant_memberships',
      policy_record.policyname
    );
  end loop;

  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tenants'
  loop
    execute format(
      'drop policy if exists %I on public.tenants',
      policy_record.policyname
    );
  end loop;
end;
$$;

create policy tenant_memberships_select_own
on public.tenant_memberships
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy tenant_memberships_insert_admin
on public.tenant_memberships
for insert
to authenticated
with check (private.is_tenant_admin(tenant_id));

create policy tenant_memberships_update_admin
on public.tenant_memberships
for update
to authenticated
using (private.is_tenant_admin(tenant_id))
with check (private.is_tenant_admin(tenant_id));

create policy tenants_select_member
on public.tenants
for select
to authenticated
using (private.is_tenant_member(id));

create policy tenants_update_admin
on public.tenants
for update
to authenticated
using (private.is_tenant_admin(id))
with check (private.is_tenant_admin(id));

notify pgrst, 'reload schema';
