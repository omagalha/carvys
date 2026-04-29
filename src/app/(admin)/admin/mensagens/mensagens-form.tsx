'use client'

import { useRef, useState, useTransition } from 'react'
import { Send, CheckCircle2, Users, User } from 'lucide-react'
import { sendAdminWhatsApp } from '@/server/actions/admin'

const GROUPS = [
  { value: 'trial',    label: 'Todos em trial',        description: 'Clientes no período gratuito' },
  { value: 'past_due', label: 'Todos inadimplentes',   description: 'Clientes com pagamento atrasado' },
  { value: 'active',   label: 'Todos ativos',          description: 'Clientes com assinatura ativa' },
  { value: 'specific', label: 'Cliente específico',    description: 'Escolha um cliente na lista' },
]

interface Tenant { id: string; name: string; status: string }

export function MensagensForm({ tenants }: { tenants: Tenant[] }) {
  const [group, setGroup]       = useState('trial')
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await sendAdminWhatsApp(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSent(true)
        formRef.current?.reset()
        setGroup('trial')
        setTimeout(() => setSent(false), 4000)
      }
    })
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-5">
      {/* Grupo */}
      <div className="flex flex-col gap-2">
        <label className="font-body text-xs font-medium text-slate">Destinatário</label>
        <div className="grid grid-cols-2 gap-2">
          {GROUPS.map(g => (
            <button
              key={g.value}
              type="button"
              onClick={() => setGroup(g.value)}
              className={`flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors ${
                group === g.value
                  ? 'border-green/40 bg-green/5'
                  : 'border-surface bg-deep hover:border-slate/40'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {g.value === 'specific' ? <User size={12} className="text-slate" /> : <Users size={12} className="text-slate" />}
                <span className="font-body text-xs font-semibold text-white">{g.label}</span>
              </div>
              <span className="font-body text-[10px] text-slate leading-tight">{g.description}</span>
            </button>
          ))}
        </div>
        <input type="hidden" name="group" value={group} />
      </div>

      {/* Cliente específico */}
      {group === 'specific' && (
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-medium text-slate">Cliente</label>
          <select
            name="tenant_id"
            required
            className="h-10 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors"
          >
            <option value="">Selecione um cliente...</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
            ))}
          </select>
        </div>
      )}

      {/* Mensagem */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs font-medium text-slate">Mensagem</label>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={1000}
          placeholder="Digite a mensagem que será enviada via WhatsApp..."
          className="rounded-lg border border-surface bg-surface/50 px-3 py-2.5 font-body text-sm text-white placeholder:text-slate/50 focus:outline-none focus:border-green/40 transition-colors resize-none"
        />
      </div>

      {error && <p className="font-body text-xs text-alert">{error}</p>}

      {sent && (
        <div className="flex items-center gap-2 text-green">
          <CheckCircle2 size={16} />
          <span className="font-body text-sm">Mensagem enviada com sucesso.</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 self-start h-10 px-5 rounded-lg bg-green text-void font-body font-semibold text-sm hover:bg-green/90 disabled:opacity-50 transition-colors"
      >
        <Send size={14} />
        {pending ? 'Enviando...' : 'Enviar mensagem'}
      </button>
    </form>
  )
}
