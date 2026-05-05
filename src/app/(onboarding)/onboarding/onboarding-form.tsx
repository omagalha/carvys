'use client'

import { useActionState, useState } from 'react'
import { createTenant } from '@/server/actions/tenants'
import { Logo } from '@/components/shared/logo'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'
import { Car, Sparkles } from 'lucide-react'

const BUSINESS_TYPES = [
  {
    value:       'car_dealer',
    label:       'Revendedor de veículos',
    description: 'Gerencie estoque, leads e vendas de carros',
    icon:        Car,
  },
  {
    value:       'makeup_store',
    label:       'Loja de maquiagem',
    description: 'Controle produtos, validade e clientes',
    icon:        Sparkles,
  },
]

const STORE_LABELS: Record<string, { title: string; placeholder: string }> = {
  car_dealer:   { title: 'Como se chama seu revendedor?', placeholder: 'Ex: Auto Center Silva' },
  makeup_store: { title: 'Como se chama sua loja?',       placeholder: 'Ex: Beauty Store Ana' },
}

const initialState = { error: '' }

export function OnboardingForm() {
  const [state, formAction] = useActionState(createTenant, initialState)
  const [businessType, setBusinessType] = useState<string | null>(null)

  const storeLabel = businessType ? STORE_LABELS[businessType] : null

  // Step 1 — Escolher tipo de negócio
  if (!businessType) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="w-full rounded-2xl border border-surface bg-deep p-8">
            <div className="flex flex-col gap-8">
              <Logo size="md" />

              <div className="flex flex-col gap-1 text-center">
                <h1 className="font-display text-xl font-bold text-white">
                  Qual é o seu negócio?
                </h1>
                <p className="font-body text-sm text-slate">
                  Vamos configurar o sistema para o seu ramo
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {BUSINESS_TYPES.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBusinessType(value)}
                    className="flex items-center gap-4 rounded-xl border border-surface bg-void p-4 text-left hover:border-green/40 hover:bg-green/5 transition-all group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface group-hover:bg-green/10 transition-colors">
                      <Icon size={20} className="text-slate group-hover:text-green transition-colors" strokeWidth={1.75} />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-body text-sm font-medium text-white group-hover:text-green transition-colors">
                        {label}
                      </span>
                      <span className="font-body text-xs text-slate">
                        {description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 2 — Nome da loja
  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="w-full rounded-2xl border border-surface bg-deep p-8">
          <div className="flex flex-col gap-8">
            <Logo size="md" />

            <div className="flex flex-col gap-1 text-center">
              <h1 className="font-display text-xl font-bold text-white">
                {storeLabel!.title}
              </h1>
              <p className="font-body text-sm text-slate">
                Você pode alterar o nome depois nas configurações
              </p>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="business_type" value={businessType} />
              <Input
                label="Nome da loja"
                name="name"
                type="text"
                placeholder={storeLabel!.placeholder}
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

            <button
              type="button"
              onClick={() => setBusinessType(null)}
              className="font-body text-xs text-slate hover:text-white text-center transition-colors"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
