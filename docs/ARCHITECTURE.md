# CARVYS Architecture

## 1. Product scope

CARVYS is a multi-tenant SaaS for vehicle dealers. The MVP should solve:

- lead disorganization
- weak stock control
- inconsistent follow-up
- missed sales due to no reminder system

The first release should optimize for speed, clarity, and mobile execution.

## 2. Core product principles

- Single shared app for all tenants in the MVP.
- Single shared database with strict tenant isolation through RLS.
- Mobile-first flows, desktop enhanced.
- WhatsApp is a first-class sales channel.
- Every core action should be possible in one or two taps on mobile.
- Avoid heavy back-office behavior in daily-use screens.

## 3. System overview

The initial architecture should use a BFF-style Next.js app on Vercel with Supabase as the backend platform.

```text
Browser / Mobile Web
    |
    v
Next.js App Router on Vercel
    |- Server Components for reads
    |- Server Actions for mutations
    |- Route Handlers for webhooks and integration callbacks
    |
    v
Supabase
    |- Postgres
    |- RLS
    |- Auth
    |- Storage
    |
    +--> Asaas
    +--> Z-API
```

## 4. Architectural decisions

### 4.1 Frontend

- Use Next.js App Router.
- Prefer Server Components for authenticated read-heavy screens.
- Use Client Components only where interactivity is required.
- Use Server Actions for internal mutations such as lead creation, vehicle updates, and follow-up completion.
- Use route handlers for external webhooks and provider callbacks.

### 4.2 Backend

- Do not create a separate backend repository for the MVP.
- Keep business logic close to the Next.js app.
- Use Supabase as the primary data and auth layer.
- Use service-role access only in privileged server-side flows such as webhooks, provisioning, and maintenance jobs.

### 4.3 Multi-tenancy

- Start with shared tables and a mandatory `tenant_id` on all business tables.
- Do not use tenant-specific schemas for the MVP.
- Do not use subdomains in v1.
- Use a workspace switcher in the app and store the active tenant in a secure cookie.
- Always validate the active tenant on the server against `tenant_memberships`.

This keeps the MVP simpler while still giving strong isolation and a clean upgrade path.

## 5. Tenant model

The tenant model should be:

- `tenants`: each dealer account or dealership group
- `profiles`: app-level user profile linked to `auth.users`
- `tenant_memberships`: relation between users and tenants

Roles for v1:

- `owner`: billing, settings, team, integrations
- `admin`: daily management, users, stock, leads
- `sales`: operational access to leads, follow-ups, and vehicles

## 6. Domain modules

### 6.1 Leads

Primary responsibilities:

- create and edit leads
- track source and stage
- assign salesperson
- open WhatsApp quickly
- schedule next contact

Core entity fields:

- name
- phone
- email
- source
- stage
- assigned_user_id
- next_follow_up_at
- last_contact_at
- interest_vehicle_id

### 6.2 Vehicles

Primary responsibilities:

- register vehicle stock
- track price and status
- mark highlights
- attach media
- link interested leads

Core entity fields:

- brand
- model
- version
- year
- mileage
- price
- status
- featured
- cover_image_path

### 6.3 Follow-ups

Primary responsibilities:

- create reminders
- show due and overdue work
- close completed follow-ups
- keep the salesperson focused on today

Core entity fields:

- lead_id
- assigned_user_id
- due_at
- status
- channel
- notes

### 6.4 WhatsApp integration

Primary responsibilities:

- connect one number per tenant in the MVP
- receive inbound events
- open outbound conversations fast
- later support message timeline and automation

Important implementation note:

- Z-API should be wrapped behind an internal provider adapter such as `WhatsAppProvider`.
- The rest of the app should never depend directly on Z-API request formats.

### 6.5 Billing

Primary responsibilities:

- track plan and subscription status
- receive payment events
- lock or warn on account delinquency later

Important implementation note:

- Asaas should be handled in a webhook-first way.
- Subscription state should be derived from billing events, not manual dashboard state.

## 7. Route map

Suggested route map for the first version:

```text
/
/pricing
/login
/signup
/invite/accept

/app
/app/dashboard
/app/leads
/app/leads/[leadId]
/app/vehicles
/app/vehicles/[vehicleId]
/app/follow-ups
/app/settings
/app/settings/team
/app/settings/whatsapp
/app/settings/billing

/api/webhooks/asaas
/api/webhooks/zapi/[tenantId]
```

## 8. App folder strategy

