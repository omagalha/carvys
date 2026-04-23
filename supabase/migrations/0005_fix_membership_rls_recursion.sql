drop policy if exists tenant_memberships_select_member on public.tenant_memberships;

create policy tenant_memberships_select_own
on public.tenant_memberships
for select
to authenticated
using ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
