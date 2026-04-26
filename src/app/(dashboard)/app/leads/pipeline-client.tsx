'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import {
  Plus, Users, Phone, Car, MessageCircle, AlertTriangle, Clock,
  Trophy, Search, LayoutGrid, List, X, Check, ChevronDown,
  DollarSign, SlidersHorizontal,
} from 'lucide-react'
import { calcTemperature, TEMP_CONFIG } from '@/lib/temperature'
import { bulkUpdateLeadStage } from '@/server/actions/leads'
import type { LeadWithVehicle, LeadStage } from '@/server/queries/leads'

// ─── Constantes ──────────────────────────────────────────────────────────────

const STAGES: {
  value: LeadStage; label: string; empty: string
  accent: string; dot: string; urgencyDays: number | null
}[] = [
  { value: 'new',         label: 'Novos',      empty: 'Nenhum lead novo.',              accent: 'text-slate',      dot: 'bg-slate',      urgencyDays: 1 },
  { value: 'contacted',   label: 'Contatados', empty: 'Ninguém contatado ainda.',       accent: 'text-blue-400',   dot: 'bg-blue-400',   urgencyDays: 3 },
  { value: 'negotiating', label: 'Negociando', empty: 'Nenhuma negociação em curso.',   accent: 'text-yellow-400', dot: 'bg-yellow-400', urgencyDays: 5 },
  { value: 'won',         label: 'Ganhos',     empty: 'Nenhuma venda fechada ainda.',   accent: 'text-green',      dot: 'bg-green',      urgencyDays: null },
  { value: 'lost',        label: 'Perdidos',   empty: 'Nenhum lead perdido 🎉',         accent: 'text-alert',      dot: 'bg-alert',      urgencyDays: null },
]

const STAGE_COLOR: Record<string, string> = {
  new:         'text-slate bg-surface',
  contacted:   'text-blue-400 bg-blue-400/10',
  negotiating: 'text-yellow-400 bg-yellow-400/10',
  won:         'text-green bg-green/10',
  lost:        'text-alert bg-alert/10',
}

const SOURCE_LABEL: Record<string, string> = {
  instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp',
  site: 'Site', indicacao: 'Indicação', organico: 'Orgânico', outro: 'Outro',
}

