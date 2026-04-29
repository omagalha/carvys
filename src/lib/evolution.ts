const BASE = process.env.EVOLUTION_API_URL ?? ''
const KEY  = process.env.EVOLUTION_API_KEY  ?? ''

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', apikey: KEY, ...init?.headers },
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message ?? `Evolution API ${res.status}`)
  }
  return res.json()
}

function qrFromResponse(data: {
  base64?: string
  code?: string
  qrcode?: { base64?: string; code?: string }
}): string | null {
  const raw = data.base64 ?? data.qrcode?.base64 ?? null
  if (!raw) return null
  return raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`
}

export async function createInstance(name: string): Promise<string | null> {
  const data = await req<{
    base64?: string
    code?: string
    qrcode?: { base64?: string; code?: string }
  }>('/instance/create', {
    method: 'POST',
    body: JSON.stringify({
      instanceName: name,
      qrcode:       true,
      integration:  'WHATSAPP-BAILEYS',
    }),
  })
  return qrFromResponse(data)
}

export async function getQRCode(name: string): Promise<string | null> {
  try {
    const data = await req<{
      base64?: string
      code?: string
      qrcode?: { base64?: string; code?: string }
      pairingCode?: string | null
    }>(`/instance/connect/${name}`)
    return qrFromResponse(data)
  } catch (e) {
    console.error('[evolution] getQRCode error:', e)
    return null
  }
}

export async function waitForQRCode(name: string, attempts = 6, delayMs = 1500): Promise<string | null> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const qr = await getQRCode(name)
    if (qr) return qr
    if (attempt < attempts - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  return null
}

export async function getConnectionState(name: string): Promise<'open' | 'connecting' | 'close'> {
  try {
    const data = await req<{ instance?: { state?: string; connectionStatus?: string } }>(`/instance/connectionState/${name}`)
    const s = data.instance?.state ?? data.instance?.connectionStatus
    if (s === 'open') return 'open'
    if (s === 'connecting') return 'connecting'
    return 'close'
  } catch {
    return 'close'
  }
}

export async function getOwnerPhone(name: string): Promise<string | null> {
  try {
    const data = await req<unknown>(`/instance/fetchInstances?instanceName=${name}`)
    const response = data as { value?: unknown[] }
    const list = Array.isArray(data) ? data : Array.isArray(response.value) ? response.value : [data]
    const found = list[0] as { instance?: { ownerJid?: string }; ownerJid?: string } | undefined
    const jid = found?.instance?.ownerJid ?? found?.ownerJid ?? null
    return jid?.replace('@s.whatsapp.net', '') ?? null
  } catch {
    return null
  }
}

export async function setWebhook(name: string, url: string, webhookHeaders?: Record<string, string>): Promise<void> {
  await req(`/webhook/set/${name}`, {
    method: 'POST',
    body: JSON.stringify({
      enabled: true,
      url,
      events: ['MESSAGES_UPSERT'],
      webhook_by_events: false,
      webhook_base64: false,
      ...(webhookHeaders ? { headers: webhookHeaders } : {}),
    }),
  })
}

export async function deleteInstance(name: string): Promise<void> {
  await req(`/instance/delete/${name}`, { method: 'DELETE' })
}

export async function sendTextMessage(instance: string, phone: string, text: string): Promise<void> {
  const digits = phone.replace(/\D/g, '')
  const number = digits.startsWith('55') ? digits : `55${digits}`
  await req(`/message/sendText/${instance}`, {
    method: 'POST',
    body: JSON.stringify({ number, text }),
  })
}
