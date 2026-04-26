'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { connectWhatsApp, checkWhatsAppStatus, disconnectWhatsApp } from '@/server/actions/whatsapp'

type Phase = 'idle' | 'loading' | 'qr' | 'connected'

export function WhatsAppSection({
  initialStatus,
  initialPhone,
}: {
  initialStatus: 'connected' | 'disconnected'
  initialPhone?: string | null
}) {
  const [phase, setPhase] = useState<Phase>(initialStatus === 'connected' ? 'connected' : 'idle')
  const [qr,    setQr]    = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(initialPhone ?? null)
  const [error, setError] = useState<string | null>(null)

  const poll = useCallback(async () => {
    const result = await checkWhatsAppStatus()
    if (result.status === 'connected') {
      setPhase('connected')
      setPhone(result.phone ?? null)
      return
    }
    if (result.status === 'connecting' && result.qr) {
      setQr(result.qr)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'qr') return
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [phase, poll])

  async function handleConnect() {
    setPhase('loading')
    setError(null)
    const result = await connectWhatsApp()
    if (result.error) {
      setError(result.error)
      setPhase('idle')
      return
    }
    setQr(result.qr)
    setPhase('qr')
  }

  async function handleDisconnect() {
    setPhase('loading')
    await disconnectWhatsApp()
    setPhone(null)
    setQr(null)
    setPhase('idle')
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
      <div className="flex items-center gap-2">
        <MessageCircle size={16} className="text-[#25D366]" />
        <h2 className="font-body font-semibold text-white text-sm">WhatsApp nativo</h2>
        {phase === 'connected' && (
          <span className="ml-auto flex items-center gap-1 font-body text-xs text-green">
            <CheckCircle2 size={12} />
            Conectado
          </span>
        )}
      </div>

      {phase === 'idle' && (
        <div className="flex flex-col gap-3">
          <p className="font-body text-xs text-slate leading-relaxed">
            Conecte o WhatsApp da sua loja para enviar e receber mensagens direto pelo Carvys.
          </p>
          <button
            onClick={handleConnect}
            className="self-start flex items-center gap-2 h-9 px-4 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-body text-sm font-medium transition-colors"
          >
            <MessageCircle size={15} />
            Conectar WhatsApp
          </button>
          {error && <p className="font-body text-xs text-alert">{error}</p>}
        </div>
      )}

      {phase === 'loading' && (
        <div className="flex items-center gap-2 py-2">
          <Loader2 size={16} className="text-slate animate-spin" />
          <span className="font-body text-sm text-slate">Aguarde...</span>
        </div>
      )}

      {phase === 'qr' && (
        <div className="flex flex-col gap-3">
          <p className="font-body text-xs text-slate leading-relaxed">
            Abra o WhatsApp no celular → Menu → Dispositivos conectados → Conectar dispositivo → Escaneie o código abaixo.
          </p>
          {qr ? (
            <div className="flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="bg-white rounded-xl p-3 w-fit">
                <img src={qr} alt="QR Code WhatsApp" width={200} height={200} />
              </div>
              <div className="flex items-center gap-1.5">
                <Loader2 size={12} className="text-slate animate-spin" />
                <span className="font-body text-xs text-slate">Aguardando leitura do QR code...</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="text-slate animate-spin" />
              <span className="font-body text-xs text-slate">Carregando QR code...</span>
            </div>
          )}
        </div>
      )}

      {phase === 'connected' && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-sm text-white">
              {phone ? `+${phone}` : 'Número conectado'}
            </span>
            <span className="font-body text-xs text-slate">Pronto para enviar e receber mensagens</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-surface text-slate hover:text-alert hover:border-alert/30 font-body text-xs transition-colors"
          >
            <XCircle size={13} />
            Desconectar
          </button>
        </div>
      )}
    </section>
  )
}
