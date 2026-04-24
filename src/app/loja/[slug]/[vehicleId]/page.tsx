import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MessageCircle, Car } from 'lucide-react'
import { getTenantBySlug, getPublicVehicle } from '@/server/queries/public'

const PLANS_WITH_SITE = ['pro', 'elite']

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

function waLink(phone: string | null, message: string) {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, '')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
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

  const waMessage = `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model}${vehicle.year_model ? ' ' + vehicle.year_model : ''}${vehicle.version ? ' ' + vehicle.version : ''}. Poderia me passar mais informações?`
  const wa = waLink(tenant.whatsapp_phone, waMessage)

  const specs: { label: string; value: string }[] = [
    vehicle.year_model ? { label: 'Ano', value: String(vehicle.year_model) } : null,
    vehicle.mileage !== null ? { label: 'Quilometragem', value: fmtKm(vehicle.mileage) } : null,
    vehicle.fuel ? { label: 'Combustível', value: FUEL_LABEL[vehicle.fuel] ?? vehicle.fuel } : null,
    vehicle.transmission ? { label: 'Câmbio', value: TRANS_LABEL[vehicle.transmission] ?? vehicle.transmission } : null,
    vehicle.body_type ? { label: 'Carroceria', value: BODY_LABEL[vehicle.body_type] ?? vehicle.body_type } : null,
    vehicle.doors ? { label: 'Portas', value: String(vehicle.doors) } : null,
    vehicle.color ? { label: 'Cor', value: vehicle.color } : null,
  ].filter((s): s is { label: string; value: string } => Boolean(s))

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

        {/* Photos */}
        <div className="flex flex-col gap-2">
          {/* Main photo */}
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-white/5">
            {allImages[0] ? (
              <Image
                src={imageUrl(allImages[0])}
                alt={`${vehicle.brand} ${vehicle.model}`}
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

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {allImages.slice(1).map((path, i) => (
                <div
                  key={i}
                  className="relative h-16 w-24 shrink-0 rounded-lg overflow-hidden bg-white/5"
                >
                  <Image
                    src={imageUrl(path)}
                    alt={`Foto ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <h1 className="font-display font-bold text-white text-2xl leading-tight">
            {vehicle.brand} {vehicle.model}
          </h1>
          {vehicle.version && (
            <p className="font-body text-sm text-white/40">{vehicle.version}</p>
          )}
          <p className="font-display font-bold text-[#C8F135] text-3xl mt-2">{fmt(vehicle.price)}</p>
        </div>

        {/* Specs */}
        {specs.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {specs.map(spec => (
              <div key={spec.label} className="flex flex-col gap-0.5 rounded-xl bg-white/[0.04] px-3 py-2.5">
                <span className="font-body text-[10px] text-white/30 uppercase tracking-wide">{spec.label}</span>
                <span className="font-body text-sm font-semibold text-white">{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col gap-3 pt-2">
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#C8F135] text-[#0A0A0F] font-body font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <MessageCircle size={18} />
              Tenho interesse — falar no WhatsApp
            </a>
          ) : (
            <div className="flex items-center justify-center h-12 rounded-xl bg-white/5 text-white/30 font-body text-sm">
              Entre em contato com a loja
            </div>
          )}
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
          <p className="font-body text-xs text-white/20">
            Powered by{' '}
            <span className="text-[#C8F135]/60 font-semibold">Carvys</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
