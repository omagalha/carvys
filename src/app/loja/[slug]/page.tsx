import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Car, MessageCircle, ChevronDown } from 'lucide-react'
import { getTenantBySlug, getPublicVehicles } from '@/server/queries/public'
import { LeadModal } from '@/app/loja/_components/lead-modal'
import { ContactSection } from '@/app/loja/_components/contact-section'
import type { Vehicle } from '@/server/queries/vehicles'

const PLANS_WITH_SITE = ['trial', 'pro', 'elite']

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

// ─── Card da vitrine ────────────────────────────────────────────────────────

function VehicleCard({
  vehicle,
  slug,
  tenantId,
  phone,
  featured = false,
}: {
  vehicle: Vehicle
  slug: string
  tenantId: string
  phone: string | null
  featured?: boolean
}) {
  const photo = coverUrl(vehicle.cover_image_path)
  const vehicleName = `${vehicle.brand} ${vehicle.model}${vehicle.year_model ? ' ' + vehicle.year_model : ''}`

  return (
    <div className={`group flex flex-col rounded-2xl bg-[#111118] border border-white/5 overflow-hidden transition-all duration-300 hover:border-[#C8F135]/25 hover:shadow-[0_0_30px_rgba(200,241,53,0.06)] ${featured ? 'md:col-span-2' : ''}`}>
      <Link href={`/loja/${slug}/${vehicle.id}`} className="relative overflow-hidden block">
        <div className={`relative w-full overflow-hidden bg-white/5 ${featured ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
          {photo ? (
            <Image
              src={photo}
              alt={vehicleName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={featured
                ? '(max-width: 768px) 100vw, 66vw'
                : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw'
              }
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Car size={featured ? 48 : 28} className="text-white/10" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/80 via-transparent to-transparent" />

          {/* Price on image */}
          <div className="absolute bottom-3 left-3">
            <span className="font-display font-bold text-white text-lg leading-none drop-shadow-lg">
              {fmt(vehicle.price)}
            </span>
          </div>

          {vehicle.featured && (
            <div className="absolute top-3 left-3">
              <span className="bg-[#C8F135] text-[#0A0A0F] text-[10px] font-semibold px-2.5 py-1 rounded-full font-body">
                Destaque
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-3 p-4">
        <Link href={`/loja/${slug}/${vehicle.id}`} className="flex flex-col gap-1 group/link">
          <p className={`font-body font-semibold text-white leading-tight truncate group-hover/link:text-[#C8F135] transition-colors ${featured ? 'text-base' : 'text-sm'}`}>
            {vehicle.brand} {vehicle.model}
            {vehicle.version && <span className="text-white/30 font-normal"> · {vehicle.version}</span>}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {vehicle.year_model && (
              <span className="font-body text-xs text-white/40">{vehicle.year_model}</span>
            )}
            {vehicle.mileage !== null && (
              <>
                <span className="text-white/15">·</span>
                <span className="font-body text-xs text-white/40">{fmtKm(vehicle.mileage)}</span>
              </>
            )}
          </div>
        </Link>

        <LeadModal
          tenantId={tenantId}
          whatsappPhone={phone}
          vehicleId={vehicle.id}
          vehicleName={vehicleName}
          variant="card"
        />
      </div>
    </div>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default async function LojaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)

  if (!tenant || !PLANS_WITH_SITE.includes(tenant.plan_code)) notFound()

  const vehicles = await getPublicVehicles(tenant.id)
  const featured = vehicles.filter(v => v.featured)
  const rest     = vehicles.filter(v => !v.featured)
  const brands   = [...new Set(vehicles.map(v => v.brand))]

  const wa = waLink(tenant.whatsapp_phone, `Olá! Vi o estoque da ${tenant.name} e quero mais informações.`)
  const initial = tenant.name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">

      {/* ── Header sticky ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C8F135] shrink-0">
              <span className="font-display font-bold text-[#0A0A0F] text-xs leading-none">{initial}</span>
            </div>
            <span className="font-display font-semibold text-white text-sm">{tenant.name}</span>
          </div>
          {wa && (
            <a
              href={wa}
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

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[70vh] overflow-hidden px-4 text-center">

        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[#C8F135] opacity-[0.04] blur-[120px]" />
        </div>

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative flex flex-col items-center gap-7">

          {/* Logo */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#C8F135] shadow-[0_0_40px_rgba(200,241,53,0.3)]">
            <span className="font-display font-bold text-[#0A0A0F] text-3xl leading-none">{initial}</span>
          </div>

          {/* Nome + tagline */}
          <div className="flex flex-col gap-3">
            <h1 className="font-display font-bold text-white text-4xl sm:text-5xl md:text-6xl leading-none tracking-tight">
              {tenant.name}
            </h1>
            <p className="font-body text-white/40 text-lg">
              Seu próximo veículo está aqui.
            </p>
          </div>

          {/* Stats */}
          {vehicles.length > 0 && (
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-display font-bold text-white text-3xl">{vehicles.length}</span>
                <span className="font-body text-xs text-white/30 uppercase tracking-wider">
                  {vehicles.length === 1 ? 'veículo' : 'veículos'}
                </span>
              </div>
              {brands.length > 1 && (
                <>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-display font-bold text-white text-3xl">{brands.length}</span>
                    <span className="font-body text-xs text-white/30 uppercase tracking-wider">
                      {brands.length === 1 ? 'marca' : 'marcas'}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CTA */}
          {vehicles.length > 0 ? (
            <a
              href="#vitrine"
              className="flex items-center gap-2 h-11 px-6 rounded-xl border border-white/10 font-body text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors"
            >
              Ver estoque
              <ChevronDown size={15} />
            </a>
          ) : (
            <p className="font-body text-sm text-white/30">Nenhum veículo disponível no momento.</p>
          )}
        </div>
      </section>

      {/* ── Vitrine ────────────────────────────────────────────────────── */}
      {vehicles.length > 0 && (
        <section id="vitrine" className="max-w-6xl mx-auto px-4 pb-20 flex flex-col gap-12">

          {/* Destaques */}
          {featured.length > 0 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-white/5" />
                <span className="font-body text-xs text-[#C8F135] font-semibold uppercase tracking-widest">Em destaque</span>
                <span className="h-px flex-1 bg-white/5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featured.map(v => (
                  <div key={v.id} className={featured.length === 1 ? 'md:col-span-2' : ''}>
                    <VehicleCard
                      vehicle={v}
                      slug={slug}
                      tenantId={tenant.id}
                      phone={tenant.whatsapp_phone}
                      featured={featured.length === 1}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Todos os veículos */}
          {rest.length > 0 && (
            <div className="flex flex-col gap-5">
              {featured.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/5" />
                  <span className="font-body text-xs text-white/30 font-semibold uppercase tracking-widest">Todos os veículos</span>
                  <span className="h-px flex-1 bg-white/5" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map(v => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    slug={slug}
                    tenantId={tenant.id}
                    phone={tenant.whatsapp_phone}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Contato & Localização ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <ContactSection
          tenantName={tenant.name}
          contactEmail={tenant.contact_email}
          contactPhone={tenant.contact_phone}
          address={tenant.address}
          businessHours={tenant.business_hours}
        />
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <p className="font-body text-xs text-white/20">
            © {new Date().getFullYear()} {tenant.name}
          </p>
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
