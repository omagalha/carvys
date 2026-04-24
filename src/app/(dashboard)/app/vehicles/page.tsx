import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Plus, Car } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getVehicles } from '@/server/queries/vehicles'
import type { Vehicle } from '@/server/queries/vehicles'

const STATUS_LABEL: Record<Vehicle['status'], string> = {
  draft:     'Rascunho',
  available: 'Disponível',
  reserved:  'Reservado',
  sold:      'Vendido',
  archived:  'Arquivado',
}

const STATUS_COLOR: Record<Vehicle['status'], string> = {
  draft:     'bg-slate/30 text-slate',
  available: 'bg-green/20 text-green',
  reserved:  'bg-yellow-500/20 text-yellow-400',
  sold:      'bg-surface/80 text-slate',
  archived:  'bg-surface/80 text-slate',
}

const TABS: { value: string; label: string }[] = [
  { value: 'all',       label: 'Todos' },
  { value: 'available', label: 'Disponíveis' },
  { value: 'reserved',  label: 'Reservados' },
  { value: 'sold',      label: 'Vendidos' },
  { value: 'draft',     label: 'Rascunhos' },
]

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function fmtKm(value: number | null) {
  if (!value) return '0 km'
  return value.toLocaleString('pt-BR') + ' km'
}

function coverUrl(path: string | null) {
  if (!path) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vehicles/${path}`
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const activeTab = status ?? 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants as { id: string }
  const vehicles = await getVehicles(tenant.id, activeTab)

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Estoque</h1>
          <p className="font-body text-sm text-slate mt-0.5">
            {vehicles.length} {vehicles.length === 1 ? 'veículo' : 'veículos'}
          </p>
        </div>
        <Link
          href="/app/vehicles/novo"
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-green text-void font-body font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Novo
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
        {TABS.map(tab => (
          <Link
            key={tab.value}
            href={tab.value === 'all' ? '/app/vehicles' : `/app/vehicles?status=${tab.value}`}
            className={[
              'shrink-0 h-8 px-3 rounded-lg font-body text-xs font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-green/15 text-green'
                : 'text-slate hover:text-white hover:bg-surface',
            ].join(' ')}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Empty */}
      {vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-surface py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
            <Car size={24} className="text-slate" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-body text-sm font-semibold text-white">
              {activeTab === 'all' ? 'Nenhum veículo ainda' : `Nenhum veículo ${STATUS_LABEL[activeTab as Vehicle['status']]?.toLowerCase() ?? ''}`}
            </p>
            <p className="font-body text-xs text-slate">
              {activeTab === 'all' ? 'Cadastre seu primeiro veículo' : 'Mude o filtro para ver outros status'}
            </p>
          </div>
          {activeTab === 'all' && (
            <Link
              href="/app/vehicles/novo"
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-green text-void font-body font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              Cadastrar veículo
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {vehicles.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {vehicles.map(v => {
            const photo = coverUrl(v.cover_image_path)
            return (
              <Link
                key={v.id}
                href={`/app/vehicles/${v.id}`}
                className="group flex flex-col rounded-xl bg-deep border border-surface hover:border-green/30 overflow-hidden transition-all duration-200"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] bg-surface overflow-hidden">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={`${v.brand} ${v.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Car size={28} className="text-slate/30" />
                    </div>
                  )}
                  {/* Status badge */}
                  <span className={`absolute top-2 right-2 font-body text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${STATUS_COLOR[v.status]}`}>
                    {STATUS_LABEL[v.status]}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1.5 p-3">
                  <p className="font-body font-semibold text-white text-sm leading-tight truncate group-hover:text-green transition-colors">
                    {v.brand} {v.model}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {v.year_model && (
                      <span className="font-body text-xs text-slate">{v.year_model}</span>
                    )}
                    {v.year_model && v.mileage !== null && (
                      <span className="text-slate/30 text-xs">·</span>
                    )}
                    <span className="font-body text-xs text-slate">{fmtKm(v.mileage)}</span>
                  </div>
                  <p className="font-display font-bold text-white text-sm mt-0.5">{fmt(v.price)}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
