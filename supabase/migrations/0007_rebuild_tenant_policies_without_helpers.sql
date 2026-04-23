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

create policy tenants_select_by_membership
on public.tenants
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = tenants.id
      and tm.user_id = (select auth.uid())
      and tm.status = 'active'
  )
);

create policy tenants_update_by_admin_membership
on public.tenants
for update
to authenticated
using (
  exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = tenants.id
      and tm.user_id = (select auth.uid())
      and tm.status = 'active'
      and tm.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = tenants.id
      and tm.user_id = (select auth.uid())
      and tm.status = 'active'
      and tm.role in ('owner', 'admin')
  )
);

notify pgrst, 'reload schema';
