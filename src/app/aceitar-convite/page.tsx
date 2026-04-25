import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { InvitePage } from './invite-ui'

interface Props {
  searchParams: Promise<{ token?: string }>
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

  const tenantName = (invite.tenants as unknown as { name: string } | null)?.name ?? 'a loja'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
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

  const { error: memberError } = await admin.from('tenant_memberships').insert({
    tenant_id:           invite.tenant_id,
    user_id:             user.id,
    role:                invite.role,
    status:              'active',
    can_view_financials: invite.can_view_financials,
  })

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
