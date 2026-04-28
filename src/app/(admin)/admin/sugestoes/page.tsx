import { getAllFeedback } from '@/server/queries/feedback'
import { Lightbulb, Mail } from 'lucide-react'

const STATUS_LABEL: Record<string, string> = {
  pending:   'Recebida',
  reviewing: 'Em análise',
  planned:   'Planejada',
  done:      'Implementada',
}

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-surface text-slate',
  reviewing: 'bg-blue-500/15 text-blue-400',
  planned:   'bg-yellow-500/15 text-yellow-400',
  done:      'bg-green/15 text-green',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function SugestoesPage() {
  const suggestions = await getAllFeedback()

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">Sugestões</h1>
        <p className="font-body text-sm text-slate mt-0.5">
          {suggestions.length} sugestão{suggestions.length !== 1 ? 'ões' : ''} enviada{suggestions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface py-16">
          <Lightbulb size={24} className="text-slate" />
          <p className="font-body text-sm text-slate">Nenhuma sugestão ainda</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {suggestions.map(s => (
            <div
              key={s.id}
              className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body font-semibold text-white text-base">{s.title}</span>
                    <span className={`font-body text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </div>
                  <p className="font-body text-xs text-slate mt-1">{formatDate(s.created_at)}</p>
                </div>
              </div>

              <p className="font-body text-sm text-slate/80 whitespace-pre-wrap">{s.description}</p>

              <div className="flex flex-wrap gap-4 pt-1 border-t border-surface">
                <span className="font-body text-xs text-slate">{s.tenant_name}</span>
                {s.submitter_name && (
                  <span className="font-body text-xs text-slate">{s.submitter_name}</span>
                )}
                {s.submitter_email && (
                  <a
                    href={`mailto:${s.submitter_email}`}
                    className="font-body text-xs text-slate flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Mail size={11} />
                    {s.submitter_email}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
