import Link from 'next/link'
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
  draft:     'bg-slate/20 text-slate',
  available: 'bg-green/15 text-green',
  reserved:  'bg-yellow-500/15 text-yellow-400',
  sold:      'bg-surface text-slate',
  archived:  'bg-surface text-slate',
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function formatMileage(value: number | null) {
  if (!value) return '0 km'
  return value.toLocaleString('pt-BR') + ' km'
}

export default async function VehiclesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants as { id: string; name: string }
  const vehicles = await getVehicles(tenant.id)

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Estoque</h1>
          <p className="font-body text-sm text-slate mt-0.5">
            {vehicles.length} {vehicles.length === 1 ? 'veículo' : 'veículos'}
          </p>
        </div>
        <Link
          href="/app/vehicles/novo"
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-green text-void font-body font-semibold text-sm hover:bg-green/90 transition-colors"
        >
          <Plus size={16} />
          Novo
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-surface py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
            <Car size={24} className="text-slate" />
          </div>
          <div>
            <p className="font-body text-sm text-white font-medium">Nenhum veículo cadastrado</p>
            <p className="font-body text-xs text-slate mt-1">Adicione seu primeiro veículo ao estoque</p>
          </div>
          <Link
            href="/app/vehicles/novo"
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-green text-void font-body font-semibold text-sm hover:bg-green/90 transition-colors"
          >
            <Plus size={14} />
            Cadastrar veículo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {vehicles.map((v) => (
            <Link
              key={v.id}
              href={`/app/vehicles/${v.id}`}
              className="flex items-center gap-4 rounded-xl bg-deep border border-surface p-4 hover:border-slate/40 transition-colors"
            >
              <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-surface flex items-center justify-center">
                {v.cover_image_path ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vehicles/${v.cover_image_path}`}
                    alt={`${v.brand} ${v.model}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Car size={20} className="text-slate" />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-body font-semibold text-white text-sm truncate">
                    {v.brand} {v.model}
                  </span>
                  {v.version && (
                    <span className="font-body text-xs text-slate truncate hidden sm:block">
                      {v.version}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {v.year_model && (
                    <span className="font-body text-xs text-slate">{v.year_model}</span>
                  )}
                  <span className="font-body text-xs text-slate">{formatMileage(v.mileage)}</span>
                  {v.color && (
                    <span className="font-body text-xs text-slate hidden sm:block">{v.color}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="font-body font-semibold text-white text-sm">
                  {formatPrice(v.price)}
                </span>
                <span className={`font-body text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[v.status]}`}>
                  {STATUS_LABEL[v.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
