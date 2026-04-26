'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, AlertTriangle, Clock, X } from 'lucide-react'

export type AppNotification = {
  id: string
  type: 'urgent_lead' | 'overdue_followup'
  title: string
  subtitle: string
  href: string
}

export function NotificationBell({ notifications }: { notifications: AppNotification[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const count = notifications.length

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate hover:text-white transition-colors"
        title="Notificações"
      >
        <Bell size={16} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-alert text-[9px] font-bold text-white leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-surface bg-deep shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface">
            <h3 className="font-display font-bold text-white text-sm">Notificações</h3>
            <button onClick={() => setOpen(false)} className="text-slate hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          {count === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
              <Bell size={20} className="text-slate/40" />
              <p className="font-body text-sm text-slate">Tudo em dia!</p>
            </div>
          ) : (
            <div className="flex flex-col max-h-80 overflow-y-auto divide-y divide-surface">
              {notifications.map(n => {
                const Icon = n.type === 'urgent_lead' ? AlertTriangle : Clock
                const color = n.type === 'urgent_lead' ? 'text-alert' : 'text-yellow-400'
                const bg    = n.type === 'urgent_lead' ? 'bg-alert/10' : 'bg-yellow-400/10'

                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-surface/40 transition-colors"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                      <Icon size={14} className={color} />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-body text-sm text-white font-medium truncate">{n.title}</span>
                      <span className="font-body text-xs text-slate leading-snug">{n.subtitle}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
