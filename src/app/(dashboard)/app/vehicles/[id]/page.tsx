import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Car } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getVehicle } from '@/server/queries/vehicles'
import { getLeads } from '@/server/queries/leads'
import { VehiclePhotos } from './vehicle-photos'
import { StatusSelect } from './status-select'

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants as { id: string; name: string }
  const [vehicle, leads] = await Promise.all([
    getVehicle(id, tenant.id),
    getLeads(tenant.id),
  ])

  if (!vehicle) notFound()

  const rows = [
    { label: 'Marca',        value: vehicle.brand },
    { label: 'Modelo',       value: vehicle.model },
    { label: 'Versão',       value: vehicle.version },
    { label: 'Ano fab.',     value: vehicle.year_manufacture },
    { label: 'Ano modelo',   value: vehicle.year_model },
    { label: 'Quilometragem',value: vehicle.mileage != null ? vehicle.mileage.toLocaleString('pt-BR') + ' km' : null },
    { label: 'Cor',          value: vehicle.color },
    { label: 'Placa',        value: vehicle.plate },
    { label: 'Preço',        value: formatPrice(vehicle.price) },
  ].filter(r => r.value != null)

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/app/vehicles"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface hover:border-slate/40 transition-colors"
        >
          <ArrowLeft size={16} className="text-slate" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-white text-xl truncate">
            {vehicle.brand} {vehicle.model}
          </h1>
          {vehicle.version && (
            <p className="font-body text-sm text-slate truncate">{vehicle.version}</p>
          )}
        </div>
      </div>

      {/* Cover photo preview */}
      {vehicle.cover_image_path && (
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-surface">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vehicles/${vehicle.cover_image_path}`}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {!vehicle.cover_image_path && (
        <div className="w-full aspect-video rounded-xl bg-surface flex items-center justify-center">
          <Car size={40} className="text-slate/40" />
        </div>
      )}

      {/* Status */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Status</h2>
        <StatusSelect
          vehicleId={vehicle.id}
          currentStatus={vehicle.status}
          listedPrice={vehicle.price}
          leads={leads.map(l => ({ id: l.id, name: l.name, phone: l.phone }))}
        />
      </section>

      {/* Info */}
      <section className="flex flex-col gap-1 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm mb-3">Informações</h2>
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-surface last:border-0">
            <span className="font-body text-xs text-slate">{label}</span>
            <span className="font-body text-sm text-white">{String(value)}</span>
          </div>
        ))}
      </section>

      {/* Photos */}
      <VehiclePhotos
        vehicleId={vehicle.id}
        tenantId={tenant.id}
        initialCover={vehicle.cover_image_path}
        initialGallery={vehicle.gallery}
      />
    </div>
  )
}
