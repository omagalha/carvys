import { getActivationRadar } from '@/server/queries/admin'
import { CheckCircle2, Circle, Wifi, WifiOff, MessageCircle, Zap } from 'lucide-react'

function daysColor(days: number) {
  if (days <= 1) return 'text-alert'
  if (days <= 3) return 'text-yellow-400'
  return 'text-slate'
}

function waLink(phone: string, name: string) {
  const msg = encodeURIComponent(
    `Olá! Sou o Thales da Carvys. Vi que você criou sua conta mas ainda não configurou tudo. Posso te ajudar? Leva menos de 5 minutos!`
  )
  return `https://wa.me/55${phone.replace(/\D/g, '')}?text=${msg}`
}

export default async function AtivacaoPage() {
  const tenants = await getActivationRadar()

  const stuck = tenants.filter(t => !t.has_vehicle || !t.whatsapp_connected || !t.has_lead)
  const complete = tenants.filter(t => t.has_vehicle && t.whatsapp_connected && t.has_lead)

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">Radar de ativação</h1>
        <p className="font-body text-sm text-slate mt-0.5">
          Clientes em trial e seu progresso no onboarding
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-deep border border-surface p-4 flex flex-col gap-1">
          <span className="font-body text-xs text-slate uppercase tracking-widest">Em trial</span>
          <span className="font-display font-bold text-white text-3xl">{tenants.length}</span>
        </div>
        <div className="rounded-xl bg-deep border border-alert/20 p-4 flex flex-col gap-1">
          <span className="font-body text-xs text-slate uppercase tracking-widest">Travados</span>
          <span className="font-display font-bold text-alert text-3xl">{stuck.length}</span>
        </div>
        <div className="rounded-xl bg-deep border border-green/20 p-4 flex flex-col gap-1">
          <span className="font-body text-xs text-slate uppercase tracking-widest">Completos</span>
          <span className="font-display font-bold text-green text-3xl">{complete.length}</span>
        </div>
      </div>

      {stuck.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface py-16">
          <Zap size={24} className="text-green" />
          <p className="font-body text-sm text-slate">Todos os trials completaram o onboarding.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-surface">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface">
                <th className="text-left font-body text-xs text-slate px-4 py-3">Loja</th>
                <th className="text-center font-body text-xs text-slate px-3 py-3">Veículo</th>
                <th className="text-center font-body text-xs text-slate px-3 py-3">WhatsApp</th>
                <th className="text-center font-body text-xs text-slate px-3 py-3">Lead</th>
                <th className="text-center font-body text-xs text-slate px-3 py-3">Dias</th>
                <th className="text-right font-body text-xs text-slate px-4 py-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {stuck.map(t => (
                <tr key={t.id} className="border-b border-surface/50 hover:bg-surface/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-body text-sm text-white font-medium">{t.name}</p>
                    <p className="font-body text-[10px] text-slate">/{t.slug}</p>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {t.has_vehicle
                      ? <CheckCircle2 size={16} className="text-green mx-auto" />
                      : <Circle size={16} className="text-slate mx-auto" />
                    }
                  </td>
                  <td className="px-3 py-3 text-center">
                    {t.whatsapp_connected
                      ? <Wifi size={16} className="text-green mx-auto" />
                      : <WifiOff size={16} className="text-slate mx-auto" />
                    }
                  </td>
                  <td className="px-3 py-3 text-center">
                    {t.has_lead
                      ? <CheckCircle2 size={16} className="text-green mx-auto" />
                      : <Circle size={16} className="text-slate mx-auto" />
                    }
                  </td>
                  <td className={`px-3 py-3 text-center font-display font-bold text-lg ${daysColor(t.days_left)}`}>
                    {t.days_left}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.owner_phone && (
                      <a
                        href={waLink(t.owner_phone, t.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-body text-xs transition-colors"
                      >
                        <MessageCircle size={13} />
                        Ajudar
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
