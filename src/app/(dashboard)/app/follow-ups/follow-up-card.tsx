'use client'

import Link from 'next/link'
import { MessageCircle, Phone, Mail, MapPin, Calendar, CheckCircle2 } from 'lucide-react'
import { CompleteButton } from './complete-button'
import type { FollowUpWithLead } from '@/server/queries/follow-ups'
import { isOverdue, formatDue } from '@/lib/follow-ups'

const CHANNEL_ICON: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  phone:    Phone,
  email:    Mail,
  visit:    MapPin,
  outro:    Calendar,
}

export function FollowUpCard({ item }: { item: FollowUpWithLead }) {
  const overdue  = isOverdue(item.due_at, item.status)
  const done     = item.status === 'done'
  const canceled = item.status === 'canceled'
  const ChannelIcon = CHANNEL_ICON[item.channel] ?? Calendar

  return (
    <div className={[
      'flex items-center gap-4 rounded-xl border p-4 transition-colors',
      overdue  ? 'bg-alert/5 border-alert/30' : 'bg-deep border-surface',
      done || canceled ? 'opacity-60' : '',
    ].join(' ')}>
      <div className={[
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
        overdue ? 'bg-alert/15' : 'bg-surface',
      ].join(' ')}>
        <ChannelIcon size={16} className={overdue ? 'text-alert' : 'text-slate'} />
      </div>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className={`font-body font-semibold text-sm truncate ${done ? 'line-through text-slate' : 'text-white'}`}>
          {item.title}
        </span>
        <div className="flex items-center gap-2">
          {item.leads && (
            <Link
              href={`/app/leads/${item.leads.id}`}
              className="font-body text-xs text-slate hover:text-white transition-colors truncate"
            >
              {item.leads.name}
            </Link>
          )}
          <span className="font-body text-xs text-slate shrink-0">·</span>
          <span className={`font-body text-xs shrink-0 ${overdue ? 'text-alert font-medium' : 'text-slate'}`}>
            {formatDue(item.due_at)}
          </span>
        </div>
      </div>

      {item.status === 'pending' && <CompleteButton followUpId={item.id} />}
      {done && <CheckCircle2 size={18} className="text-green shrink-0" />}
    </div>
  )
}
