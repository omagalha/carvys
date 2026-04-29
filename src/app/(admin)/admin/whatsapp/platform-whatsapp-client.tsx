'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Loader2, MessageCircle, Send, XCircle } from 'lucide-react'
import {
  checkPlatformWhatsAppStatus,
  connectPlatformWhatsApp,
  disconnectPlatformWhatsApp,
  sendPlatformWhatsAppTest,
} from '@/server/actions/platform-whatsapp'

type Phase = 'idle' | 'loading' | 'qr' | 'connected'

type Props = {
  initialStatus: 'connected' | 'disconnected' | 'connecting'
  initialPhone?: string | null
  instanceName: string
  officialPhone: string
}

export function PlatformWhatsAppClient({
  initialStatus,
  initialPhone,
  instanceName,
  officialPhone,
}: Props) {
  const [phase, setPhase] = useState<Phase>(initialStatus === 'connected' ? 'connected' : 'idle')
  const [qr, setQr] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(initialPhone ?? null)
  const [error, setError] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<string | null>(null)

  const poll = useCallback(async () => {
    const result = await checkPlatformWhatsAppStatus()
    if (result.status === 'connected') {
      setPhase('connected')
      setPhone(result.phone ?? null)
      setError(null)
      return
    }
    if (result.status === 'connecting' && result.qr) {
      setQr(result.qr)
      return
    }
    if (result.status === 'disconnected') {
      setError('Nao foi possivel carregar o QR Code. Tente conectar novamente.')
      setPhase('idle')
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
    setTestStatus(null)

    const result = await connectPlatformWhatsApp()
    if (result.error) {
      setError(result.error)
      setPhase('idle')
      return
    }
    if (!result.qr) {
      const status = await checkPlatformWhatsAppStatus()
      if (status.status === 'connected') {
        setPhase('connected')
        setPhone(status.phone ?? null)
        return
      }
      setError('Nao foi possivel gerar o QR Code. Tente novamente.')
      setPhase('idle')
      return
    }

    setQr(result.qr)
    setPhase('qr')
  }

  async function handleDisconnect() {
    setPhase('loading')
    setError(null)
    setTestStatus(null)
    await disconnectPlatformWhatsApp()
    setPhone(null)
    setQr(null)
    setPhase('idle')
  }

  async function handleTest() {
    setTestStatus('Enviando teste...')
    const result = await sendPlatformWhatsAppTest()
    setTestStatus(result.error ? result.error : 'Mensagem de teste enviada.')
  }

  return (
    <section className="rounded-xl bg-deep border border-surface p-5 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366]/10 border border-[#25D366]/20">
            <MessageCircle size={18} className="text-[#25D366]" />
          </div>
          <div>
            <h2 className="font-body font-semibold text-white text-sm">WhatsApp oficial da Carvys</h2>
            <p className="font-body text-xs text-slate mt-1">
              Instancia <span className="text-white">{instanceName}</span> para onboarding, suporte e avisos automaticos.
            </p>
          </div>
        </div>

        {phase === 'connected' && (
          <span className="flex items-center gap-1 font-body text-xs text-green">
            <CheckCircle2 size={13} />
            Conectado
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-surface/50 border border-surface p-4">
          <span className="font-body text-[10px] uppercase tracking-widest text-slate">Numero oficial</span>
          <p className="font-body text-sm text-white mt-1">+{officialPhone}</p>
        </div>
        <div className="rounded-lg bg-surface/50 border border-surface p-4">
          <span className="font-body text-[10px] uppercase tracking-widest text-slate">Numero conectado</span>
          <p className="font-body text-sm text-white mt-1">{phone ? `+${phone}` : 'Ainda nao conectado'}</p>
        </div>
      </div>

      {phase === 'idle' && (
        <div className="flex flex-col gap-3">
          <p className="font-body text-xs text-slate leading-relaxed">
            Escaneie o QR Code com o WhatsApp do numero oficial da Carvys para ativar os envios da plataforma.
          </p>
          <button
            onClick={handleConnect}
            className="self-start flex items-center gap-2 h-9 px-4 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-body text-sm font-medium transition-colors"
          >
            <MessageCircle size={15} />
            Conectar instancia oficial
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
            Abra o WhatsApp no celular, acesse dispositivos conectados e escaneie o codigo abaixo.
          </p>
          {qr ? (
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white rounded-xl p-3 w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR Code WhatsApp oficial Carvys" width={220} height={220} />
              </div>
              <div className="flex items-center gap-1.5">
                <Loader2 size={12} className="text-slate animate-spin" />
                <span className="font-body text-xs text-slate">Aguardando leitura do QR Code...</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="text-slate animate-spin" />
              <span className="font-body text-xs text-slate">Carregando QR Code...</span>
            </div>
          )}
        </div>
      )}

      {phase === 'connected' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTest}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-body text-xs transition-colors"
            >
              <Send size={13} />
              Enviar teste
            </button>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-surface text-slate hover:text-alert hover:border-alert/30 font-body text-xs transition-colors"
            >
              <XCircle size={13} />
              Desconectar
            </button>
          </div>
          {testStatus && <p className="font-body text-xs text-slate">{testStatus}</p>}
        </div>
      )}
    </section>
  )
}
