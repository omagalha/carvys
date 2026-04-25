import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Store, Globe, LogOut, CreditCard, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserTenants } from '@/server/queries/tenants'
import { logout } from '@/server/actions/auth'
import { ProfileForm } from './profile-form'
import { TenantForm } from './tenant-form'
import { StoreInfoForm } from './store-info-form'
import { TeamSection, type TeamMember, type PendingInvite } from './team-section'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single()

  const tenantPlan = tenant.plan_code ?? 'trial'

  // Fetch team members
  const admin = createAdminClient()
  const { data: membershipRows } = await admin
    .from('tenant_memberships')
    .select('id, user_id, role, can_view_financials')
    .eq('tenant_id', tenant.id)
    .eq('status', 'active')
    .order('created_at')

  const teamMembers: TeamMember[] = await Promise.all(
    (membershipRows ?? []).map(async (m) => {
      const { data: { user: authUser } } = await admin.auth.admin.getUserById(m.user_id)
      const { data: p } = await admin.from('profiles').select('full_name').eq('id', m.user_id).single()
      return {
        id:                m.id,
        userId:            m.user_id,
        email:             authUser?.email ?? '—',
        name:              p?.full_name ?? null,
        role:              m.role,
        canViewFinancials: m.can_view_financials ?? false,
      }
    })
  )

  const { data: inviteRows } = await admin
    .from('team_invites')
    .select('id, email, role, expires_at')
    .eq('tenant_id', tenant.id)
    .is('accepted_at', null)
    .gte('expires_at', new Date().toISOString())

  const pendingInvites: PendingInvite[] = (inviteRows ?? []).map(i => ({
    id:        i.id,
    email:     i.email,
    role:      i.role,
    expiresAt: i.expires_at,
  }))

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">Configurações</h1>
        <p className="font-body text-sm text-slate mt-0.5">Gerencie seu perfil e sua loja</p>
      </div>

      {/* Perfil */}
      <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
        <div className="flex items-center gap-2">
          <User size={16} className="text-green" />
          <h2 className="font-body font-semibold text-white text-sm">Meu perfil</h2>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-medium text-slate">E-mail</label>
          <div className="h-11 flex items-center rounded-lg border border-surface bg-surface/50 px-3">
            <span className="font-body text-sm text-slate">{user.email}</span>
          </div>
        </div>

        <ProfileForm
          fullName={profile?.full_name ?? user.user_metadata?.full_name ?? null}
          phone={profile?.phone ?? null}
        />
      </section>

      {/* Loja */}
      <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
        <div className="flex items-center gap-2">
          <Store size={16} className="text-green" />
          <h2 className="font-body font-semibold text-white text-sm">Minha loja</h2>
        </div>

        <TenantForm
          name={tenant.name}
          slug={tenant.slug}
          plan={tenantPlan}
          whatsappPhone={tenant.whatsapp_phone}
        />
      </section>

      {/* Equipe */}
      <TeamSection
        members={teamMembers}
        pendingInvites={pendingInvites}
        planCode={tenantPlan}
        currentUserId={user.id}
      />

      {/* Site da loja */}
      <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-green" />
          <h2 className="font-body font-semibold text-white text-sm">Informações do site</h2>
        </div>
        <p className="font-body text-xs text-slate -mt-2">
          Aparecem no seu site público em carvys.com.br/loja/{tenant.slug}
        </p>

        <StoreInfoForm
          contactEmail={tenant.contact_email}
          contactPhone={tenant.contact_phone}
          address={tenant.address}
          businessHours={tenant.business_hours}
        />
      </section>

      {/* Plano */}
      <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-green" />
          <h2 className="font-body font-semibold text-white text-sm">Plano e cobrança</h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-sm text-white capitalize">
              {tenantPlan === 'trial' ? 'Trial gratuito' : `Plano ${tenantPlan}`}
            </span>
            <span className="font-body text-xs text-slate">
              {tenantPlan === 'trial' ? '7 dias de acesso completo' :
               tenantPlan === 'starter' ? 'R$97/mês' :
               tenantPlan === 'pro' ? 'R$147/mês' : 'R$297/mês'}
            </span>
          </div>
          <Link
            href="/app/billing"
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-surface font-body text-sm text-slate hover:text-white hover:border-slate/40 transition-colors"
          >
            {tenantPlan === 'trial' ? 'Assinar' : 'Gerenciar'}
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* Conta */}
      <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Conta</h2>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 h-10 px-4 rounded-lg border border-alert/30 text-alert hover:bg-alert/10 font-body text-sm transition-colors"
          >
            <LogOut size={15} />
            Sair da conta
          </button>
        </form>
      </section>
    </div>
  )
}
