import * as evo from '@/lib/evolution'

export const CARVYS_OFFICIAL_WHATSAPP_PHONE = '5522997643573'
export const PLATFORM_WHATSAPP_INSTANCE =
  process.env.CARVYS_WHATSAPP_INSTANCE ?? 'carvys-oficial'

export async function sendOfficialPlatformWhatsApp(phone: string, text: string): Promise<void> {
  await evo.sendTextMessage(PLATFORM_WHATSAPP_INSTANCE, phone, text)
}
