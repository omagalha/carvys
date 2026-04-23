'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signup } from '@/server/actions/auth'
import { Logo } from '@/components/shared/logo'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'
import { GoogleButton } from '@/components/ui/google-button'
import { MailCheck } from 'lucide-react'

const initialState = { error: '', success: false }

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, initialState)

  if (state.success) {
    return (
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-deep border border-surface p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green/10 border border-green/20">
            <MailCheck size={28} className="text-green" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="font-display font-bold text-white text-xl">
              Conta criada!
            </h1>
            <p className="font-body text-sm text-slate leading-relaxed">
              Enviamos um link de confirmação para o seu e-mail.
              Acesse sua caixa de entrada e clique no link para ativar sua conta.
            </p>
          </div>

          <Link
            href="/login"
            className="font-body text-sm text-green hover:underline font-medium"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col gap-8 rounded-2xl bg-deep border border-surface p-8">

        <Logo size="md" />

        <div className="flex flex-col gap-1 text-center">
          <h1 className="font-display font-bold text-white text-xl">
            Crie sua conta
          </h1>
          <p className="font-body text-sm text-slate">
            7 dias grátis, sem cartão de crédito
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <Input
            label="Nome completo"
            name="full_name"
            type="text"
            placeholder="João Silva"
            autoComplete="name"
            required
          />
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
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
          />

          {state?.error && (
            <p className="font-body text-xs text-alert text-center">
              {state.error}
            </p>
          )}

          <SubmitButton className="mt-2">
            Criar conta
          </SubmitButton>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-surface" />
          <span className="font-body text-xs text-slate">ou</span>
          <div className="flex-1 h-px bg-surface" />
        </div>

        <GoogleButton />

        <p className="font-body text-xs text-slate text-center">
          Já tem conta?{' '}
          <Link href="/login" className="text-green hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
