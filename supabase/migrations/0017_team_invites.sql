-- Clean up duplicate owner memberships — keep the most recently created per user
delete from public.tenant_memberships
where role = 'owner' and status = 'active'
  and id not in (
    select distinct on (user_id) id
    from public.tenant_memberships
    where role = 'owner' and status = 'active'
    order by user_id, created_at desc
  );

-- Prevent a user from being owner of more than one tenant
create unique index if not exists tenant_memberships_unique_owner
  on public.tenant_memberships (user_id)
  where role = 'owner' and status = 'active';

-- Financial visibility permission per membership
alter table public.tenant_memberships
  add column if not exists can_view_financials boolean not null default false;

-- Owners and admins always have financial access
update public.tenant_memberships
  set can_view_financials = true
  where role in ('owner', 'admin');

-- Pending invites for users who don't have a Carvys account yet
create table public.team_invites (
  id                  uuid        primary key default gen_random_uuid(),
  tenant_id           uuid        not null references public.tenants(id) on delete cascade,
  email               text        not null,
  role                tenant_role not null default 'sales',
  can_view_financials boolean     not null default false,
  token               uuid        not null default gen_random_uuid(),
  accepted_at         timestamptz,
  expires_at          timestamptz not null default (now() + interval '7 days'),
  created_at          timestamptz not null default now()
);

-- Only one pending invite per email per tenant
create unique index team_invites_pending_unique
  on public.team_invites (tenant_id, email)
  where accepted_at is null;

create index team_invites_token_idx on public.team_invites (token);
create index team_invites_email_idx on public.team_invites (email);

alter table public.team_invites enable row level security;

create policy "tenant admins manage invites"
  on public.team_invites
  for all
  using  (private.is_tenant_admin(tenant_id))
  with check (private.is_tenant_admin(tenant_id));
