import Link from 'next/link'
import { ArrowLeftRight } from 'lucide-react'
import { getInventoryMovements } from '@/server/queries/products'

const MOVEMENT_INFO: Record<string, { label: string; sign: string; badgeClass: string }> = {
  in:      { label: 'Entrada',   sign: '+', badgeClass: 'bg-green/15 text-green' },
  out:     { label: 'Saída',     sign: '−', badgeClass: 'bg-red-500/15 text-red-400' },
  return:  { label: 'Devolução', sign: '+', badgeClass: 'bg-green/15 text-green' },
  discard: { label: 'Descarte',  sign: '−', badgeClass: 'bg-red-500/15 text-red-400' },
}

export default async function EstoquePage() {
  const movements = await getInventoryMovements()

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Estoque</h1>
          <p className="font-body text-sm text-slate mt-0.5">Histórico de movimentações</p>
        </div>
        <Link
          href="/app/produtos"
          className="font-body text-sm text-slate hover:text-white transition-colors"
        >
          Ver produtos →
        </Link>
      </div>

      {movements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ArrowLeftRight size={40} className="text-slate mb-3" strokeWidth={1.25} />
          <p className="font-body text-white font-medium">Nenhuma movimentação ainda</p>
          <p className="font-body text-sm text-slate mt-1">
            As movimentações aparecem aqui quando você registrar entradas e saídas
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-surface overflow-hidden">
          <div className="divide-y divide-surface">
            {movements.map(mv => {
              const info = MOVEMENT_INFO[mv.type]
              return (
                <div key={mv.id} className="flex items-center gap-4 px-4 py-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${info.badgeClass}`}>
                    <span className="font-display text-sm font-bold">{info.sign}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm text-white font-medium truncate">
                        {mv.products?.name ?? '—'}
                      </p>
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md font-body text-xs font-medium ${info.badgeClass}`}>
                        {info.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-body text-xs text-slate">{mv.quantity} un.</p>
                      {mv.notes && (
                        <>
                          <span className="text-slate text-xs">·</span>
                          <p className="font-body text-xs text-slate truncate">{mv.notes}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="font-body text-xs text-slate shrink-0">
                    {new Date(mv.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
