import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { getTenantBySlug, getPublicVehicle } from '@/server/queries/public'
import { LeadModal } from '@/app/loja/_components/lead-modal'
import { GalleryViewer } from '@/app/loja/_components/gallery-viewer'
import { ContactSection } from '@/app/loja/_components/contact-section'
import { SimulatorForm } from '@/app/loja/_components/simulator-form'
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

function waLink(phone: string | null, message?: string) {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, '')
  const text = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${cleaned}${text ? `?text=${text}` : ''}`
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
  ].map(imageUrl)

  const vehicleName = `${vehicle.brand} ${vehicle.model}${vehicle.year_model ? ' ' + vehicle.year_model : ''}${vehicle.version ? ' ' + vehicle.version : ''}`
  const description = vehicle.description || generateDescription(vehicle)

  const specs = [
    vehicle.year_model                ? { label: 'Ano',           value: String(vehicle.year_model) } : null,
    vehicle.mileage !== null          ? { label: 'Quilometragem', value: fmtKm(vehicle.mileage) } : null,
    vehicle.fuel                      ? { label: 'Combustível',   value: FUEL_LABEL[vehicle.fuel] ?? vehicle.fuel } : null,
    vehicle.transmission              ? { label: 'Câmbio',        value: TRANS_LABEL[vehicle.transmission] ?? vehicle.transmission } : null,
    vehicle.body_type                 ? { label: 'Carroceria',    value: BODY_LABEL[vehicle.body_type] ?? vehicle.body_type } : null,
    vehicle.color                     ? { label: 'Cor',           value: vehicle.color } : null,
    vehicle.doors                     ? { label: 'Portas',        value: `${vehicle.doors} portas` } : null,
  ].filter((s): s is NonNullable<typeof s> => Boolean(s))

  const waVehicle = waLink(
    tenant.whatsapp_phone,
    `Olá! Tenho interesse no ${vehicleName} — ${fmt(vehicle.price)}.`
  )

  const initial = tenant.name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">

      {/* Header */}
      <header className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/loja/${slug}`}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-white/50 hover:text-white/70"
            >
              <ArrowLeft size={14} />
              <span className="font-body text-xs">Voltar</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#C8F135] shrink-0">
                <span className="font-display font-bold text-[#0A0A0F] text-[10px] leading-none">{initial}</span>
              </div>
              <span className="font-body text-xs text-white/50 hidden sm:block">{tenant.name}</span>
            </div>
          </div>
          {waVehicle && (
            <a
              href={waVehicle}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#C8F135] text-[#0A0A0F] font-body font-semibold text-xs hover:opacity-90 transition-opacity"
            >
              <MessageCircle size={12} />
              WhatsApp
            </a>
          )}
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-8 flex flex-col gap-8 overflow-x-clip">

        {/* Título */}
        <div>
          <p className="font-body text-xs text-white/25 mb-2">{tenant.name} · Estoque · {vehicle.brand}</p>
          <h1 className="font-display font-bold text-white text-3xl leading-tight">{vehicle.brand} {vehicle.model}</h1>
          {(vehicle.version || vehicle.year_model) && (
            <p className="font-body text-white/40 mt-1">
              {[vehicle.version, vehicle.year_model].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Layout 2 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-10 items-start">

          {/* Coluna esquerda */}
          <div className="flex flex-col gap-8 order-2 md:order-1 min-w-0">
            <GalleryViewer images={allImages} vehicleName={vehicleName} />

            {description && (
              <div className="flex flex-col gap-3">
                <p className="font-body text-[10px] text-white/25 uppercase tracking-widest border-b border-white/5 pb-3">Descrição</p>
                <p className="font-body text-sm text-white/50 leading-relaxed">{description}</p>
              </div>
            )}

            {specs.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="font-body text-[10px] text-white/25 uppercase tracking-widest border-b border-white/5 pb-3">Ficha técnica</p>
                <div className="grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden">
                  {specs.map(({ label, value }) => (
                    <div key={label} className="bg-[#0A0A0F] px-4 py-4">
                      <p className="font-body text-[10px] text-white/25 uppercase tracking-wider mb-1.5">{label}</p>
                      <p className="font-body text-sm font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna direita — price card */}
          <div className="order-first md:order-2 md:sticky md:top-20">
            <div className="rounded-2xl border border-white/5 bg-[#111118] p-6 flex flex-col gap-5">
              <div>
                <p className="font-body text-[10px] text-white/25 uppercase tracking-widest mb-1">Preço</p>
                <p className="font-display font-bold text-[#C8F135] text-4xl leading-none">{fmt(vehicle.price)}</p>
              </div>

              <div className="h-px bg-white/5" />

              {specs.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  {specs.slice(0, 5).map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="font-body text-xs text-white/40">{label}</span>
                      <span className="font-body text-sm font-medium text-white">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="h-px bg-white/5" />

              <div className="flex flex-col gap-2">
                <LeadModal
                  tenantId={tenant.id}
                  whatsappPhone={tenant.whatsapp_phone}
                  vehicleId={vehicle.id}
                  vehicleName={vehicleName}
                  variant="primary"
                />
                {tenant.whatsapp_phone && (
                  <LeadModal
                    tenantId={tenant.id}
                    whatsappPhone={tenant.whatsapp_phone}
                    vehicleId={vehicle.id}
                    vehicleName={vehicleName}
                    variant="whatsapp"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Simulador de Financiamento */}
        <div className="flex flex-col gap-4">
          <p className="font-body text-[10px] text-white/25 uppercase tracking-widest border-b border-white/5 pb-3">
            Simulador de Financiamento
          </p>
          <SimulatorForm
            tenantId={tenant.id}
            vehicleId={vehicle.id}
            vehicleName={vehicleName}
            vehiclePrice={vehicle.price}
          />
        </div>

        {/* Contato & Localização */}
        <ContactSection
          tenantName={tenant.name}
          contactEmail={tenant.contact_email}
          contactPhone={tenant.contact_phone}
          address={tenant.address}
          businessHours={tenant.business_hours}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-4">
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between">
          <p className="font-body text-xs text-white/20">© {new Date().getFullYear()} {tenant.name}</p>
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
