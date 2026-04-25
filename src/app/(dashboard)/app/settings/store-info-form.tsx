'use client'

import { useActionState } from 'react'
import { updateStoreInfo } from '@/server/actions/settings'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'

const initialState = { error: '', success: false }

interface Props {
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  businessHours: string | null
}

export function StoreInfoForm({ contactEmail, contactPhone, address, businessHours }: Props) {
  const [state, formAction] = useActionState(updateStoreInfo, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="E-mail de contato"
        name="contact_email"
        type="email"
        defaultValue={contactEmail ?? ''}
        placeholder="contato@sualolja.com.br"
      />
      <Input
        label="Telefone de contato"
        name="contact_phone"
        type="tel"
        defaultValue={contactPhone ?? ''}
        placeholder="(11) 99999-9999"
      />
      <Input
        label="Endereço"
        name="address"
        defaultValue={address ?? ''}
        placeholder="Av. Paulista, 1000 — São Paulo, SP"
      />
      <Input
        label="Horário de funcionamento"
        name="business_hours"
        defaultValue={businessHours ?? ''}
        placeholder="Seg–Sex 9h–18h · Sáb 9h–14h"
      />

      {state.error && (
        <p className="font-body text-xs text-alert">{state.error}</p>
      )}
      {state.success && (
        <p className="font-body text-xs text-green">Informações salvas com sucesso.</p>
      )}

      <SubmitButton className="self-start px-6">Salvar informações</SubmitButton>
    </form>
  )
}
