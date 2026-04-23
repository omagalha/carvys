function required(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env var: ${key}`)
  return value
}

export const env = {
  supabase: {
    url: required('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
  zapi: {
    instanceId: process.env.ZAPI_INSTANCE_ID ?? '',
    token: process.env.ZAPI_TOKEN ?? '',
    webhookSecret: process.env.ZAPI_WEBHOOK_SECRET ?? '',
  },
  asaas: {
    apiKey: process.env.ASAAS_API_KEY ?? '',
    webhookToken: process.env.ASAAS_WEBHOOK_TOKEN ?? '',
  },
} as const
