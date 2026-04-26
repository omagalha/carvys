'use client'

import { useState, useTransition } from 'react'
import { Send, X, Loader2 } from 'lucide-react'
import { sendWhatsAppMessage } from '@/server/actions/whatsapp'

export function WASend({ leadId, phone }: { leadId: string; phone: string }) {
  const [open,    setOpen]    = useState(false)
  const [text,    setText]    = useState('')
  const [error,   setError]   = useState<string | null>(null)
  const [pending, start]      = useTransition()

  function handleSend() {
    if (!text.trim()) return
    setError(null)
    start(async () => {
      const result = await sendWhatsAppMessage(leadId, phone, text.trim())
      if (result.error) { setError(result.error); return }
      setText('')
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-body text-xs font-medium transition-colors"
      >
        <Send size={11} />
        Enviar WA
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full mt-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Digite a mensagem..."
        rows={3}
        autoFocus
        className="w-full rounded-lg border border-surface bg-surface/50 px-3 py-2 font-body text-sm text-white placeholder:text-slate resize-none focus:outline-none focus:border-[#25D366]/40"
      />
      {error && <p className="font-body text-xs text-alert">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => { setOpen(false); setText(''); setError(null) }}
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
