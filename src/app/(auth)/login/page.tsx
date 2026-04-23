'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login } from '@/server/actions/auth'
import { Logo } from '@/components/shared/logo'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'
import { GoogleButton } from '@/components/ui/google-button'

const initialState = { error: '' }

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialState)

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col gap-8 rounded-2xl bg-deep border border-surface p-8">

        <Logo size="md" />

        <div className="flex flex-col gap-1 text-center">
          <h1 className="font-display font-bold text-white text-xl">
            Bem-vindo de volta
          </h1>
          <p className="font-body text-sm text-slate">
            Entre na sua conta para continuar
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            name="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
          />
          <Input
            label="Senha"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          {state?.error && (
            <p className="font-body text-xs text-alert text-center">
              {state.error}
            </p>
          )}

          <SubmitButton className="mt-2">
            Entrar
          </SubmitButton>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-surface" />
          <span className="font-body text-xs text-slate">ou</span>
          <div className="flex-1 h-px bg-surface" />
        </div>

        <GoogleButton />

        <p className="font-body text-xs text-slate text-center">
          Não tem conta?{' '}
          <Link href="/signup" className="text-green hover:underline font-medium">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  )
}
