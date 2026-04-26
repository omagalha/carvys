import { notFound } from 'next/navigation'
import { MessageCircle, ChevronDown } from 'lucide-react'
import { getTenantBySlug, getPublicVehicles } from '@/server/queries/public'
import { ContactSection } from '@/app/loja/_components/contact-section'
import { Vitrine } from '@/app/loja/_components/vitrine'

const PLANS_WITH_SITE = ['trial', 'pro', 'elite']

function waLink(phone: string | null, message?: string) {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, '')
  const text = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${cleaned}${text ? `?text=${text}` : ''}`
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
  const brands   = [...new Set(vehicles.map(v => v.brand))]
  const wa       = waLink(tenant.whatsapp_phone, `Olá! Vi o estoque da ${tenant.name} e quero mais informações.`)
  const initial  = tenant.name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">

      {/* ── Header ─────────────────────────────────────────────────────── */}
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
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[#C8F135] opacity-[0.04] blur-[120px]" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative flex flex-col items-center gap-7">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#C8F135] shadow-[0_0_40px_rgba(200,241,53,0.3)]">
            <span className="font-display font-bold text-[#0A0A0F] text-3xl leading-none">{initial}</span>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="font-display font-bold text-white text-4xl sm:text-5xl md:text-6xl leading-none tracking-tight">
              {tenant.name}
            </h1>
            <p className="font-body text-white/40 text-lg">Seu próximo veículo está aqui.</p>
          </div>

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
                    <span className="font-body text-xs text-white/30 uppercase tracking-wider">marcas</span>
                  </div>
                </>
              )}
            </div>
          )}

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

      {/* ── Vitrine com busca ──────────────────────────────────────────── */}
      {vehicles.length > 0 && (
        <Vitrine
          vehicles={vehicles}
          slug={slug}
          tenantId={tenant.id}
          phone={tenant.whatsapp_phone}
        />
      )}

      {/* ── Contato ────────────────────────────────────────────────────── */}
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
          <p className="font-body text-xs text-white/20">© {new Date().getFullYear()} {tenant.name}</p>
          <a
            href="https://www.instagram.com/usecarvys"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            Powered by{' '}
            <span className="text-[#C8F135]/50 font-semibold hover:text-[#C8F135]/80 transition-colors">
              Carvys
            </span>
          </a>
        </div>
      </footer>
    </div>
  )
}
