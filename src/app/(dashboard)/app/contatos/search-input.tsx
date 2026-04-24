'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useTransition } from 'react'

export function SearchInput() {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const value = searchParams.get('q') ?? ''

  function handleChange(v: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (v) params.set('q', v)
    else   params.delete('q')
    startTransition(() => router.replace(`${pathname}?${params.toString()}`))
  }

  return (
    <div className="relative flex-1 max-w-sm">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => handleChange(e.target.value)}
        placeholder="Buscar por nome ou telefone..."
        className="h-10 w-full rounded-lg border border-surface bg-deep pl-9 pr-8 font-body text-sm text-white placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors"
      />
      {value && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate hover:text-white transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
