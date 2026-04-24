import { GitCommitHorizontal, UserPlus, ArrowRight, FileText, CheckCircle2, Calendar } from 'lucide-react'
import type { LeadEvent } from '@/server/queries/lead-events'
import type { FollowUp } from '@/server/queries/follow-ups'

type TimelineItem = {
  id: string
  date: string
  description: string
  kind: 'created' | 'stage_change' | 'note' | 'follow_up_done' | 'follow_up_pending'
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins < 1)   return 'agora mesmo'
  if (mins < 60)  return `há ${mins} min`
  if (hours < 24) return `há ${hours}h`
  if (days === 1) return 'ontem'
  if (days < 30)  return `há ${days} dias`
  const months = Math.floor(days / 30)
  return `há ${months} ${months === 1 ? 'mês' : 'meses'}`
}

const KIND_STYLE = {
  created:          { color: 'bg-green',        icon: UserPlus,           text: 'text-green' },
  stage_change:     { color: 'bg-blue-400',     icon: ArrowRight,         text: 'text-blue-400' },
  note:             { color: 'bg-slate',         icon: FileText,           text: 'text-slate' },
  follow_up_done:   { color: 'bg-green',         icon: CheckCircle2,       text: 'text-green' },
  follow_up_pending:{ color: 'bg-yellow-400/60', icon: Calendar,           text: 'text-yellow-400' },
}

function buildItems(
  events: LeadEvent[],
  followUps: FollowUp[],
  leadCreatedAt: string,
): TimelineItem[] {
  const items: TimelineItem[] = []

  // Events from lead_events table
  for (const e of events) {
    items.push({
      id:          `ev-${e.id}`,
      date:        e.created_at,
      description: e.description,
      kind:        e.type as TimelineItem['kind'],
    })
  }

  // Follow-ups
  for (const f of followUps) {
    items.push({
      id:          `fu-${f.id}`,
      date:        f.status === 'done' ? f.due_at : f.due_at,
      description: f.status === 'done'
        ? `${f.title} · concluído`
        : `${f.title} · agendado`,
      kind: f.status === 'done' ? 'follow_up_done' : 'follow_up_pending',
    })
  }

  // Fallback: always show lead creation even for old leads without events
  const hasCreatedEvent = events.some(e => e.type === 'created')
  if (!hasCreatedEvent) {
    items.push({
      id:          'lead-created',
      date:        leadCreatedAt,
      description: 'Lead criado',
      kind:        'created',
    })
  }

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function Timeline({
  events,
  followUps,
  leadCreatedAt,
}: {
  events: LeadEvent[]
  followUps: FollowUp[]
  leadCreatedAt: string
}) {
  const items = buildItems(events, followUps, leadCreatedAt)

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
      <div className="flex items-center gap-2">
        <GitCommitHorizontal size={14} className="text-slate" />
        <h2 className="font-body font-semibold text-white text-sm">Histórico</h2>
        <span className="ml-auto font-body text-xs text-slate">{items.length} evento{items.length !== 1 ? 's' : ''}</span>
      </div>

      {items.length === 0 ? (
        <p className="font-body text-xs text-slate">Nenhuma atividade registrada.</p>
      ) : (
        <div className="flex flex-col">
          {items.map((item, i) => {
            const style = KIND_STYLE[item.kind]
            const Icon  = style.icon
            const isLast = i === items.length - 1

            return (
              <div key={item.id} className="flex gap-3">
                {/* Dot + line */}
                <div className="flex flex-col items-center pt-0.5">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${style.color}`} />
                  {!isLast && <div className="w-px flex-1 bg-surface/70 my-1" />}
                </div>

                {/* Content */}
                <div className={`flex flex-1 items-start justify-between gap-2 ${isLast ? 'pb-0' : 'pb-3'}`}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon size={11} className={`${style.text} shrink-0`} />
                    <span className="font-body text-xs text-white leading-relaxed">{item.description}</span>
                  </div>
                  <span className="font-body text-[10px] text-slate shrink-0 mt-0.5">
                    {relativeTime(item.date)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
