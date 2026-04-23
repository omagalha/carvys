'use client'

import { useTransition } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { completeFollowUp } from '@/server/actions/follow-ups'

export function CompleteButton({ followUpId }: { followUpId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => completeFollowUp(followUpId))}
      disabled={pending}
      title="Marcar como concluído"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-surface hover:border-green hover:bg-green/10 transition-colors disabled:opacity-50"
    >
      {pending
        ? <Loader2 size={14} className="text-slate animate-spin" />
        : <Check size={14} className="text-slate group-hover:text-green" />
      }
    </button>
  )
}
