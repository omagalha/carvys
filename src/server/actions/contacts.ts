'use server'

import { getContacts } from '@/server/queries/contacts'
import { getUserTenants } from '@/server/queries/tenants'
import type { LeadWithVehicle } from '@/server/queries/leads'

export async function fetchContactsAction(search?: string): Promise<LeadWithVehicle[]> {
  const memberships = await getUserTenants()
  if (!memberships.length) return []
  const tenant = memberships[0].tenants as { id: string }
  return getContacts(tenant.id, search || undefined)
}
