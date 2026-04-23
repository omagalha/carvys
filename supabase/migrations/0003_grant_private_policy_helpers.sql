grant usage on schema private to authenticated, service_role;
grant execute on all functions in schema private to authenticated, service_role;

grant execute on function private.is_tenant_member(uuid) to authenticated, service_role;
grant execute on function private.is_tenant_admin(uuid) to authenticated, service_role;
