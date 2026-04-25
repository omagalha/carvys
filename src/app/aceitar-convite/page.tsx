import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Logo } from '@/components/shared/logo'

interface Props {
  searchParams: Promise<{ token?: string }>
}

function InvitePage({ title, message, isError = false }: { title: string; message: string; isError?: boolean }) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6 rounded-2xl bg-deep border border-surface p-8 text-center">
          <Logo size="md" />
          <div className="flex flex-col items-center gap-3">
            {isError
              ? <XCircle size={40} className="text-alert" />
              : <CheckCircle size={40} className="text-green" />
            }
            <h1 className="font-display font-bold text-white text-xl">{title}</h1>
            <p className="font-body text-sm text-slate">{message}</p>
          </div>
          <Link
            href="/app/dashboard"
            className="inline-block bg-green text-dark font-body font-semibold text-sm px-6 py-3 rounded-lg"
          >
            Ir para o painel
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function AcceptInvitePage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) redirect('/login')

  const admin = createAdminClient()

  const { data: invite } = await admin
    .from('team_invites')
    .select('id, tenant_id, email, role, can_view_financials, accepted_at, expires_at, tenants(name)')
    .eq('token', token)
    .maybeSingle()

  if (!invite) {
    return <InvitePage isError title="Convite não encontrado" message="O link pode estar incorreto ou expirado." />
  }
  if (invite.accepted_at) {
    return <InvitePage title="Convite já aceito" message="Este convite já foi utilizado. Faça login para acessar o painel." />
  }
  if (new Date(invite.expires_at) < new Date()) {
    return <InvitePage isError title="Convite expirado" message="Este convite expirou. Peça ao responsável da loja para enviar um novo convite." />
  }

  const tenantName = (invite.tenants as { name: string } | null)?.name ?? 'a loja'

  // Check if user is logged in
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Save return URL in cookie and redirect to login
    const cookieStore = await cookies()
    cookieStore.set('invite_return', `/aceitar-convite?token=${token}`, {
      httpOnly: true,
      secure:   true,
      maxAge:   3600,
      path:     '/',
    })
    redirect('/login')
  }

  if (user.email !== invite.email) {
    return (
      <InvitePage
        isError
        title="E-mail incorreto"
        message={`Este convite foi enviado para ${invite.email}. Você está logado com outro e-mail.`}
      />
    )
  }

  // Accept the invite
  const { error: memberError } = await admin.from('tenant_memberships').insert({
    tenant_id:           invite.tenant_id,
    user_id:             user.id,
    role:                invite.role,
    status:              'active',
    can_view_financials: invite.can_view_financials,
  })

  // Ignore duplicate membership error (idempotent)
  if (memberError && memberError.code !== '23505') {
    console.error('[acceptInvite]', memberError.message)
    return <InvitePage isError title="Erro ao aceitar convite" message="Tente novamente ou entre em contato com o suporte." />
  }

  await admin
    .from('team_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  return (
    <InvitePage
      title="Convite aceito!"
      message={`Você agora faz parte da equipe de ${tenantName}. Acesse o painel para começar.`}
    />
  )
}
