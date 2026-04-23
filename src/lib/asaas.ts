const BASE_URL =
  process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': process.env.ASAAS_API_KEY!,
      ...options?.headers,
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.errors?.[0]?.description ?? `Asaas error ${res.status}`)
  return json
}

export type AsaasCustomer = { id: string; name: string; email: string }

export type AsaasSubscription = {
  id: string
  status: string
  value: number
  nextDueDate: string
  billingType: string
}

export type AsaasCharge = {
  id: string
  status: string
  value: number
  invoiceUrl: string
  dueDate: string
}

export async function createCustomer(data: {
  name: string
  cpfCnpj: string
  email: string
  phone?: string
}): Promise<AsaasCustomer> {
  return request('/customers', {
    method: 'POST',
    body: JSON.stringify({ ...data, notificationDisabled: false }),
  })
}

export async function createSubscription(data: {
  customer: string
  billingType: 'PIX' | 'BOLETO'
  value: number
  nextDueDate: string
  cycle: 'MONTHLY'
  description: string
}): Promise<AsaasSubscription> {
  return request('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getSubscriptionCharges(subscriptionId: string): Promise<AsaasCharge[]> {
  const data = await request<{ data: AsaasCharge[] }>(`/subscriptions/${subscriptionId}/charges`)
  return data.data ?? []
}
