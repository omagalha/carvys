'use client'

import { useActionState, useTransition } from 'react'
import { Users, Trash2, Clock } from 'lucide-react'
import { inviteMember, removeMember } from '@/server/actions/team'
import { getPlanLimits, ROLE_LABELS } from '@/lib/plans'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'

export type TeamMember = {
  id:                 string
  userId:             string
  email:              string
  name:               string | null
  role:               string
  canViewFinancials:  boolean
}

export type PendingInvite = {
  id:        string
  email:     string
  role:      string
  expiresAt: string
}

interface Props {
  members:        TeamMember[]
  pendingInvites: PendingInvite[]
  planCode:       string
  currentUserId:  string
}

const initialState = { error: '', success: false }

const ROLE_OPTIONS = [
  { value: 'sales', label: 'Vendedor' },
  { value: 'admin', label: 'Gerente' },
]

export function TeamSection({ members, pendingInvites, planCode, currentUserId }: Props) {
  const limits    = getPlanLimits(planCode)
  const usedSlots = members.length
  const canInvite = usedSlots < limits.maxMembers

  const [state, formAction] = useActionState(inviteMember, initialState)
  const [isPending, startTransition] = useTransition()

  function handleRemove(membershipId: string) {
    startTransition(async () => {
      await removeMember(membershipId)
    })
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-green" />
          <h2 className="font-body font-semibold text-white text-sm">Equipe</h2>
        </div>
        <span className="font-body text-xs text-slate">
          {usedSlots} / {limits.maxMembers} vaga{limits.maxMembers > 1 ? 's' : ''}
        </span>
      </div>

      {/* Current members */}
      <div className="flex flex-col gap-2">
        {members.map(member => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border border-surface bg-surface/30 px-3 py-2.5"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-body text-sm text-white truncate">
                {member.name ?? member.email}
              </span>
              {member.name && (
                <span className="font-body text-xs text-slate truncate">{member.email}</span>
              )}
              <div className="flex gap-2 mt-0.5">
                <span className="font-body text-xs text-slate">
                  {ROLE_LABELS[member.role] ?? member.role}
                </span>
                {member.role !== 'owner' && (
                  <span className={`font-body text-xs ${member.canViewFinancials ? 'text-green' : 'text-slate/50'}`}>
                    · Financeiro {member.canViewFinancials ? 'visível' : 'oculto'}
                  </span>
                )}
              </div>
            </div>
            {member.role !== 'owner' && member.userId !== currentUserId && (
              <button
                type="button"
                onClick={() => handleRemove(member.id)}
                disabled={isPending}
                className="p-1 rounded text-slate hover:text-alert transition-colors shrink-0 ml-3"
                title="Remover"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}

        {/* Pending invites */}
        {pendingInvites.map(invite => (
          <div
            key={invite.id}
            className="flex items-center gap-2 rounded-lg border border-surface/50 border-dashed bg-surface/10 px-3 py-2.5"
          >
            <Clock size={13} className="text-slate shrink-0" />
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="font-body text-sm text-slate truncate">{invite.email}</span>
              <span className="font-body text-xs text-slate/60">
                Convite pendente · {ROLE_LABELS[invite.role] ?? invite.role}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Invite form */}
      {canInvite ? (
        <form action={formAction} className="flex flex-col gap-3 pt-1 border-t border-surface">
          <p className="font-body text-xs text-slate">Adicionar funcionário</p>

          <div className="flex gap-2">
            <Input
              name="email"
              type="email"
              placeholder="email@funcionario.com"
              className="flex-1"
            />
            <select
              name="role"
              defaultValue="sales"
              className="h-11 rounded-lg border border-surface bg-surface/50 px-3 font-body text-sm text-white focus:outline-none focus:border-green"
            >
              {ROLE_OPTIONS.map(o => (
                <option key={o.value} value={o.value} className="bg-deep">
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Financial permission toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="can_view_financials"
              value="true"
              className="w-4 h-4 rounded border-surface accent-green"
            />
            <span className="font-body text-sm text-slate">
              Permitir acesso ao módulo financeiro
            </span>
          </label>

          {state.error && (
            <p className="font-body text-xs text-alert">{state.error}</p>
          )}
          {state.success && (
            <p className="font-body text-xs text-green">Funcionário adicionado com sucesso.</p>
          )}

          <SubmitButton className="self-start px-5">Convidar</SubmitButton>
        </form>
      ) : (
        <div className="pt-1 border-t border-surface">
          <p className="font-body text-xs text-slate">
            Limite de {limits.maxMembers} usuário{limits.maxMembers > 1 ? 's' : ''} atingido.{' '}
            <a href="/app/billing" className="text-green hover:underline">Faça upgrade</a>{' '}
            para adicionar mais funcionários.
          </p>
        </div>
      )}
    </section>
  )
}
