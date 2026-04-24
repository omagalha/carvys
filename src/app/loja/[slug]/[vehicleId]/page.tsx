import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Car, Calendar, Gauge, Fuel, Settings2, Palette, DoorOpen } from 'lucide-react'
import { getTenantBySlug, getPublicVehicle } from '@/server/queries/public'
import { LeadModal } from '@/app/loja/_components/lead-modal'
import type { Vehicle } from '@/server/queries/vehicles'

const PLANS_WITH_SITE = ['trial', 'pro', 'elite']

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function fmtKm(value: number | null) {
  if (!value) return '0 km'
  return value.toLocaleString('pt-BR') + ' km'
}

function imageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vehicles/${path}`
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

function generateDescription(vehicle: Vehicle): string | null {
  const parts: string[] = []

  const name = `${vehicle.brand} ${vehicle.model}${vehicle.version ? ' ' + vehicle.version : ''}`
  const year = vehicle.year_model ? ` ${vehicle.year_model}` : ''
  parts.push(`${name}${year}.`)

  const specParts: string[] = []
  if (vehicle.transmission) specParts.push(`câmbio ${(TRANS_LABEL[vehicle.transmission] ?? vehicle.transmission).toLowerCase()}`)
  if (vehicle.fuel) specParts.push(`motor ${(FUEL_LABEL[vehicle.fuel] ?? vehicle.fuel).toLowerCase()}`)
  if (vehicle.body_type) specParts.push(BODY_LABEL[vehicle.body_type]?.toLowerCase() ?? vehicle.body_type)
  if (specParts.length > 0) {
    const joined = specParts.length === 1
      ? specParts[0]
      : specParts.slice(0, -1).join(', ') + ' e ' + specParts[specParts.length - 1]
    parts.push(joined.charAt(0).toUpperCase() + joined.slice(1) + '.')
  }

  if (vehicle.mileage !== null) {
    if (vehicle.mileage === 0) parts.push('Veículo zero quilômetro.')
    else if (vehicle.mileage < 50000) parts.push(`Apenas ${vehicle.mileage.toLocaleString('pt-BR')} km — excelente estado de conservação.`)
    else parts.push(`${vehicle.mileage.toLocaleString('pt-BR')} km rodados.`)
  }

  parts.push('Entre em contato para mais detalhes ou para agendar uma visita.')

  if (parts.length < 3) return null
  return parts.join(' ')
}

export default async function VehiclePublicPage({
  params,
}: {
  params: Promise<{ slug: string; vehicleId: string }>
}) {
  const { slug, vehicleId } = await params

  const tenant = await getTenantBySlug(slug)
  if (!tenant || !PLANS_WITH_SITE.includes(tenant.plan_code)) notFound()

  const vehicle = await getPublicVehicle(vehicleId, tenant.id)
  if (!vehicle) notFound()

  const allImages = [
    ...(vehicle.cover_image_path ? [vehicle.cover_image_path] : []),
    ...vehicle.gallery.filter(p => p !== vehicle.cover_image_path),
  ]

  const vehicleName = `${vehicle.brand} ${vehicle.model}${vehicle.year_model ? ' ' + vehicle.year_model : ''}${vehicle.version ? ' ' + vehicle.version : ''}`
  const description = vehicle.description || generateDescription(vehicle)

  const highlights = [
    vehicle.year_model                ? { icon: Calendar,  label: 'Ano modelo',      value: String(vehicle.year_model) } : null,
    vehicle.mileage !== null          ? { icon: Gauge,     label: 'Quilometragem',   value: fmtKm(vehicle.mileage) } : null,
    vehicle.fuel                      ? { icon: Fuel,      label: 'Combustível',     value: FUEL_LABEL[vehicle.fuel] ?? vehicle.fuel } : null,
    vehicle.transmission              ? { icon: Settings2, label: 'Câmbio',          value: TRANS_LABEL[vehicle.transmission] ?? vehicle.transmission } : null,
    vehicle.body_type                 ? { icon: Car,       label: 'Carroceria',      value: BODY_LABEL[vehicle.body_type] ?? vehicle.body_type } : null,
    vehicle.color                     ? { icon: Palette,   label: 'Cor',             value: vehicle.color } : null,
    vehicle.doors                     ? { icon: DoorOpen,  label: 'Portas',          value: `${vehicle.doors} portas` } : null,
  ].filter((h): h is NonNullable<typeof h> => Boolean(h))

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">

      {/* Header */}
      <header className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href={`/loja/${slug}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 hover:border-white/20 transition-colors shrink-0"
          >
            <ArrowLeft size={15} className="text-white/60" />
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#C8F135] shrink-0">
              <span className="font-display font-bold text-[#0A0A0F] text-[10px] leading-none">
                {tenant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-body text-xs text-white/60 truncate">{tenant.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Fotos */}
        <div className="flex flex-col gap-2">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-white/5">
            {allImages[0] ? (
              <Image
                src={imageUrl(allImages[0])}
                alt={vehicleName}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Car size={48} className="text-white/10" />
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {allImages.slice(1).map((path, i) => (
                <div key={i} className="relative h-16 w-24 shrink-0 rounded-lg overflow-hidden bg-white/5">
                  <Image src={imageUrl(path)} alt={`Foto ${i + 2}`} fill className="object-cover" sizes="96px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Título + preço */}
        <div className="flex flex-col gap-1">
          <h1 className="font-display font-bold text-white text-2xl leading-tight">
            {vehicle.brand} {vehicle.model}
          </h1>
          {vehicle.version && (
            <p className="font-body text-sm text-white/40">{vehicle.version}</p>
          )}
          <p className="font-display font-bold text-[#C8F135] text-3xl mt-3">{fmt(vehicle.price)}</p>
        </div>

        {/* Descrição */}
        {description && (
          <p className="font-body text-sm text-white/50 leading-relaxed">
            {description}
          </p>
        )}

        {/* Highlights verticais */}
        {highlights.length > 0 && (
          <div className="flex flex-col rounded-2xl border border-white/5 overflow-hidden">
            {highlights.map(({ icon: Icon, label, value }, i) => (
              <div
                key={label}
                className={[
                  'flex items-center justify-between px-4 py-3.5',
                  i < highlights.length - 1 ? 'border-b border-white/5' : '',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <Icon size={15} className="text-white/25 shrink-0" />
                  <span className="font-body text-sm text-white/45">{label}</span>
                </div>
                <span className="font-body text-sm font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <LeadModal
            tenantId={tenant.id}
            whatsappPhone={tenant.whatsapp_phone}
            vehicleId={vehicle.id}
            vehicleName={vehicleName}
            variant="primary"
          />
          <Link
            href={`/loja/${slug}`}
            className="flex items-center justify-center h-10 rounded-xl border border-white/10 text-white/40 font-body text-sm hover:border-white/20 hover:text-white/60 transition-colors"
          >
            Ver outros veículos
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-8">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-center">
          <a
            href="https://www.instagram.com/usecarvys"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            Powered by <span className="text-[#C8F135]/50 font-semibold hover:text-[#C8F135]/80 transition-colors">Carvys</span>
          </a>
        </div>
      </footer>
    </div>
  )
}
