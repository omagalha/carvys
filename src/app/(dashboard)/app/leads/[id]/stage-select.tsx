'use client'

import { useState, useTransition } from 'react'
import { updateLeadStage } from '@/server/actions/leads'

const OPTIONS = [
  { value: 'new',         label: 'Novo' },
  { value: 'contacted',   label: 'Contatado' },
  { value: 'negotiating', label: 'Negociando' },
  { value: 'won',         label: 'Ganho' },
  { value: 'lost',        label: 'Perdido' },
]

const STAGE_COLOR: Record<string, string> = {
  new:         'text-slate',
  contacted:   'text-blue-400',
  negotiating: 'text-yellow-400',
  won:         'text-green',
  lost:        'text-alert',
}

export function StageSelect({ leadId, currentStage }: { leadId: string; currentStage: string }) {
  const [stage, setStage] = useState(currentStage)
  const [pending, startTransition] = useTransition()

  function handleChange(value: string) {
    setStage(value)
    startTransition(async () => {
      await updateLeadStage(leadId, value)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={stage}
        onChange={e => handleChange(e.target.value)}
        disabled={pending}
        className={`h-10 flex-1 rounded-lg border border-surface bg-void px-3 font-body text-sm focus:outline-none focus:border-green transition-colors disabled:opacity-60 ${STAGE_COLOR[stage]}`}
      >
        {OPTIONS.map(o => (
          <option key={o.value} value={o.value} className="text-white">{o.label}</option>
        ))}
      </select>
      {pending && <span className="font-body text-xs text-slate">Salvando...</span>}
    </div>
  )
}
