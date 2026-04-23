'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/server/actions/settings'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'

const initialState = { error: '', success: false }

interface Props {
  fullName: string | null
  phone: string | null
}

export function ProfileForm({ fullName, phone }: Props) {
  const [state, formAction] = useActionState(updateProfile, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Nome completo"
        name="full_name"
        defaultValue={fullName ?? ''}
        placeholder="João Silva"
        required
      />
      <Input
        label="Telefone / WhatsApp"
        name="phone"
        type="tel"
        defaultValue={phone ?? ''}
        placeholder="(11) 99999-9999"
      />

      {state.error && (
        <p className="font-body text-xs text-alert">{state.error}</p>
      )}
      {state.success && (
        <p className="font-body text-xs text-green">Perfil salvo com sucesso.</p>
      )}

      <SubmitButton className="self-start px-6">Salvar perfil</SubmitButton>
    </form>
  )
}
