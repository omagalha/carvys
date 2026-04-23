# CARVYS

Initial architecture baseline for the CARVYS MVP.

CARVYS is a multi-tenant B2B SaaS for small and mid-sized vehicle dealers. The MVP focuses on three core modules:

- Leads
- Vehicles
- Follow-ups

The product direction is:

- dark-first UI
- mobile-first workflows
- premium visual identity
- WhatsApp-centered sales flow
- radical simplicity for daily use

## Recommended stack

- Next.js 16
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide Icons
- React Hook Form + Zod
- TanStack Table
- Supabase
- PostgreSQL + RLS
- Supabase Auth
- Supabase Storage
- Asaas
- Z-API
- Vercel

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Initial Supabase schema blueprint](supabase/migrations/0001_initial_core.sql)

## Immediate next steps

1. Scaffold the Next.js app with the App Router.
2. Connect Supabase SSR auth.
3. Apply the initial database migration.
4. Build the app shell and tenant switcher.
5. Deliver the Leads module first.
