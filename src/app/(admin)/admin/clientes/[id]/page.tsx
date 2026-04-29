import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Car, Users, Calendar, MessageCircle, FileText, Activity, Zap, ShieldCheck } from 'lucide-react'
import { getTenantById } from '@/server/queries/admin'
import { getTenantNotes, getTenantEvents, getTenantPlatformMessages, platformMsgLabel } from '@/server/queries/admin-notes'
import { TenantControls } from './tenant-controls'
import { TenantQuickActions } from './tenant-quick-actions'
import { NotesForm } from './notes-form'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function isNew(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000
}

const WELCOME_MSG = (name: string) =>
  encodeURIComponent(
    `Olá ${name}! Seja muito bem-vindo(a) ao Carvys 🚗\nSeu trial de 7 dias já começou. Estou aqui para te ajudar a configurar tudo.\nQualquer dúvida é só chamar!`
  )

const EVENT_ICON: Record<string, string> = {
  created:          '🟢',
  status_changed:   '🔄',
  plan_changed:     '💳',
  payment:          '💰',
  platform_message: '📨',
}

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [tenant, notes, events, platformMessages] = await Promise.all([
    getTenantById(id),
    getTenantNotes(id),
    getTenantEvents(id),
    getTenantPlatformMessages(id),
  ])
  if (!tenant) notFound()

  // Merge events + platform messages into one sorted timeline
  const timeline = [
    ...events.map(e => ({ id: e.id, type: e.type, description: e.description, created_at: e.created_at })),
    ...platformMessages.map(m => ({
      id: m.id,
      type: 'platform_message',
      description: platformMsgLabel(m.type),
      created_at: m.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const stats = [
    { label: 'Veículos cadastrados', value: tenant.vehicle_count, icon: Car },
    { label: 'Leads no funil',       value: tenant.lead_count,   icon: Users },
    { label: 'Usuários ativos',      value: tenant.member_count, icon: Users },
  ]

  const newClient = isNew(tenant.created_at)
  const waPhone = tenant.owner?.phone?.replace(/\D/g, '')

  return (
    <div className="p-6 flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/clientes"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface hover:border-slate/40 transition-colors"
        >
          <ArrowLeft size={16} className="text-slate" />
        </Link>
        <div>
          <h1 className="font-display font-bold text-white text-xl">{tenant.name}</h1>
          <p className="font-body text-xs text-slate mt-0.5">/{tenant.slug}</p>
        </div>
      </div>

      {/* Banner boas-vindas */}
      {newClient && waPhone && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-green/20 bg-green/5 px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <p className="font-body text-sm font-semibold text-white">Novo cliente! 🎉</p>
            <p className="font-body text-xs text-slate">Criou a conta há menos de 24h. Mande uma mensagem de boas-vindas.</p>
          </div>
          <a
            href={`https://wa.me/55${waPhone}?text=${WELCOME_MSG(tenant.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-green px-4 py-2 font-body text-sm font-semibold text-void hover:opacity-90 transition-opacity"
          >
            <MessageCircle size={14} />
            Enviar
          </a>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-4">
            <Icon size={14} className="text-slate" />
            <span className="font-display font-bold text-white text-2xl leading-none">{value}</span>
            <span className="font-body text-[10px] text-slate leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* Responsável */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Responsável</h2>
        {tenant.owner ? (
          <div className="flex flex-col gap-2">
            {tenant.owner.full_name && (
              <div className="flex items-center gap-2">
                <Users size={14} className="text-slate" />
                <span className="font-body text-sm text-white">{tenant.owner.full_name}</span>
              </div>
            )}
            {tenant.owner.email && (
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate" />
                <a href={`mailto:${tenant.owner.email}`} className="font-body text-sm text-green hover:underline">
                  {tenant.owner.email}
                </a>
              </div>
            )}
            {tenant.owner.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate" />
                <a href={`https://wa.me/55${tenant.owner.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-green hover:underline">
                  {tenant.owner.phone}
                </a>
              </div>
            )}
            {tenant.owner.last_sign_in_at && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate" />
                <span className="font-body text-xs text-slate">
                  Último acesso: {formatDate(tenant.owner.last_sign_in_at)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="font-body text-xs text-slate">Sem responsável vinculado</p>
        )}
      </section>

      {/* Informações */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Informações</h2>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate" />
          <span className="font-body text-sm text-slate">Cliente desde</span>
          <span className="font-body text-sm text-white ml-auto">{formatDate(tenant.created_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-slate" />
          <span className="font-body text-sm text-slate">Status</span>
          <span className={`font-body text-sm ml-auto font-semibold ${
            tenant.status === 'active'   ? 'text-green' :
            tenant.status === 'trial'    ? 'text-blue-400' :
            tenant.status === 'past_due' ? 'text-alert' :
            'text-slate'
          }`}>{tenant.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle size={14} className="text-slate" />
          <span className="font-body text-sm text-slate">WhatsApp</span>
          <span className={`font-body text-sm ml-auto ${tenant.whatsapp_connected ? 'text-green' : 'text-slate'}`}>
            {tenant.whatsapp_connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </section>

      {/* Ações rápidas */}
      <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-slate" />
          <h2 className="font-body font-semibold text-white text-sm">Ações rápidas</h2>
        </div>
        <TenantQuickActions
          tenantId={tenant.id}
          slug={tenant.slug}
          ownerPhone={tenant.owner?.phone ?? null}
          asaasCustomerId={tenant.asaas_customer_id}
        />
      </section>

      {/* Controles */}
      <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Controles</h2>
        <TenantControls
          tenantId={tenant.id}
          currentStatus={tenant.status}
          currentPlan={tenant.plan_code}
        />
      </section>

      {/* Notas internas */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-slate" />
          <h2 className="font-body font-semibold text-white text-sm">Notas internas</h2>
        </div>

        <NotesForm tenantId={tenant.id} />

        {notes.length === 0 ? (
          <p className="font-body text-xs text-slate">Nenhuma anotação ainda.</p>
        ) : (
          <div className="flex flex-col gap-2 mt-1">
            {notes.map(note => (
              <div key={note.id} className="flex flex-col gap-1 rounded-lg bg-surface/50 px-3 py-2.5">
                <p className="font-body text-sm text-white whitespace-pre-wrap">{note.content}</p>
                <p className="font-body text-[10px] text-slate">
                  {note.created_by} · {formatDateTime(note.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Timeline enriquecida */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-slate" />
          <h2 className="font-body font-semibold text-white text-sm">Timeline</h2>
        </div>

        {timeline.length === 0 ? (
          <p className="font-body text-xs text-slate">Nenhum evento registrado.</p>
        ) : (
          <div className="flex flex-col gap-0">
            {timeline.map((item, i) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-sm leading-none mt-0.5">{EVENT_ICON[item.type] ?? '📌'}</span>
                  {i < timeline.length - 1 && (
                    <div className="w-px flex-1 bg-surface mt-1 mb-1" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 pb-4">
                  <p className="font-body text-sm text-white">{item.description}</p>
                  <p className="font-body text-[10px] text-slate">{formatDateTime(item.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Log de mensagens automáticas */}
      {platformMessages.length > 0 && (
        <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-slate" />
              <h2 className="font-body font-semibold text-white text-sm">Log anti-spam</h2>
            </div>
            <span className="font-body text-[10px] text-slate">{platformMessages.length} envio{platformMessages.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {platformMessages.map(m => (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-surface/50 px-3 py-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-body text-xs text-white">{platformMsgLabel(m.type)}</span>
                  {m.external_ref && m.external_ref !== '' && (
                    <span className="font-body text-[10px] text-slate">ref: {m.external_ref}</span>
                  )}
                </div>
                <span className="font-body text-[10px] text-slate shrink-0 ml-3">
                  {formatDateTime(m.created_at)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
