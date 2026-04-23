import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Car, Users, Calendar } from 'lucide-react'
import { getTenantById } from '@/server/queries/admin'
import { TenantControls } from './tenant-controls'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tenant = await getTenantById(id)
  if (!tenant) notFound()

  const stats = [
    { label: 'Veículos cadastrados', value: tenant.vehicle_count, icon: Car },
    { label: 'Leads no funil',       value: tenant.lead_count,   icon: Users },
    { label: 'Usuários ativos',      value: tenant.member_count, icon: Users },
  ]

  return (
    <div className="p-6 flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/clientes"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface hover:border-slate/40 transition-colors"
        >
          <ArrowLeft size={16} className="text-slate" />
        </Link>
        <div>
          <h1 className="font-display font-bold text-white text-xl">{tenant.name}</h1>
          <p className="font-body text-xs text-slate mt-0.5">/{tenant.slug}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-4">
            <Icon size={14} className="text-slate" />
            <span className="font-display font-bold text-white text-2xl leading-none">{value}</span>
            <span className="font-body text-[10px] text-slate leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* Dono da loja */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Responsável</h2>
        {tenant.owner ? (
          <div className="flex flex-col gap-2">
            {tenant.owner.full_name && (
              <div className="flex items-center gap-2">
                <Users size={14} className="text-slate" />
                <span className="font-body text-sm text-white">{tenant.owner.full_name}</span>
              </div>
            )}
            {tenant.owner.email && (
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate" />
                <a href={`mailto:${tenant.owner.email}`} className="font-body text-sm text-green hover:underline">
                  {tenant.owner.email}
                </a>
              </div>
            )}
            {tenant.owner.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate" />
                <a href={`https://wa.me/55${tenant.owner.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-green hover:underline">
                  {tenant.owner.phone}
                </a>
              </div>
            )}
          </div>
        ) : (
          <p className="font-body text-xs text-slate">Sem responsável vinculado</p>
        )}
      </section>

      {/* Informações */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Informações</h2>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate" />
          <span className="font-body text-sm text-slate">Cliente desde</span>
          <span className="font-body text-sm text-white ml-auto">{formatDate(tenant.created_at)}</span>
        </div>
      </section>

      {/* Controles */}
      <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Controles</h2>
        <TenantControls
          tenantId={tenant.id}
          currentStatus={tenant.status}
          currentPlan={tenant.plan_code}
        />
      </section>
    </div>
  )
}
