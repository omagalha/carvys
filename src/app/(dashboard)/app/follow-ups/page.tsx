import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getFollowUps } from '@/server/queries/follow-ups'
import { FollowUpCard } from './follow-up-card'
import { isOverdue } from '@/lib/follow-ups'

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants as { id: string }
  const all = await getFollowUps(tenant.id)

  const activeTab = tab ?? 'pending'

  const pending  = all.filter(f => f.status === 'pending')
  const overdue  = pending.filter(f => isOverdue(f.due_at, f.status))
  const upcoming = pending.filter(f => !isOverdue(f.due_at, f.status))
  const done     = all.filter(f => f.status === 'done')

  const filtered = activeTab === 'done' ? done : [...overdue, ...upcoming]

  const TABS = [
    { value: 'pending', label: 'Pendentes', count: pending.length },
    { value: 'done',    label: 'Concluídos', count: done.length },
  ]

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Tarefas</h1>
          {overdue.length > 0 ? (
            <p className="font-body text-xs text-alert mt-0.5">
              {overdue.length} atrasada{overdue.length > 1 ? 's' : ''}
            </p>
          ) : (
            <p className="font-body text-sm text-slate mt-0.5">
              {pending.length} pendente{pending.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link
          href="/app/follow-ups/novo"
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-green text-void font-body font-semibold text-sm hover:bg-green/90 transition-colors"
        >
          <Plus size={16} />
          Nova
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <Link
            key={t.value}
            href={`/app/follow-ups?tab=${t.value}`}
            className={[
              'flex items-center gap-1.5 h-8 px-3 rounded-lg font-body text-xs font-medium transition-colors',
              activeTab === t.value
                ? 'bg-green text-void'
                : 'bg-surface text-slate hover:text-white',
            ].join(' ')}
          >
            {t.label}
            <span className={[
              'text-[10px] px-1.5 py-0.5 rounded-full',
              activeTab === t.value ? 'bg-void/20 text-void' : 'bg-deep text-slate',
            ].join(' ')}>
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-surface py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
            <Bell size={24} className="text-slate" />
          </div>
          <div>
            <p className="font-body text-sm text-white font-medium">
              {activeTab === 'pending' ? 'Nenhuma tarefa pendente' : 'Nenhuma tarefa concluída'}
            </p>
            {activeTab === 'pending' && (
              <p className="font-body text-xs text-slate mt-1">Agende follow-ups para seus leads</p>
            )}
          </div>
          {activeTab === 'pending' && (
            <Link
              href="/app/follow-ups/novo"
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-green text-void font-body font-semibold text-sm hover:bg-green/90 transition-colors"
            >
              <Plus size={14} />
              Agendar tarefa
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(item => (
            <FollowUpCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
