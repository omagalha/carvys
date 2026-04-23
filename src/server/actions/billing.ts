'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createCustomer, createSubscription, getSubscriptionCharges } from '@/lib/asaas'
import { getUserTenants } from '@/server/queries/tenants'

const PLAN_PRICE: Record<string, number> = {
  starter: 97,
  pro: 147,
  elite: 297,
}

const PLAN_LABEL: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  elite: 'Elite',
}

export type BillingState = { error: string; paymentUrl?: string }

export async function subscribePlan(
  _state: BillingState,
  formData: FormData
): Promise<BillingState> {
  const planCode   = formData.get('plan_code') as string
  const cpfCnpj    = (formData.get('cpf_cnpj') as string).replace(/\D/g, '')
  const billingType = formData.get('billing_type') as 'PIX' | 'BOLETO'

  if (!PLAN_PRICE[planCode]) return { error: 'Plano inválido.' }
  if (!cpfCnpj || (cpfCnpj.length !== 11 && cpfCnpj.length !== 14)) {
    return { error: 'CPF ou CNPJ inválido.' }
  }
  if (!['PIX', 'BOLETO'].includes(billingType)) return { error: 'Forma de pagamento inválida.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada.' }

  const memberships = await getUserTenants()
  if (!memberships.length) return { error: 'Nenhuma loja encontrada.' }

  const tenant = memberships[0].tenants
  const admin  = createAdminClient()

  const { data: tenantData } = await admin
    .from('tenants')
    .select('asaas_customer_id, asaas_subscription_id')
    .eq('id', tenant.id)
    .single()

  try {
    // Criar ou reutilizar cliente Asaas
    let customerId = tenantData?.asaas_customer_id as string | null

    if (!customerId) {
      const { data: profile } = await admin
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single()

      const customer = await createCustomer({
        name: profile?.full_name ?? tenant.name,
        cpfCnpj,
        email: user.email!,
        phone: profile?.phone?.replace(/\D/g, ''),
      })
      customerId = customer.id

      await admin.from('tenants').update({ asaas_customer_id: customerId }).eq('id', tenant.id)
    }

    // Criar assinatura
    const nextDueDate = new Date()
    nextDueDate.setDate(nextDueDate.getDate() + 1)
    const dueDateStr = nextDueDate.toISOString().split('T')[0]

    const subscription = await createSubscription({
      customer: customerId,
      billingType,
      value: PLAN_PRICE[planCode],
      nextDueDate: dueDateStr,
      cycle: 'MONTHLY',
      description: `Carvys ${PLAN_LABEL[planCode]} — R$${PLAN_PRICE[planCode]}/mês`,
    })

    await admin
      .from('tenants')
      .update({ asaas_subscription_id: subscription.id, plan_code: planCode })
      .eq('id', tenant.id)

    // Pegar link de pagamento da primeira cobrança
    const charges = await getSubscriptionCharges(subscription.id)
    const firstCharge = charges[0]

    if (!firstCharge?.invoiceUrl) return { error: 'Erro ao gerar link de pagamento.' }

    return { error: '', paymentUrl: firstCharge.invoiceUrl }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao processar assinatura.'
    console.error('[subscribePlan]', message)
    return { error: message }
  }
}
