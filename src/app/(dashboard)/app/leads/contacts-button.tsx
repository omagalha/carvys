'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { BookUser, X, Search, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { fetchContactsAction } from '@/server/actions/contacts'
import type { LeadWithVehicle } from '@/server/queries/leads'

const AVATAR_COLORS = [
  'bg-green/20 text-green',
  'bg-blue-400/20 text-blue-400',
  'bg-purple-400/20 text-purple-400',
  'bg-orange-400/20 text-orange-400',
  'bg-pink-400/20 text-pink-400',
]

const STAGE_LABEL: Record<string, { label: string; color: string }> = {
  new:         { label: 'Novo',       color: 'text-slate bg-surface' },
  contacted:   { label: 'Contatado',  color: 'text-blue-400 bg-blue-400/10' },
  negotiating: { label: 'Negociando', color: 'text-yellow-400 bg-yellow-400/10' },
  won:         { label: 'Ganho',      color: 'text-green bg-green/10' },
  lost:        { label: 'Perdido',    color: 'text-alert bg-alert/10' },
}

export function ContactsButton() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [contacts, setContacts] = useState<LeadWithVehicle[]>([])
  const [isPending, startTransition] = useTransition()

  const load = useCallback((q?: string) => {
    startTransition(async () => {
      const data = await fetchContactsAction(q)
      setContacts(data)
    })
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  function handleSearch(v: string) {
    setSearch(v)
    load(v || undefined)
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        title="Contatos"
        className="fixed bottom-[84px] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-white/10 shadow-lg hover:bg-surface/70 transition-colors md:bottom-6"
      >
        <BookUser size={19} className="text-slate" />
      </button>

      {/* Drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          {/* Panel — bottom sheet mobile, popover desktop */}
          <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-deep border-t border-surface max-h-[78vh] md:left-auto md:right-5 md:bottom-16 md:w-80 md:rounded-2xl md:border md:max-h-[65vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface shrink-0">
              <h2 className="font-display font-bold text-white text-sm">Contatos</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2.5 border-b border-surface shrink-0">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Buscar nome ou telefone..."
                  className="h-9 w-full rounded-lg border border-surface bg-void pl-8 pr-3 font-body text-sm text-white placeholder:text-slate/40 focus:outline-none focus:border-green transition-colors"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-1.5">
              {isPending && contacts.length === 0 && (
                <p className="py-10 text-center font-body text-xs text-slate">Carregando...</p>
              )}
              {!isPending && contacts.length === 0 && (
                <p className="py-10 text-center font-body text-xs text-slate">
                  {search ? 'Nenhum resultado' : 'Nenhum contato ainda'}
                </p>
              )}
              {contacts.map(c => {
                const color    = AVATAR_COLORS[c.name.charCodeAt(0) % AVATAR_COLORS.length]
                const initial  = c.name.charAt(0).toUpperCase()
                const stageCfg = STAGE_LABEL[c.stage]
                const waPhone  = c.phone.replace(/\D/g, '')
                return (
                  <div
                    key={c.id}
                    className="relative group flex items-center gap-3 px-3 py-2.5 hover:bg-surface/60 transition-colors"
                  >
                    {/* Clickable area para perfil */}
                    <Link
                      href={`/app/contatos/${c.id}`}
                      className="absolute inset-0"
                      onClick={() => setOpen(false)}
                    />

                    {/* Avatar */}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${color}`}>
                      {initial}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                      <span className="font-body text-sm text-white font-medium truncate group-hover:text-green transition-colors">
                        {c.name}
                      </span>
                      <span className="font-body text-xs text-slate">{c.phone}</span>
                    </div>

                    {/* Stage + WA */}
                    <div className="relative z-10 flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`font-body text-[10px] font-medium px-1.5 py-0.5 rounded-full ${stageCfg.color}`}>
                        {stageCfg.label}
                      </span>
                      <a
                        href={`https://wa.me/55${waPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-[#25D366]/10 hover:bg-[#25D366]/25 transition-colors"
                      >
                        <MessageCircle size={12} className="text-[#25D366]" />
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
