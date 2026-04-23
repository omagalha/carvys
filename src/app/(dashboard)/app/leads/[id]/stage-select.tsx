'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { updateLeadStage, updateLeadStageWithReason } from '@/server/actions/leads'

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

const LOSS_REASONS = [
  { value: 'price',       label: 'Preço alto',                 emoji: '💸' },
  { value: 'competitor',  label: 'Comprou na concorrência',    emoji: '🏁' },
  { value: 'no_response', label: 'Não respondeu mais',         emoji: '🔇' },
  { value: 'gave_up',     label: 'Desistiu da compra',         emoji: '🚶' },
  { value: 'other',       label: 'Outro motivo',               emoji: '💬' },
]

export function StageSelect({
  leadId,
  currentStage,
  currentLossReason,
}: {
  leadId: string
  currentStage: string
  currentLossReason?: string | null
}) {
  const [stage, setStage] = useState(currentStage)
  const [lossReason, setLossReason] = useState<string | null>(currentLossReason ?? null)
  const [showModal, setShowModal] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleChange(value: string) {
    if (value === 'lost') {
      setShowModal(true)
      return
    }
    setStage(value)
    setLossReason(null)
    startTransition(async () => {
      await updateLeadStage(leadId, value)
    })
  }

  function confirmLoss() {
    setStage('lost')
    setLossReason(selectedReason)
    setShowModal(false)
    startTransition(async () => {
      await updateLeadStageWithReason(leadId, 'lost', selectedReason)
    })
  }

  function cancelModal() {
    setSelectedReason(null)
    setShowModal(false)
  }

  const lossLabel = LOSS_REASONS.find(r => r.value === lossReason)

  return (
    <>
      <div className="flex flex-col gap-3">
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

        {stage === 'lost' && lossLabel && (
          <div className="flex items-center gap-2 rounded-lg bg-alert/10 border border-alert/20 px-3 py-2">
            <span className="text-sm">{lossLabel.emoji}</span>
            <span className="font-body text-xs text-alert">{lossLabel.label}</span>
            <button
              onClick={() => setShowModal(true)}
              className="ml-auto font-body text-[10px] text-slate hover:text-white transition-colors"
            >
              Alterar
            </button>
          </div>
        )}
      </div>

      {/* Modal motivo de perda */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={cancelModal} />
          <div className="relative w-full max-w-sm rounded-2xl bg-deep border border-surface p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-white text-base">Por que o lead foi perdido?</h2>
                <p className="font-body text-xs text-slate mt-1">Isso ajuda a entender onde melhorar.</p>
              </div>
              <button
                onClick={cancelModal}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-surface transition-colors shrink-0"
              >
                <X size={14} className="text-slate" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {LOSS_REASONS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setSelectedReason(r.value)}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                    selectedReason === r.value
                      ? 'border-alert/50 bg-alert/10'
                      : 'border-surface hover:border-surface/80 hover:bg-surface/40'
                  }`}
                >
                  <span className="text-base">{r.emoji}</span>
                  <span className={`font-body text-sm ${selectedReason === r.value ? 'text-alert' : 'text-white'}`}>
                    {r.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={cancelModal}
                className="flex-1 h-10 rounded-lg border border-surface font-body text-sm text-slate hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLoss}
                disabled={!selectedReason}
                className="flex-1 h-10 rounded-lg bg-alert font-body text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
