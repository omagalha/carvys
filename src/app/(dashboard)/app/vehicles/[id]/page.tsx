import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Car, FileText, ShoppingCart, Fuel, Settings2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getVehicle } from '@/server/queries/vehicles'
import { getLeads } from '@/server/queries/leads'
import { VehiclePhotos } from './vehicle-photos'
import { StatusSelect } from './status-select'
import { DocEditor } from './doc-editor'

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function fmtKm(value: number | null) {
  if (!value) return '0 km'
  return value.toLocaleString('pt-BR') + ' km'
}

const FUEL_LABEL: Record<string, string> = {
  flex: 'Flex', gasolina: 'Gasolina', etanol: 'Etanol',
  diesel: 'Diesel', eletrico: 'Elétrico', hibrido: 'Híbrido',
}

const BODY_LABEL: Record<string, string> = {
  hatch: 'Hatch', sedan: 'Sedã', suv: 'SUV', picape: 'Picape',
  van: 'Van', coupe: 'Cupê', moto: 'Moto', caminhao: 'Caminhão', outro: 'Outro',
}

const TRANS_LABEL: Record<string, string> = {
  manual: 'Manual', automatico: 'Automático', cvt: 'CVT', dct: 'DCT',
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

  const hasDocData = vehicle.renavam || vehicle.chassis || vehicle.fuel || vehicle.body_type

  const margin = vehicle.cost_price && vehicle.price
    ? Math.round(((vehicle.price - vehicle.cost_price) / vehicle.price) * 100)
    : null

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/app/vehicles"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-surface hover:border-slate/40 transition-colors mt-0.5"
        >
          <ArrowLeft size={16} className="text-slate" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-white text-xl leading-tight">
            {vehicle.brand} {vehicle.model}
            {vehicle.year_model ? <span className="text-slate font-normal"> · {vehicle.year_model}</span> : null}
          </h1>
          {vehicle.version && (
            <p className="font-body text-sm text-slate mt-0.5 truncate">{vehicle.version}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display font-black text-white text-lg leading-none">{fmt(vehicle.price)}</p>
          {vehicle.cost_price && margin !== null && (
            <p className="font-body text-xs text-green mt-0.5">{margin}% margem</p>
          )}
        </div>
      </div>

      {/* Photo */}
      {vehicle.cover_image_path ? (
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-surface">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vehicles/${vehicle.cover_image_path}`}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-video rounded-xl bg-surface flex items-center justify-center">
          <Car size={40} className="text-slate/30" />
        </div>
      )}

      {/* Quick specs */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Km', value: fmtKm(vehicle.mileage) },
          { label: 'Ano fab.', value: vehicle.year_manufacture ?? '—' },
          { label: 'Cor', value: vehicle.color ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1 rounded-xl bg-deep border border-surface p-3 text-center">
            <span className="font-body text-[10px] text-slate uppercase tracking-wider">{label}</span>
            <span className="font-body text-sm font-semibold text-white">{String(value)}</span>
          </div>
        ))}
      </div>

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

      {/* Placa / Chassis quick view */}
      {(vehicle.plate || vehicle.renavam || vehicle.chassis) && (
        <div className="flex flex-wrap gap-3">
          {vehicle.plate && (
            <div className="flex items-center gap-2 rounded-lg border border-surface bg-deep px-3 py-2">
              <Car size={13} className="text-slate" />
              <span className="font-body text-sm text-white font-mono">{vehicle.plate}</span>
            </div>
          )}
          {vehicle.renavam && (
            <div className="flex items-center gap-2 rounded-lg border border-surface bg-deep px-3 py-2">
              <FileText size={13} className="text-slate" />
              <span className="font-body text-xs text-slate">RENAVAM</span>
              <span className="font-body text-sm text-white font-mono">{vehicle.renavam}</span>
            </div>
          )}
        </div>
      )}

      {/* Características resumidas (se preenchidas) */}
      {(vehicle.fuel || vehicle.body_type || vehicle.transmission) && (
        <div className="flex flex-wrap gap-2">
          {vehicle.fuel && (
            <span className="flex items-center gap-1.5 font-body text-xs text-slate bg-surface px-2.5 py-1.5 rounded-lg border border-surface/60">
              <Fuel size={11} />
              {FUEL_LABEL[vehicle.fuel] ?? vehicle.fuel}
            </span>
          )}
          {vehicle.body_type && (
            <span className="flex items-center gap-1.5 font-body text-xs text-slate bg-surface px-2.5 py-1.5 rounded-lg border border-surface/60">
              <Car size={11} />
              {BODY_LABEL[vehicle.body_type] ?? vehicle.body_type}
            </span>
          )}
          {vehicle.transmission && (
            <span className="flex items-center gap-1.5 font-body text-xs text-slate bg-surface px-2.5 py-1.5 rounded-lg border border-surface/60">
              <Settings2 size={11} />
              {TRANS_LABEL[vehicle.transmission] ?? vehicle.transmission}
            </span>
          )}
          {vehicle.doors && (
            <span className="font-body text-xs text-slate bg-surface px-2.5 py-1.5 rounded-lg border border-surface/60">
              {vehicle.doors} portas
            </span>
          )}
        </div>
      )}

      {/* Documentação + Compra */}
      <section className="flex flex-col gap-5 rounded-xl bg-deep border border-surface p-5">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-slate" />
          <h2 className="font-body font-semibold text-white text-sm">Documentação &amp; Compra</h2>
          {!hasDocData && (
            <span className="ml-auto font-body text-[10px] text-slate bg-surface px-2 py-0.5 rounded-full">
              Preencha para gerar contratos
            </span>
          )}
        </div>
        <DocEditor vehicle={vehicle} />
      </section>

      {/* Contrato (placeholder) */}
      <section className="flex flex-col gap-3 rounded-xl border border-dashed border-surface p-5">
        <div className="flex items-center gap-2">
          <ShoppingCart size={15} className="text-slate" />
          <h2 className="font-body font-semibold text-white text-sm">Gerar contrato</h2>
          <span className="ml-auto font-body text-[10px] text-slate/60 bg-surface/50 px-2 py-0.5 rounded-full">Em breve</span>
        </div>
        <p className="font-body text-xs text-slate leading-relaxed">
          Com os dados preenchidos acima, você poderá gerar contratos de compra, venda e consignação com um clique.
        </p>
        <div className="flex gap-2 flex-wrap">
          {['Venda', 'Compra', 'Consignação'].map(type => (
            <button
              key={type}
              disabled
              className="h-8 px-3 rounded-lg border border-surface font-body text-xs text-slate opacity-50 cursor-not-allowed"
            >
              {type}
            </button>
          ))}
        </div>
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
