'use client'

import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'
import { Logo } from '@/components/shared/logo'

interface Props {
  title:    string
  message:  string
  isError?: boolean
}

export function InvitePage({ title, message, isError = false }: Props) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6 rounded-2xl bg-deep border border-surface p-8 text-center">
          <Logo size="md" />
          <div className="flex flex-col items-center gap-3">
            {isError
              ? <XCircle size={40} className="text-alert" />
              : <CheckCircle size={40} className="text-green" />
            }
            <h1 className="font-display font-bold text-white text-xl">{title}</h1>
            <p className="font-body text-sm text-slate">{message}</p>
          </div>
          <Link
            href="/app/dashboard"
            className="inline-block bg-green text-dark font-body font-semibold text-sm px-6 py-3 rounded-lg"
          >
            Ir para o painel
          </Link>
        </div>
      </div>
    </div>
  )
}
