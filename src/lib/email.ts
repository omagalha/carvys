import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail({
  to,
  firstName,
  tenantName,
}: {
  to: string
  firstName: string
  tenantName: string
}) {
  const body = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <div style="background:#C8F135;border-radius:8px;padding:4px 12px;display:inline-block;margin-bottom:24px">
        <span style="font-weight:700;color:#000;font-size:13px">Carvys</span>
      </div>

      <h2 style="margin:0 0 8px;font-size:22px;color:#111">Bem-vindo, ${firstName}! 🎉</h2>
      <p style="margin:0 0 24px;color:#555;font-size:14px">
        Sua loja <strong>${tenantName}</strong> está criada. Você tem 7 dias de acesso completo e gratuito.
      </p>

      <p style="margin:0 0 16px;color:#111;font-size:15px;font-weight:600">Por onde começar:</p>

      <div style="background:#f9f9f9;border-radius:10px;padding:20px;margin-bottom:24px">
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px">
          <div style="background:#C8F135;color:#000;font-weight:700;font-size:12px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">1</div>
          <div>
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111">Cadastre seu primeiro veículo</p>
            <p style="margin:0;font-size:13px;color:#666">Coloque seu estoque no sistema com fotos e preço.</p>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px">
          <div style="background:#C8F135;color:#000;font-weight:700;font-size:12px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">2</div>
          <div>
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111">Conecte seu WhatsApp</p>
            <p style="margin:0;font-size:13px;color:#666">Fale com seus leads direto pelo Carvys, sem trocar de app.</p>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="background:#C8F135;color:#000;font-weight:700;font-size:12px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">3</div>
          <div>
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111">Adicione seu primeiro lead</p>
            <p style="margin:0;font-size:13px;color:#666">Comece a acompanhar suas negociações no funil de vendas.</p>
          </div>
        </div>
      </div>

      <a href="https://www.carvys.com.br/app/dashboard"
         style="display:inline-block;background:#C8F135;color:#000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none">
        Acessar minha loja →
      </a>

      <p style="margin-top:32px;font-size:12px;color:#999">
        Qualquer dúvida, responda este e-mail ou fale no WhatsApp. Estamos aqui para ajudar.
      </p>
    </div>
  `

  await resend.emails.send({
    from: 'Thales da Carvys <notificacoes@carvys.com.br>',
    to,
    subject: `Bem-vindo ao Carvys, ${firstName}! Veja como começar`,
    html: body,
  })
}

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

export async function sendTrialExpiringEmail({
  to,
  tenantName,
  daysLeft,
}: {
  to: string
  tenantName: string
  daysLeft: number
}) {
  const body = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <div style="background:#C8F135;border-radius:8px;padding:4px 12px;display:inline-block;margin-bottom:20px">
        <span style="font-weight:700;color:#000;font-size:13px">Carvys</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:20px;color:#111">Seu trial expira ${daysLeft === 0 ? 'hoje' : `em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}`}</h2>
      <p style="margin:0 0 24px;color:#666;font-size:14px">${tenantName}</p>

      <p style="margin:0 0 24px;color:#444;font-size:14px">
        Para continuar usando o Carvys sem interrupção, assine um dos planos antes que o período gratuito acabe.
      </p>

      <a href="https://www.carvys.com.br/app/billing"
         style="display:inline-block;background:#C8F135;color:#000;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
        Assinar agora →
      </a>

      <p style="margin-top:32px;font-size:11px;color:#999">
        Você está recebendo este e-mail porque tem uma loja ativa na Carvys.
      </p>
    </div>
  `

  await resend.emails.send({
    from: 'Carvys <notificacoes@carvys.com.br>',
    to,
    subject: `⏳ Seu trial ${daysLeft === 0 ? 'expira hoje' : `expira em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}`} — ${tenantName}`,
    html: body,
  })
}

export async function sendPaymentOverdueEmail({
  to,
  tenantName,
  value,
}: {
  to: string
  tenantName: string
  value: number
}) {
  const body = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <div style="background:#C8F135;border-radius:8px;padding:4px 12px;display:inline-block;margin-bottom:20px">
        <span style="font-weight:700;color:#000;font-size:13px">Carvys</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:20px;color:#111">Pagamento em atraso</h2>
      <p style="margin:0 0 24px;color:#666;font-size:14px">${tenantName}</p>

      <div style="background:#fff3f3;border-radius:10px;padding:20px;margin-bottom:24px;border:1px solid #ffcccc">
        <p style="margin:0;font-size:14px;color:#cc0000">
          Uma cobrança de <strong>R$${value.toFixed(2).replace('.', ',')}</strong> está em atraso.
          Regularize para não perder o acesso ao sistema.
        </p>
      </div>

      <a href="https://www.carvys.com.br/app/billing"
         style="display:inline-block;background:#C8F135;color:#000;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
        Regularizar pagamento →
      </a>

      <p style="margin-top:32px;font-size:11px;color:#999">
        Você está recebendo este e-mail porque tem uma loja ativa na Carvys.
      </p>
    </div>
  `

  await resend.emails.send({
    from: 'Carvys <notificacoes@carvys.com.br>',
    to,
    subject: `⚠️ Pagamento em atraso — ${tenantName}`,
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
