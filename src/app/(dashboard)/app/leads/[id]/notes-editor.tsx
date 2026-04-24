'use client'

import { useState, useTransition } from 'react'
import { updateLeadNotes } from '@/server/actions/leads'

export function NotesEditor({ leadId, initialNotes }: { leadId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSave() {
    setSaved(false)
    startTransition(async () => {
      await updateLeadNotes(leadId, notes, !!initialNotes)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={notes}
        onChange={e => { setNotes(e.target.value); setSaved(false) }}
        rows={5}
        placeholder="Anotações sobre o lead, histórico de conversa..."
        className="w-full rounded-lg border border-surface bg-void px-3 py-2.5 font-body text-sm text-white placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors resize-none"
      />
      <div className="flex items-center justify-between">
        {saved && <span className="font-body text-xs text-green">Salvo</span>}
        {!saved && <span />}
        <button
          onClick={handleSave}
          disabled={pending}
          className="h-8 px-4 rounded-lg bg-surface hover:bg-slate/20 font-body text-xs text-white transition-colors disabled:opacity-50"
        >
          {pending ? 'Salvando...' : 'Salvar notas'}
        </button>
      </div>
    </div>
  )
}
