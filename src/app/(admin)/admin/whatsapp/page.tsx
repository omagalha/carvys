import { createAdminClient } from '@/lib/supabase/admin'
import {
  CARVYS_OFFICIAL_WHATSAPP_PHONE,
  PLATFORM_WHATSAPP_INSTANCE,
} from '@/server/platform-whatsapp'
import { PlatformWhatsAppClient } from './platform-whatsapp-client'

export default async function AdminWhatsAppPage() {
  const admin = createAdminClient()
  const { data: session } = await admin
    .from('platform_whatsapp_sessions')
    .select('status, phone_number')
    .eq('instance_name', PLATFORM_WHATSAPP_INSTANCE)
    .maybeSingle()

  const status =
    session?.status === 'connected' || session?.status === 'connecting'
      ? session.status
      : 'disconnected'

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">WhatsApp</h1>
        <p className="font-body text-sm text-slate mt-0.5">
          Canal oficial da Carvys para suporte e automacoes da plataforma.
        </p>
      </div>

      <PlatformWhatsAppClient
        initialStatus={status}
        initialPhone={session?.phone_number ?? null}
        instanceName={PLATFORM_WHATSAPP_INSTANCE}
        officialPhone={CARVYS_OFFICIAL_WHATSAPP_PHONE}
      />
    </div>
  )
}
