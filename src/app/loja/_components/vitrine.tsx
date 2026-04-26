'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Car } from 'lucide-react'
import { LeadModal } from './lead-modal'
import type { Vehicle } from '@/server/queries/vehicles'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

const BODY_LABELS: Record<string, string> = {
  hatch: 'Hatch', sedan: 'Sedã', suv: 'SUV', picape: 'Picape',
  van: 'Van', coupe: 'Cupê', moto: 'Moto', caminhao: 'Caminhão', outro: 'Outro',
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function fmtKm(v: number | null) {
  if (!v) return '0 km'
  return v.toLocaleString('pt-BR') + ' km'
}

function coverUrl(path: string | null) {
  if (!path) return null
  return `${SUPABASE_URL}/storage/v1/object/public/vehicles/${path}`
}

// ─── Card ────────────────────────────────────────────────────────────────────

function VehicleCard({
  vehicle, slug, tenantId, phone, wide = false,
}: {
  vehicle: Vehicle
  slug: string
  tenantId: string
  phone: string | null
  wide?: boolean
}) {
  const photo       = coverUrl(vehicle.cover_image_path)
  const vehicleName = `${vehicle.brand} ${vehicle.model}${vehicle.year_model ? ' ' + vehicle.year_model : ''}`

  return (
    <div className="group flex flex-col rounded-2xl bg-[#111118] border border-white/5 overflow-hidden transition-all duration-300 hover:border-[#C8F135]/25 hover:shadow-[0_0_30px_rgba(200,241,53,0.06)]">
      <Link href={`/loja/${slug}/${vehicle.id}`} className="block overflow-hidden">
        <div className={`relative w-full bg-white/5 ${wide ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
          {photo ? (
            <Image
              src={photo}
              alt={vehicleName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={wide
                ? '(max-width: 768px) 100vw, 66vw'
                : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw'}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Car size={wide ? 48 : 28} className="text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/80 via-transparent to-transparent" />
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
          <p className="font-body font-semibold text-white text-sm leading-tight truncate group-hover/link:text-[#C8F135] transition-colors">
            {vehicle.brand} {vehicle.model}
            {vehicle.version && (
              <span className="text-white/30 font-normal"> · {vehicle.version}</span>
            )}
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

// ─── Vitrine ──────────────────────────────────────────────────────────────────

type Props = {
  vehicles: Vehicle[]
  slug: string
  tenantId: string
  phone: string | null
}

export function Vitrine({ vehicles, slug, tenantId, phone }: Props) {
  const [search,     setSearch]     = useState('')
  const [activeType, setActiveType] = useState<string | null>(null)

  const bodyTypes = useMemo(() => {
    const types = [...new Set(
      vehicles.map(v => v.body_type).filter((t): t is string => Boolean(t))
    )].sort()
    return types
  }, [vehicles])

  const filtered = useMemo(() => {
    let result = vehicles
    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(v =>
        `${v.brand} ${v.model} ${v.version ?? ''}`.toLowerCase().includes(q)
      )
    }
    if (activeType) {
      result = result.filter(v => v.body_type === activeType)
    }
    return result
  }, [vehicles, search, activeType])

  const hasFilters  = search.trim() !== '' || activeType !== null
  const featured    = !hasFilters ? filtered.filter(v => v.featured) : []
  const rest        = !hasFilters ? filtered.filter(v => !v.featured) : filtered

  function clear() {
    setSearch('')
    setActiveType(null)
  }

  return (
    <section id="vitrine" className="max-w-6xl mx-auto px-4 pb-20 flex flex-col gap-8">

      {/* ── Busca ────────────────────────────────────────────────────────── */}
      <div className="sticky top-14 z-10 flex flex-col gap-3 py-4 bg-[#0A0A0F]">

        {/* Campo */}
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
          />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por marca ou modelo..."
            className="h-12 w-full rounded-xl border border-white/8 bg-white/[0.04] px-4 pl-11 pr-11 font-body text-sm text-white placeholder:text-white/20 outline-none focus:border-[#C8F135]/40 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white/8 hover:bg-white/15 transition-colors"
            >
              <X size={11} className="text-white/50" />
            </button>
          )}
        </div>

        {/* Chips de carroceria */}
        {bodyTypes.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveType(null)}
              className={`h-7 px-3 rounded-full font-body text-xs font-medium transition-all ${
                activeType === null
                  ? 'bg-[#C8F135] text-[#0A0A0F]'
                  : 'border border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
              }`}
            >
              Todos
            </button>
            {bodyTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(activeType === type ? null : type)}
                className={`h-7 px-3 rounded-full font-body text-xs font-medium transition-all ${
                  activeType === type
                    ? 'bg-[#C8F135] text-[#0A0A0F]'
                    : 'border border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                }`}
              >
                {BODY_LABELS[type] ?? type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Contador quando filtrando ─────────────────────────────────── */}
      {hasFilters && (
        <div className="flex items-center justify-between -mt-2">
          <p className="font-body text-xs text-white/25">
            {filtered.length === 0
              ? 'Nenhum resultado'
              : `${filtered.length} de ${vehicles.length} veículo${vehicles.length !== 1 ? 's' : ''}`}
          </p>
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 font-body text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            <X size={10} />
            Limpar
          </button>
        </div>
      )}

      {/* ── Sem resultados ────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-5 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]">
            <Car size={24} className="text-white/15" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-body text-sm text-white/40">Nenhum veículo encontrado</p>
            {search && (
              <p className="font-body text-xs text-white/20">para &ldquo;{search}&rdquo;</p>
            )}
          </div>
          <button
            type="button"
            onClick={clear}
            className="font-body text-xs text-white/30 border border-white/10 px-4 py-2 rounded-xl hover:border-white/20 hover:text-white/50 transition-colors"
          >
            Ver todos os veículos
          </button>
        </div>
      )}

      {/* ── Destaques (só sem filtro ativo) ──────────────────────────── */}
      {featured.length > 0 && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-white/5" />
            <span className="font-body text-xs text-[#C8F135] font-semibold uppercase tracking-widest">
              Em destaque
            </span>
            <span className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map(v => (
              <div key={v.id} className={featured.length === 1 ? 'md:col-span-2' : ''}>
                <VehicleCard
                  vehicle={v}
                  slug={slug}
                  tenantId={tenantId}
                  phone={phone}
                  wide={featured.length === 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Grid principal ────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-5">
          {featured.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-white/5" />
              <span className="font-body text-xs text-white/25 font-semibold uppercase tracking-widest">
                Todos os veículos
              </span>
              <span className="h-px flex-1 bg-white/5" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {rest.map(v => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                slug={slug}
                tenantId={tenantId}
                phone={phone}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
