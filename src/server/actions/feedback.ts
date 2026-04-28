'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserTenants } from '@/server/queries/tenants'
import { sendFeedbackEmail } from '@/lib/email'

export async function submitFeedback(formData: FormData) {
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()

  if (!title || !description) return { error: 'Preencha todos os campos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Loja não encontrada.' }

  const tenant = memberships[0].tenants
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  await admin.from('feedback_suggestions').insert({
    tenant_id: tenant.id,
    submitted_by: user.id,
    tenant_name: tenant.name,
    submitter_name: profile?.full_name ?? null,
    submitter_email: user.email ?? null,
    title,
    description,
  })

  try {
    await sendFeedbackEmail({
      tenantName: tenant.name,
      submitterName: profile?.full_name ?? null,
      submitterEmail: user.email ?? null,
      title,
      description,
    })
  } catch {
    // email failure não bloqueia o envio
  }

  revalidatePath('/app/settings')
  return { success: true }
}