Suggested project structure:

```text
src/
  app/
    (marketing)/
    (auth)/
    (dashboard)/
      app/
        dashboard/
        leads/
        vehicles/
        follow-ups/
        settings/
    api/
      webhooks/
        asaas/
        zapi/
  components/
    ui/
    layout/
    shared/
  features/
    auth/
    tenants/
    leads/
    vehicles/
    follow-ups/
    whatsapp/
    billing/
  lib/
    env.ts
    utils.ts
    validations/
    supabase/
      browser.ts
      server.ts
      middleware.ts
  server/
    actions/
    queries/
    integrations/
      asaas/
      zapi/
  types/
```

## 9. Data access strategy

### Reads

- Prefer Server Components for dashboard, lists, counters, and detail pages.
- Use query helpers in `server/queries`.
- Scope every read by the validated active tenant.

### Writes

- Use Server Actions for internal authenticated writes.
- Validate payloads with Zod before mutations.
- Keep mutations feature-local where possible.

### External events

- Use route handlers for Asaas and Z-API.
- Persist raw webhook payloads before processing.
- Make processing idempotent by storing provider event IDs.
- Return fast `200` responses and continue heavy work asynchronously where possible.

## 10. Security model

### 10.1 Auth

- Use Supabase Auth with SSR helpers.
- Store session in cookies.
- Keep auth checks on the server for protected routes.

### 10.2 Authorization

- RLS enabled on every exposed business table.
- Every business row must include `tenant_id`.
- Policies must validate membership through `tenant_memberships`.
- Admin-only resources must use stronger policies than operational resources.

### 10.3 Secrets

- Never expose the Supabase service-role key to the browser.
- Keep Asaas and Z-API tokens server-side only.
- Use webhook secrets or provider tokens to validate inbound calls.

## 11. Active tenant handling

Because one user may belong to multiple tenants, the app needs an explicit active workspace model.

Recommended approach:

1. User logs in.
2. Server loads accessible tenants from `tenant_memberships`.
3. If only one tenant exists, use it automatically.
4. If multiple tenants exist, use a tenant switcher.
5. Persist the selected tenant in a secure HTTP-only cookie.
6. On every protected request, revalidate that cookie against database membership.

This is simpler and safer than encoding the active tenant into client-only state.

## 12. UI architecture notes

- Use `Syne` for brand moments such as hero, empty states, and key numbers.
- Use `DM Sans` for forms, tables, body copy, and app chrome.
- Reserve `#C8F135` for primary actions and high-value highlights.
- Use cards, lists, and bottom-sheet patterns on mobile.
- Use TanStack Table only where density matters on desktop, especially admin and stock pages.

## 13. Initial data model

The first schema should include:

- `profiles`
- `tenants`
- `tenant_memberships`
- `vehicles`
- `leads`
- `follow_ups`
- `whatsapp_instances`
- `billing_subscriptions`
- `webhook_events`

See the SQL blueprint in `supabase/migrations/0001_initial_core.sql`.

## 14. Integration flows

### 14.1 Lead created manually

1. User opens lead quick-create.
2. Form validates with Zod.
3. Server Action inserts lead with active `tenant_id`.
4. Optional follow-up is created in the same transaction.
5. User is redirected to the lead detail page or WhatsApp action.

### 14.2 Lead touched by WhatsApp

1. Z-API sends webhook to `/api/webhooks/zapi/[tenantId]`.
2. Raw event is persisted into `webhook_events`.
3. Event is normalized through the internal WhatsApp adapter.
4. Existing lead is matched by phone or a new lead is created later if desired.
5. Follow-up freshness and last-contact metadata are updated.

### 14.3 Billing update

1. Asaas sends payment event webhook.
2. Raw event is persisted.
3. Event is processed idempotently.
4. Subscription state in `billing_subscriptions` is updated.
5. Tenant account flags can be updated later if needed.

## 15. Delivery order

Recommended build order:

1. App scaffold and design tokens
2. Supabase SSR auth
3. Tenant model and RLS
4. App shell and tenant switcher
5. Leads module
6. Vehicles module
7. Follow-ups module
8. Asaas integration
9. Z-API integration
10. Reports and refinements

## 16. Non-goals for v1

Avoid these in the first release:

- custom tenant domains
- advanced CRM automation
- full omnichannel inbox
- deep BI dashboards
- complex role matrices beyond owner/admin/sales
- tenant-specific schemas

The first release should prove usage, retention, and payment.
