'use client'

import { useState, useTransition } from 'react'
import { ExternalLink, MessageCircle, Copy, CheckCheck, Send } from 'lucide-react'
import { sendWhatsAppToTenantOwner } from '@/server/actions/admin'

interface Props {
  tenantId: string
  slug: string
  ownerPhone: string | null
  asaasCustomerId: string | null
}

export function TenantQuickActions({ tenantId, slug, ownerPhone, asaasCustomerId }: Props) {
  const [message, setMessage]   = useState('')
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [copied, setCopied]     = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleSend() {
    setError(null)
    startTransition(async () => {
      const result = await sendWhatsAppToTenantOwner(tenantId, message)
      if (result.error) {
        setError(result.error)
      } else {
        setSent(true)
        setMessage('')
        setTimeout(() => setSent(false), 4000)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Links rápidos */}
      <div className="flex flex-wrap gap-2">
        <a
          href={`/loja/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-surface text-slate hover:text-white hover:border-slate/40 font-body text-xs transition-colors"
        >
          <ExternalLink size={12} />
          Abrir loja
        </a>

        {ownerPhone && (
          <a
            href={`https://wa.me/55${ownerPhone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-surface text-slate hover:text-white hover:border-slate/40 font-body text-xs transition-colors"
          >
            <MessageCircle size={12} />
            WhatsApp do dono
          </a>
        )}

        <button
          onClick={() => handleCopy('https://www.carvys.com.br/login', 'login')}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-surface text-slate hover:text-white hover:border-slate/40 font-body text-xs transition-colors"
        >
          {copied === 'login' ? <CheckCheck size={12} className="text-green" /> : <Copy size={12} />}
          {copied === 'login' ? 'Copiado!' : 'Copiar link de login'}
        </button>

        {asaasCustomerId && (
          <button
            onClick={() => handleCopy(asaasCustomerId, 'asaas')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-surface text-slate hover:text-white hover:border-slate/40 font-body text-xs transition-colors"
          >
            {copied === 'asaas' ? <CheckCheck size={12} className="text-green" /> : <Copy size={12} />}
            {copied === 'asaas' ? 'Copiado!' : 'ID Asaas'}
          </button>
        )}
      </div>

      {/* Enviar mensagem via WhatsApp oficial */}
      <div className="flex flex-col gap-2">
        <label className="font-body text-xs font-medium text-slate">Enviar via WhatsApp oficial</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          placeholder="Digite a mensagem para o dono da loja..."
          className="rounded-lg border border-surface bg-surface/50 px-3 py-2.5 font-body text-sm text-white placeholder:text-slate/50 focus:outline-none focus:border-green/40 transition-colors resize-none"
        />
        {error && <p className="font-body text-xs text-alert">{error}</p>}
        {sent  && <p className="font-body text-xs text-green">Mensagem enviada!</p>}
        <button
          disabled={pending || !message.trim()}
          onClick={handleSend}
          className="flex items-center gap-2 self-start h-9 px-4 rounded-lg bg-green text-void font-body text-sm font-semibold hover:bg-green/90 disabled:opacity-50 transition-colors"
        >
          <Send size={14} />
          {pending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}
