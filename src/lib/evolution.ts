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

export async function createInstance(name: string, webhookUrl: string): Promise<void> {
  await req('/instance/create', {
    method: 'POST',
    body: JSON.stringify({
      instanceName: name,
      qrcode:       true,
      integration:  'WHATSAPP-BAILEYS',
      webhook: {
        enabled:          true,
        url:              webhookUrl,
        events:           ['MESSAGES_UPSERT'],
        webhookBase64:    false,
        webhookByEvents:  false,
      },
    }),
  })
}

export async function getQRCode(name: string): Promise<string | null> {
  try {
    const data = await req<{ base64?: string; code?: string; qrcode?: { base64?: string } }>(`/instance/connect/${name}`)
    const raw  = data.base64 ?? data.qrcode?.base64 ?? null
    if (!raw) return null
    return raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`
  } catch {
    return null
  }
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
    const list = Array.isArray(data) ? data : [data]
    const found = list[0] as { instance?: { ownerJid?: string }; ownerJid?: string } | undefined
    const jid = found?.instance?.ownerJid ?? found?.ownerJid ?? null
    return jid?.replace('@s.whatsapp.net', '') ?? null
  } catch {
    return null
  }
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
