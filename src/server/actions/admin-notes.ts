'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export async function addTenantNote(tenantId: string, formData: FormData) {
  const content = (formData.get('content') as string)?.trim()
  if (!content) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return

  const admin = createAdminClient()
  await admin.from('tenant_notes').insert({
    tenant_id: tenantId,
    content,
    created_by: user.email!,
  })

  revalidatePath(`/admin/clientes/${tenantId}`)
}