function daysSince(iso: string | null) {
  if (!iso) return 0
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

function isUrgent(lead: LeadWithVehicle, urgencyDays: number | null) {
  if (!urgencyDays) return false
  return daysSince(lead.last_contact_at ?? lead.created_at) >= urgencyDays
}

function formatDays(days: number) {
  if (days === 0) return 'hoje'
  if (days === 1) return 'ontem'
  return `${days}d atrás`
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

// ─── Kanban card ─────────────────────────────────────────────────────────────

function LeadCard({
  lead, urgencyDays, selected, onSelect,
}: {
  lead: LeadWithVehicle
  urgencyDays: number | null
  selected: boolean
  onSelect: (id: string) => void
}) {
  const urgent  = isUrgent(lead, urgencyDays)
  const days    = daysSince(lead.last_contact_at ?? lead.created_at)
  const waPhone = lead.phone?.replace(/\D/g, '')
  const initial = lead.name.charAt(0).toUpperCase()
  const temp    = calcTemperature(lead.stage, lead.last_contact_at, lead.created_at)
  const tempCfg = temp ? TEMP_CONFIG[temp] : null

  return (
    <div className={`relative group rounded-xl bg-deep border transition-all duration-200 hover:border-green/30 hover:shadow-lg hover:shadow-green/5 ${
      selected ? 'border-green/50 bg-green/[0.03]' : urgent ? 'border-alert/40 bg-alert/[0.03]' : 'border-surface'
    }`}>
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onSelect(lead.id)}
        className={`absolute top-3 right-3 z-20 flex h-5 w-5 items-center justify-center rounded border transition-all ${
          selected
            ? 'border-green bg-green'
            : 'border-surface bg-void opacity-0 group-hover:opacity-100'
        }`}
      >
        {selected && <Check size={11} className="text-[#0A0A0F]" />}
      </button>

      <Link href={`/app/leads/${lead.id}`} className="absolute inset-0 z-0 rounded-xl" />

      <div className="relative z-10 flex flex-col gap-3 p-4">
        <div className="flex items-start gap-2.5 min-w-0 pr-6">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-body text-xs font-bold ${
            urgent ? 'bg-alert/20 text-alert' : 'bg-surface text-slate'
          }`}>
            {initial}
          </div>
          <div className="min-w-0">
            <span className="font-body font-semibold text-white text-sm truncate block group-hover:text-green transition-colors">
              {lead.name}
            </span>
            {lead.expected_value && (
              <span className="font-body text-[10px] text-green/70">{fmt(lead.expected_value)}</span>
            )}
          </div>
          {urgent && <AlertTriangle size={13} className="text-alert shrink-0 mt-0.5 ml-auto" />}
        </div>

        <div className="flex flex-col gap-1.5">
          {lead.phone && (
            <div className="flex items-center gap-1.5">
              <Phone size={10} className="text-slate shrink-0" />
              <span className="font-body text-xs text-slate truncate">{lead.phone}</span>
            </div>
          )}
          {lead.vehicles && (
            <div className="flex items-center gap-1.5">
              <Car size={10} className="text-slate shrink-0" />
              <span className="font-body text-xs text-slate truncate">
                {lead.vehicles.brand} {lead.vehicles.model}
                {lead.vehicles.year_model ? ` ${lead.vehicles.year_model}` : ''}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-surface/60">
          {lead.source && (
            <span className="font-body text-[10px] text-slate bg-surface/60 px-1.5 py-0.5 rounded-full truncate">
              {SOURCE_LABEL[lead.source] ?? lead.source}
            </span>
          )}
          {tempCfg && (
            <span className={`font-body text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${tempCfg.color} ${tempCfg.bg} ${tempCfg.border} shrink-0`}>
              {tempCfg.emoji} {tempCfg.label}
            </span>
          )}
          <div className={`flex items-center gap-1 ml-auto font-body text-[10px] shrink-0 ${urgent ? 'text-alert font-semibold' : 'text-slate'}`}>
            <Clock size={9} />
            {formatDays(days)}
          </div>
          {waPhone && (
            <a
              href={`https://wa.me/55${waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-20 flex h-6 w-6 items-center justify-center rounded-md bg-green/10 hover:bg-green/25 transition-colors shrink-0"
            >
              <MessageCircle size={11} className="text-green" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Kanban view ─────────────────────────────────────────────────────────────

function KanbanView({
  byStage, selected, onSelect,
}: {
  byStage: Record<LeadStage, LeadWithVehicle[]>
  selected: Set<string>
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-6 md:px-6 flex-1">
      {STAGES.map(stage => {
        const leads = byStage[stage.value] ?? []
        return (
          <div key={stage.value} className="flex flex-col gap-3 min-w-[240px] w-[240px] flex-shrink-0">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${stage.dot}`} />
                <span className={`font-body text-xs font-semibold ${stage.accent}`}>{stage.label}</span>
              </div>
              <span className="font-body text-xs text-slate bg-surface px-2 py-0.5 rounded-full">{leads.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {leads.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-surface py-8 text-center px-3">
                  <p className="font-body text-xs text-slate leading-relaxed">{stage.empty}</p>
                  {stage.value === 'new' && (
                    <Link href="/app/leads/novo" className="font-body text-xs text-green hover:underline">+ Adicionar</Link>
                  )}
                </div>
              ) : (
                leads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    urgencyDays={stage.urgencyDays}
                    selected={selected.has(lead.id)}
                    onSelect={onSelect}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── List view ───────────────────────────────────────────────────────────────

function ListView({
  leads, selected, onSelect, onSelectAll,
}: {
  leads: LeadWithVehicle[]
  selected: Set<string>
  onSelect: (id: string) => void
  onSelectAll: () => void
}) {
  const allSelected = leads.length > 0 && leads.every(l => selected.has(l.id))

  return (
    <div className="px-4 pb-6 md:px-6 flex-1 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-surface">
            <th className="py-3 pr-4 w-8">
              <button
                type="button"
                onClick={onSelectAll}
                className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                  allSelected ? 'border-green bg-green' : 'border-surface hover:border-slate/50'
                }`}
              >
                {allSelected && <Check size={11} className="text-[#0A0A0F]" />}
              </button>
            </th>
            {['Nome', 'Etapa', 'Origem', 'Temperatura', 'Valor', 'Último contato', ''].map(h => (
              <th key={h} className="py-3 pr-4 text-left font-body text-xs text-slate font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => {
            const temp    = calcTemperature(lead.stage, lead.last_contact_at, lead.created_at)
            const tempCfg = temp ? TEMP_CONFIG[temp] : null
            const days    = daysSince(lead.last_contact_at ?? lead.created_at)
            const waPhone = lead.phone?.replace(/\D/g, '')
            const stageCfg = STAGE_COLOR[lead.stage]

            return (
              <tr
                key={lead.id}
                className={`border-b border-surface/50 transition-colors hover:bg-surface/30 ${selected.has(lead.id) ? 'bg-green/[0.03]' : ''}`}
              >
                {/* Checkbox */}
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    onClick={() => onSelect(lead.id)}
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                      selected.has(lead.id) ? 'border-green bg-green' : 'border-surface hover:border-slate/50'
                    }`}
                  >
                    {selected.has(lead.id) && <Check size={11} className="text-[#0A0A0F]" />}
                  </button>
                </td>

                {/* Nome */}
                <td className="py-3 pr-4">
                  <Link href={`/app/leads/${lead.id}`} className="flex flex-col gap-0.5 hover:text-green transition-colors">
                    <span className="font-body text-sm text-white font-medium">{lead.name}</span>
                    {lead.vehicles && (
                      <span className="font-body text-[10px] text-slate">
                        {lead.vehicles.brand} {lead.vehicles.model}
                      </span>
                    )}
                  </Link>
                </td>

                {/* Etapa */}
                <td className="py-3 pr-4">
                  <span className={`inline-flex font-body text-[10px] font-medium px-2 py-0.5 rounded-full ${stageCfg}`}>
                    {STAGES.find(s => s.value === lead.stage)?.label ?? lead.stage}
                  </span>
                </td>

                {/* Origem */}
                <td className="py-3 pr-4">
                  <span className="font-body text-xs text-slate">
                    {lead.source ? (SOURCE_LABEL[lead.source] ?? lead.source) : '—'}
                  </span>
                </td>

                {/* Temperatura */}
                <td className="py-3 pr-4">
                  {tempCfg ? (
                    <span className={`inline-flex items-center gap-1 font-body text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${tempCfg.color} ${tempCfg.bg} ${tempCfg.border}`}>
                      {tempCfg.emoji} {tempCfg.label}
                    </span>
                  ) : <span className="text-slate text-xs">—</span>}
                </td>

                {/* Valor */}
                <td className="py-3 pr-4">
                  <span className="font-body text-xs text-white">
                    {lead.expected_value ? fmt(lead.expected_value) : '—'}
                  </span>
                </td>

                {/* Último contato */}
                <td className="py-3 pr-4">
                  <span className="font-body text-xs text-slate">{formatDays(days)}</span>
                </td>

                {/* WA */}
                <td className="py-3">
                  {waPhone && (
                    <a
                      href={`https://wa.me/55${waPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-green/10 hover:bg-green/25 transition-colors"
                    >
                      <MessageCircle size={13} className="text-green" />
                    </a>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {leads.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Users size={24} className="text-slate/40" />
          <p className="font-body text-sm text-slate">Nenhum lead encontrado</p>
        </div>
      )}
    </div>
  )
}

// ─── PipelineClient ───────────────────────────────────────────────────────────

export function PipelineClient({ leads }: { leads: LeadWithVehicle[] }) {
  const [view,         setView]         = useState<'kanban' | 'list'>('kanban')
  const [search,       setSearch]       = useState('')
  const [filterSource, setFilterSource] = useState<string | null>(null)
  const [filterTemp,   setFilterTemp]   = useState<string | null>(null)
  const [showFilters,  setShowFilters]  = useState(false)
  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const [bulkStage,    setBulkStage]    = useState('')
  const [pending,      startTransition] = useTransition()

  const sources = useMemo(() => [...new Set(leads.map(l => l.source).filter(Boolean))] as string[], [leads])

  const filtered = useMemo(() => {
    let result = leads
    const q = search.trim().toLowerCase()
    if (q) result = result.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q))
    if (filterSource) result = result.filter(l => l.source === filterSource)
    if (filterTemp) result = result.filter(l => {
      const t = calcTemperature(l.stage, l.last_contact_at, l.created_at)
      return t === filterTemp
    })
    return result
  }, [leads, search, filterSource, filterTemp])

  const active        = filtered.filter(l => l.stage !== 'won' && l.stage !== 'lost')
  const pipelineValue = active.reduce((s, l) => s + (l.expected_value ?? 0), 0)
  const urgent        = active.filter(l => {
    const stage = STAGES.find(s => s.value === l.stage)
    return isUrgent(l, stage?.urgencyDays ?? null)
  })
  const wonThisMonth = filtered.filter(l => {
    if (l.stage !== 'won') return false
    const now = new Date()
    const d   = new Date(l.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const byStage = useMemo(() => Object.fromEntries(
    STAGES.map(s => [s.value, filtered.filter(l => l.stage === s.value)])
  ) as Record<LeadStage, LeadWithVehicle[]>, [filtered])

  const hasFilters = !!search || !!filterSource || !!filterTemp

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    const allIds = filtered.map(l => l.id)
    const allSelected = allIds.every(id => selected.has(id))
    setSelected(allSelected ? new Set() : new Set(allIds))
  }

  function clearSelection() {
    setSelected(new Set())
    setBulkStage('')
  }

  function applyBulk() {
    if (!bulkStage || selected.size === 0) return
    const ids = [...selected]
    startTransition(async () => {
      await bulkUpdateLeadStage(ids, bulkStage)
      clearSelection()
    })
  }

  return (
    <div className="flex flex-col gap-0 h-full">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-3 md:px-6 md:pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-white text-2xl">Pipeline</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="font-body text-sm text-slate">{active.length} lead{active.length !== 1 ? 's' : ''} ativos</p>
              {pipelineValue > 0 && (
                <>
                  <span className="text-slate/30">·</span>
                  <div className="flex items-center gap-1">
                    <DollarSign size={11} className="text-green/70" />
                    <span className="font-body text-sm text-green/70 font-medium">{fmt(pipelineValue)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {urgent.length > 0 && (
              <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-alert/10 border border-alert/20">
                <AlertTriangle size={13} className="text-alert" />
                <span className="font-body text-xs text-alert font-semibold">{urgent.length} urgente{urgent.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            {wonThisMonth.length > 0 && (
              <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-green/10 border border-green/20">
                <Trophy size={13} className="text-green" />
                <span className="font-body text-xs text-green font-semibold">{wonThisMonth.length} fechamento{wonThisMonth.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            <Link
              href="/app/leads/novo"
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-green text-void font-body font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={15} />
              Novo lead
            </Link>
          </div>
        </div>

        {/* ── Barra de busca + toggle ─────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou telefone..."
              className="h-9 w-full rounded-lg border border-surface bg-void pl-9 pr-3 font-body text-sm text-white placeholder:text-slate/40 focus:outline-none focus:border-green transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate hover:text-white transition-colors">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filtros toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border font-body text-xs transition-all ${
              hasFilters
                ? 'border-green/40 bg-green/10 text-green'
                : 'border-surface text-slate hover:text-white hover:border-slate/40'
            }`}
          >
            <SlidersHorizontal size={13} />
            {hasFilters ? 'Filtrando' : 'Filtros'}
          </button>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-surface overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={`flex items-center justify-center h-9 w-9 transition-colors ${view === 'kanban' ? 'bg-surface text-white' : 'text-slate hover:text-white'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`flex items-center justify-center h-9 w-9 transition-colors ${view === 'list' ? 'bg-surface text-white' : 'text-slate hover:text-white'}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* ── Painel de filtros ───────────────────────────────────────── */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-surface bg-deep">
            {/* Origem */}
            <div className="flex flex-col gap-1">
              <span className="font-body text-[10px] text-slate uppercase tracking-wide">Origem</span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFilterSource(null)}
                  className={`h-7 px-2.5 rounded-full font-body text-xs transition-all ${!filterSource ? 'bg-green text-void' : 'border border-surface text-slate hover:text-white'}`}
                >
                  Todas
                </button>
                {sources.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilterSource(filterSource === s ? null : s)}
                    className={`h-7 px-2.5 rounded-full font-body text-xs transition-all ${filterSource === s ? 'bg-green text-void' : 'border border-surface text-slate hover:text-white'}`}
                  >
                    {SOURCE_LABEL[s] ?? s}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px bg-surface self-stretch mx-1" />

            {/* Temperatura */}
            <div className="flex flex-col gap-1">
              <span className="font-body text-[10px] text-slate uppercase tracking-wide">Temperatura</span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFilterTemp(null)}
                  className={`h-7 px-2.5 rounded-full font-body text-xs transition-all ${!filterTemp ? 'bg-green text-void' : 'border border-surface text-slate hover:text-white'}`}
                >
                  Todas
                </button>
                {(['hot', 'warm', 'cold', 'frozen'] as const).map(t => {
                  const cfg = TEMP_CONFIG[t]
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFilterTemp(filterTemp === t ? null : t)}
                      className={`h-7 px-2.5 rounded-full font-body text-xs transition-all border ${filterTemp === t ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'border-surface text-slate hover:text-white'}`}
                    >
                      {cfg.emoji} {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {hasFilters && (
              <>
                <div className="w-px bg-surface self-stretch mx-1" />
                <button
                  type="button"
                  onClick={() => { setFilterSource(null); setFilterTemp(null); setSearch('') }}
                  className="self-end flex items-center gap-1 font-body text-xs text-slate hover:text-white transition-colors"
                >
                  <X size={11} /> Limpar
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Bulk action bar ─────────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mx-4 md:mx-6 mb-3 px-4 py-2.5 rounded-xl bg-surface border border-white/10">
          <span className="font-body text-xs text-white font-semibold">{selected.size} selecionado{selected.size !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="relative">
              <select
                value={bulkStage}
                onChange={e => setBulkStage(e.target.value)}
                className="h-8 rounded-lg border border-surface bg-void pl-3 pr-8 font-body text-xs text-white focus:outline-none focus:border-green transition-colors appearance-none"
              >
                <option value="">Mover para...</option>
                {STAGES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate" />
            </div>
            <button
              type="button"
              onClick={applyBulk}
              disabled={!bulkStage || pending}
              className="h-8 px-3 rounded-lg bg-green font-body text-xs font-semibold text-void disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {pending ? 'Aplicando...' : 'Aplicar'}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="h-8 px-3 rounded-lg border border-surface font-body text-xs text-slate hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Conteúdo vazio ──────────────────────────────────────────────── */}
      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 mx-4 md:mx-6 rounded-2xl border border-dashed border-surface py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
            <Users size={24} className="text-slate" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-body text-sm font-semibold text-white">Nenhum lead ainda</p>
            <p className="font-body text-xs text-slate">Cadastre seu primeiro lead e comece a fechar negócios</p>
          </div>
          <Link
            href="/app/leads/novo"
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-green text-void font-body font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            Cadastrar primeiro lead
          </Link>
        </div>
      ) : view === 'kanban' ? (
        <KanbanView byStage={byStage} selected={selected} onSelect={toggleSelect} />
      ) : (
        <ListView leads={filtered} selected={selected} onSelect={toggleSelect} onSelectAll={selectAll} />
      )}
    </div>
  )
}
