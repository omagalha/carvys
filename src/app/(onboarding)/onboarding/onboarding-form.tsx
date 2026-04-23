'use client'

import { useActionState } from 'react'
import { createTenant } from '@/server/actions/tenants'
import { Logo } from '@/components/shared/logo'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'

const initialState = { error: '' }

export function OnboardingForm() {
  const [state, formAction] = useActionState(createTenant, initialState)

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="w-full rounded-2xl border border-surface bg-deep p-8">
          <div className="flex flex-col gap-8">
            <Logo size="md" />

            <div className="flex flex-col gap-1 text-center">
              <h1 className="font-display text-xl font-bold text-white">
                Crie sua loja
              </h1>
              <p className="font-body text-sm text-slate">
                Como se chama seu revendedor?
              </p>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              <Input
                label="Nome da loja"
                name="name"
                type="text"
                placeholder="Ex: Auto Center Silva"
                autoFocus
                required
              />
              <Input
                label="Seu WhatsApp"
                name="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                required
              />

              {state?.error ? (
                <p className="font-body text-center text-xs text-alert">
                  {state.error}
                </p>
              ) : null}

              <SubmitButton className="mt-2">Criar loja</SubmitButton>
            </form>

            <p className="font-body text-center text-xs leading-relaxed text-slate">
              Voce podera adicionar mais lojas e membros da equipe depois nas configuracoes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
