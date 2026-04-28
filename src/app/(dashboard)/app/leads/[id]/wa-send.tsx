'use client'

import { useState, useTransition } from 'react'
import { Send, X, Loader2 } from 'lucide-react'
import { sendWhatsAppMessage } from '@/server/actions/whatsapp'

type Props = {
  leadId:      string
  phone:       string
  leadName?:   string
  vehicleName?: string
  stage?:      string
}

function suggestMessage(name: string, vehicle?: string, stage?: string): string {
  const first = name.split(' ')[0]
  if (stage === 'new' || !stage) {
    return vehicle
      ? `Olá ${first}! Vi que você se interessou pelo ${vehicle}. Ele ainda está disponível! Posso te enviar mais detalhes ou uma simulação de financiamento? 😊`
      : `Olá ${first}! Obrigado pelo contato. Como posso te ajudar hoje? 😊`
  }
  if (stage === 'contacted') {
    return vehicle
      ? `Oi ${first}! Passando pra saber se ainda tem interesse no ${vehicle}. Tem alguma dúvida que posso esclarecer? 😊`
      : `Oi ${first}! Passando pra ver se posso te ajudar com mais alguma coisa.`
  }
  if (stage === 'negotiating') {
    return vehicle
      ? `Oi ${first}! Como está a análise da proposta pro ${vehicle}? Posso tentar melhorar as condições pra você 🤝`
      : `Oi ${first}! Como está a análise da nossa proposta? Tem alguma dúvida?`
  }
  return vehicle
    ? `Oi ${first}! Tudo bem? Posso te ajudar com algo sobre o ${vehicle}?`
    : `Oi ${first}! Tudo bem? Como posso te ajudar?`
}

export function WASend({ leadId, phone, leadName, vehicleName, stage }: Props) {
  const suggested = leadName ? suggestMessage(leadName, vehicleName, stage) : ''
  const [open,    setOpen]    = useState(false)
  const [text,    setText]    = useState(suggested)
  const [error,   setError]   = useState<string | null>(null)
  const [pending, start]      = useTransition()

  function handleSend() {
    if (!text.trim()) return
    setError(null)
    start(async () => {
      const result = await sendWhatsAppMessage(leadId, phone, text.trim())
      if (result.error) { setError(result.error); return }
      setText(suggested)
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-11 px-4 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 text-[#25D366] font-body text-sm font-medium transition-colors w-full"
      >
        <Send size={14} />
        Enviar via WhatsApp
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        autoFocus
        className="w-full rounded-lg border border-surface bg-surface/50 px-3 py-2 font-body text-sm text-white placeholder:text-slate resize-none focus:outline-none focus:border-[#25D366]/40"
      />
      {error && <p className="font-body text-xs text-alert">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => { setOpen(false); setText(suggested); setError(null) }}
          className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-slate hover:text-white font-body text-xs transition-colors"
        >
          <X size={11} />
          Cancelar
        </button>
        <button
          onClick={handleSend}
          disabled={pending || !text.trim()}
          className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] font-body text-xs font-medium disabled:opacity-50 transition-colors"
        >
          {pending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
          Enviar
        </button>
      </div>
    </div>
  )
}
