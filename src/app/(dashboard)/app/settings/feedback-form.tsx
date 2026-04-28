'use client'

import { useRef, useState, useTransition } from 'react'
import { Lightbulb, CheckCircle } from 'lucide-react'
import { submitFeedback } from '@/server/actions/feedback'

export function FeedbackForm() {
  const [pending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await submitFeedback(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSent(true)
        formRef.current?.reset()
      }
    })
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <CheckCircle size={28} className="text-green" />
        <p className="font-body text-sm text-white font-semibold">Sugestão enviada!</p>
        <p className="font-body text-xs text-slate text-center">
          Obrigado pelo feedback. Analisamos todas as sugestões com atenção.
        </p>
        <button
          onClick={() => setSent(false)}
          className="font-body text-xs text-slate underline underline-offset-2 hover:text-white transition-colors"
        >
          Enviar outra
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fb-title" className="font-body text-xs font-medium text-slate">
          Título
        </label>
        <input
          id="fb-title"
          name="title"
          type="text"
          required
          maxLength={120}
          placeholder="Ex: Notificação de follow-up no WhatsApp"
          className="h-11 rounded-lg border border-surface bg-surface/50 px-3 font-body text-sm text-white placeholder:text-slate/50 focus:outline-none focus:border-green/40 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fb-description" className="font-body text-xs font-medium text-slate">
          Descrição
        </label>
        <textarea
          id="fb-description"
          name="description"
          required
          rows={4}
          maxLength={1000}
          placeholder="Descreva a melhoria que você gostaria de ver no sistema..."
          className="rounded-lg border border-surface bg-surface/50 px-3 py-2.5 font-body text-sm text-white placeholder:text-slate/50 focus:outline-none focus:border-green/40 transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="font-body text-xs text-alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-10 px-5 rounded-lg bg-green text-black font-body font-semibold text-sm hover:bg-green/90 disabled:opacity-50 transition-colors self-start"
      >
        {pending ? 'Enviando...' : 'Enviar sugestão'}
      </button>
    </form>
  )
}
