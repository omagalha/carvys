'use client'

import { useState, useTransition } from 'react'
import { Pencil, X, Check } from 'lucide-react'
import { updateLead } from '@/server/actions/leads'

export function LeadEditor({
  leadId,
  initialName,
  initialPhone,
  initialEmail,
}: {
  leadId: string
  initialName: string
  initialPhone: string
  initialEmail: string | null
}) {
  const [editing, setEditing] = useState(false)
  const [name,  setName]  = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [email, setEmail] = useState(initialEmail ?? '')
  const [pending, startTransition] = useTransition()

  function save() {
    if (!name.trim() || !phone.trim()) return
    startTransition(async () => {
      await updateLead(leadId, { name: name.trim(), phone: phone.trim(), email: email.trim() || null })
      setEditing(false)
    })
  }

  function cancel() {
    setName(initialName)
    setPhone(initialPhone)
    setEmail(initialEmail ?? '')
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 self-start font-body text-xs text-slate hover:text-white transition-colors"
      >
        <Pencil size={11} />
        Editar dados
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs text-slate">Nome</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="h-9 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs text-slate">Telefone</label>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="h-9 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs text-slate">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="opcional"
          className="h-9 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white placeholder:text-slate/40 focus:outline-none focus:border-green transition-colors"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={cancel}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-surface font-body text-xs text-slate hover:text-white transition-colors"
        >
          <X size={12} />
          Cancelar
        </button>
        <button
          onClick={save}
          disabled={pending || !name.trim() || !phone.trim()}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-green font-body text-xs font-semibold text-[#0A0A0F] disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          <Check size={12} />
          {pending ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}
