import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendLeadNotification({
  to,
  tenantName,
  leadName,
  leadPhone,
  vehicleName,
}: {
  to: string
  tenantName: string
  leadName: string
  leadPhone: string
  vehicleName?: string | null
}) {
  const subject = vehicleName
    ? `🔔 Novo lead: ${leadName} quer saber sobre ${vehicleName}`
    : `🔔 Novo lead: ${leadName} entrou em contato`

  const body = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <div style="background:#C8F135;border-radius:8px;padding:4px 12px;display:inline-block;margin-bottom:20px">
        <span style="font-weight:700;color:#000;font-size:13px">Carvys</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:20px;color:#111">Novo lead na sua loja</h2>
      <p style="margin:0 0 24px;color:#666;font-size:14px">${tenantName}</p>

      <div style="background:#f5f5f5;border-radius:10px;padding:20px;margin-bottom:24px">
        <p style="margin:0 0 8px;font-size:14px"><strong>Nome:</strong> ${leadName}</p>
        <p style="margin:0 0 8px;font-size:14px"><strong>WhatsApp:</strong> ${leadPhone}</p>
        ${vehicleName ? `<p style="margin:0;font-size:14px"><strong>Veículo:</strong> ${vehicleName}</p>` : ''}
      </div>

      <a href="https://www.carvys.com.br/app/leads"
         style="display:inline-block;background:#C8F135;color:#000;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
        Ver lead no CRM →
      </a>

      <p style="margin-top:32px;font-size:11px;color:#999">
        Você está recebendo este e-mail porque tem uma loja ativa na Carvys.
      </p>
    </div>
  `

  await resend.emails.send({
    from: 'Carvys <notificacoes@carvys.com.br>',
    to,
    subject,
    html: body,
  })
}

export async function sendTeamInvite({
  to,
  tenantName,
  token,
}: {
  to: string
  tenantName: string
  token: string
}) {
  const inviteUrl = `https://www.carvys.com.br/aceitar-convite?token=${token}`

  const body = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <div style="background:#C8F135;border-radius:8px;padding:4px 12px;display:inline-block;margin-bottom:20px">
        <span style="font-weight:700;color:#000;font-size:13px">Carvys</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:20px;color:#111">Você foi convidado</h2>
      <p style="margin:0 0 24px;color:#666;font-size:14px">
        A loja <strong>${tenantName}</strong> te convidou para fazer parte da equipe na Carvys.
      </p>

      <p style="margin:0 0 16px;color:#444;font-size:14px">
        Clique no botão abaixo para aceitar. Se ainda não tem uma conta, crie uma gratuitamente primeiro em
        <a href="https://www.carvys.com.br/signup" style="color:#000;font-weight:700">carvys.com.br/signup</a>
        e depois acesse o link do convite novamente.
      </p>

      <a href="${inviteUrl}"
         style="display:inline-block;background:#C8F135;color:#000;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
        Aceitar convite →
      </a>

      <p style="margin-top:32px;font-size:11px;color:#999">
        Este convite expira em 7 dias. Se não esperava receber este e-mail, ignore-o.
      </p>
    </div>
  `

  await resend.emails.send({
    from: 'Carvys <notificacoes@carvys.com.br>',
    to,
    subject: `Convite para a equipe ${tenantName} na Carvys`,
    html: body,
  })
}

export async function sendFeedbackEmail({
  tenantName,
  submitterName,
  submitterEmail,
  title,
  description,
}: {
  tenantName: string
  submitterName: string | null
  submitterEmail: string | null
  title: string
  description: string
}) {
  const body = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <div style="background:#C8F135;border-radius:8px;padding:4px 12px;display:inline-block;margin-bottom:20px">
        <span style="font-weight:700;color:#000;font-size:13px">Carvys</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:20px;color:#111">Nova sugestão de melhoria</h2>
      <p style="margin:0 0 24px;color:#666;font-size:14px">Enviada por um cliente</p>

      <div style="background:#f5f5f5;border-radius:10px;padding:20px;margin-bottom:24px">
        <p style="margin:0 0 8px;font-size:14px"><strong>Loja:</strong> ${tenantName}</p>
        ${submitterName ? `<p style="margin:0 0 8px;font-size:14px"><strong>Usuário:</strong> ${submitterName}</p>` : ''}
        ${submitterEmail ? `<p style="margin:0 0 8px;font-size:14px"><strong>E-mail:</strong> ${submitterEmail}</p>` : ''}
        <p style="margin:0 0 8px;font-size:14px"><strong>Título:</strong> ${title}</p>
        <p style="margin:0;font-size:14px"><strong>Descrição:</strong><br/>${description}</p>
      </div>

      <a href="https://www.carvys.com.br/admin/sugestoes"
         style="display:inline-block;background:#C8F135;color:#000;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
        Ver no painel admin →
      </a>
    </div>
  `

  await resend.emails.send({
    from: 'Carvys <notificacoes@carvys.com.br>',
    to: 'usecarvys@gmail.com',
    subject: `💡 Nova sugestão: ${title} — ${tenantName}`,
    html: body,
  })
}
