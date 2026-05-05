import { Users, MessageCircle } from 'lucide-react'
import { getClientSummaries } from '@/server/queries/products'

const AVATAR_COLORS = [
  'bg-green/20 text-green',
  'bg-blue-400/20 text-blue-400',
  'bg-purple-400/20 text-purple-400',
  'bg-orange-400/20 text-orange-400',
  'bg-pink-400/20 text-pink-400',
]

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

export default async function ClientesPage() {
  const clients = await getClientSummaries()

  const totalSpent = clients.reduce((acc, c) => acc + c.total_spent, 0)

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Clientes</h1>
          <p className="font-body text-sm text-slate mt-0.5">
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} · R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em compras
          </p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users size={40} className="text-slate mb-3" strokeWidth={1.25} />
          <p className="font-body text-white font-medium">Nenhum cliente ainda</p>
          <p className="font-body text-sm text-slate mt-1">
            Clientes aparecem aqui conforme você registra vendas nos produtos
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map(client => {
            const color   = avatarColor(client.contact_name)
            const initial = client.contact_name.charAt(0).toUpperCase()
            const waPhone = client.contact_phone?.replace(/\D/g, '')

            return (
              <div
                key={client.contact_phone ?? client.contact_name}
                className="flex items-center gap-4 rounded-xl bg-deep border border-surface px-4 py-3 hover:border-surface/80 transition-colors"
              >
                {/* Avatar */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-base font-bold ${color}`}>
                  {initial}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-white font-medium truncate">
                    {client.contact_name}
                  </p>
                  <p className="font-body text-xs text-slate mt-0.5">
                    {client.purchase_count} compra{client.purchase_count !== 1 ? 's' : ''}
                    {client.contact_phone && ` · ${client.contact_phone}`}
                  </p>
                </div>

                {/* Total + WhatsApp */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="font-body text-sm text-green font-medium">
                      R$ {client.total_spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="font-body text-xs text-slate mt-0.5">
                      última: {new Date(client.last_purchase + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {waPhone && (
                    <a
                      href={`https://wa.me/55${waPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/25 transition-colors"
                    >
                      <MessageCircle size={14} className="text-[#25D366]" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
