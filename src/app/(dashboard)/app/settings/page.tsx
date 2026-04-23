import { redirect } from 'next/navigation'
import { User, Store, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { logout } from '@/server/actions/auth'
import { ProfileForm } from './profile-form'
import { TenantForm } from './tenant-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants as { id: string; name: string; slug: string; status: string }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single()

  const tenantPlan = (memberships[0].tenants as { plan_code?: string }).plan_code ?? 'trial'

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
        />
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
