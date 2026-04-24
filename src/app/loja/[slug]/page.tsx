import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Car, MessageCircle } from 'lucide-react'
import { getTenantBySlug, getPublicVehicles } from '@/server/queries/public'
import type { Vehicle } from '@/server/queries/vehicles'

const PLANS_WITH_SITE = ['pro', 'elite']

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

function waLink(phone: string | null, message?: string) {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, '')
  const text = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${cleaned}${text ? `?text=${text}` : ''}`
}

function VehicleCard({ vehicle, slug, phone }: { vehicle: Vehicle; slug: string; phone: string | null }) {
  const photo = coverUrl(vehicle.cover_image_path)
  const wa = waLink(phone, `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model}${vehicle.year_model ? ' ' + vehicle.year_model : ''}.`)

  return (
    <div className="group flex flex-col rounded-2xl bg-[#111118] border border-white/5 hover:border-[#C8F135]/30 overflow-hidden transition-all duration-200">
      <Link href={`/loja/${slug}/${vehicle.id}`}>
        <div className="relative aspect-[4/3] bg-white/5 overflow-hidden">
          {photo ? (
            <Image
              src={photo}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Car size={28} className="text-white/10" />
            </div>
          )}
          {vehicle.featured && (
            <span className="absolute top-2 left-2 bg-[#C8F135] text-[#0A0A0F] text-[10px] font-semibold px-2 py-0.5 rounded-full font-body">
              Destaque
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-3 p-3">
        <Link href={`/loja/${slug}/${vehicle.id}`} className="flex flex-col gap-1">
          <p className="font-body font-semibold text-white text-sm leading-tight truncate group-hover:text-[#C8F135] transition-colors">
            {vehicle.brand} {vehicle.model}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {vehicle.year_model && (
              <span className="font-body text-xs text-white/40">{vehicle.year_model}</span>
            )}
            {vehicle.year_model && vehicle.mileage !== null && (
              <span className="text-white/20 text-xs">·</span>
            )}
            <span className="font-body text-xs text-white/40">{fmtKm(vehicle.mileage)}</span>
          </div>
          <p className="font-display font-bold text-white text-base mt-0.5">{fmt(vehicle.price)}</p>
        </Link>

        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 h-8 rounded-lg bg-[#C8F135]/10 text-[#C8F135] font-body text-xs font-semibold hover:bg-[#C8F135]/20 transition-colors"
          >
            <MessageCircle size={13} />
            Tenho interesse
          </a>
        )}
      </div>
    </div>
  )
}

export default async function LojaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)

  if (!tenant || !PLANS_WITH_SITE.includes(tenant.plan_code)) notFound()

  const vehicles = await getPublicVehicles(tenant.id)

  const wa = waLink(tenant.whatsapp_phone, `Olá! Vi o estoque da ${tenant.name} e quero mais informações.`)

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">

      {/* Header */}
      <header className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C8F135] shrink-0">
              <span className="font-display font-bold text-[#0A0A0F] text-sm leading-none">
                {tenant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-display font-bold text-white text-sm">{tenant.name}</span>
          </div>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#C8F135] text-[#0A0A0F] font-body font-semibold text-xs hover:opacity-90 transition-opacity"
            >
              <MessageCircle size={13} />
              WhatsApp
            </a>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Title */}
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Estoque disponível</h1>
          <p className="font-body text-sm text-white/40 mt-1">
            {vehicles.length === 0
              ? 'Nenhum veículo disponível no momento'
              : `${vehicles.length} ${vehicles.length === 1 ? 'veículo disponível' : 'veículos disponíveis'}`}
          </p>
        </div>

        {/* Empty */}
        {vehicles.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
              <Car size={24} className="text-white/20" />
            </div>
            <p className="font-body text-sm text-white/40">Volte em breve para ver os veículos</p>
          </div>
        )}

        {/* Grid */}
        {vehicles.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {vehicles.map(v => (
              <VehicleCard key={v.id} vehicle={v} slug={slug} phone={tenant.whatsapp_phone} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-center">
          <p className="font-body text-xs text-white/20">
            Powered by{' '}
            <span className="text-[#C8F135]/60 font-semibold">Carvys</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
