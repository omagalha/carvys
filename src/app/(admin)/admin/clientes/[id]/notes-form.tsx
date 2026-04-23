'use client'

import { useRef, useTransition } from 'react'
import { addTenantNote } from '@/server/actions/admin-notes'
import { Send } from 'lucide-react'

export function NotesForm({ tenantId }: { tenantId: string }) {
  const ref = useRef<HTMLFormElement>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await addTenantNote(tenantId, formData)
      ref.current?.reset()
    })
  }

  return (
    <form ref={ref} action={handleSubmit} className="flex gap-2">
      <textarea
        name="content"
        placeholder="Adicionar anotação..."
        rows={2}
        required
        disabled={pending}
        className="flex-1 resize-none rounded-lg border border-surface bg-void px-3 py-2.5 font-body text-sm text-white placeholder:text-slate/40 outline-none focus:border-green/60 transition-colors disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={pending}
        className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-lg bg-green text-void hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Send size={14} />
      </button>
    </form>
  )
}
