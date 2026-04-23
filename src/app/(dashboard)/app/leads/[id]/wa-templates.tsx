'use client'

import { MessageCircle } from 'lucide-react'

type Props = {
  stage: string
  leadName: string
  phone: string
  vehicleName?: string
}

type Template = {
  label: string
  message: (name: string, vehicle: string) => string
}

const TEMPLATES: Record<string, Template[]> = {
  new: [
    {
      label: 'Primeiro contato',
      message: (name, vehicle) => vehicle
        ? `Olá ${name}! 👋 Aqui é da nossa loja. Vi que você se interessou pelo ${vehicle}. Ainda tem interesse? Posso te passar mais detalhes 😊`
        : `Olá ${name}! 👋 Aqui é da nossa loja. Você entrou em contato conosco. Como posso te ajudar?`,
    },
    {
      label: 'Agendar visita',
      message: (name, vehicle) => vehicle
        ? `Oi ${name}, tudo bem? Quando seria um bom momento pra você vir conhecer o ${vehicle} pessoalmente? 🚗`
        : `Oi ${name}, tudo bem? Quando você poderia vir até a loja? Tenho ótimas opções pra te mostrar 🚗`,
    },
  ],
  contacted: [
    {
      label: 'Follow-up',
      message: (name, vehicle) => vehicle
        ? `Oi ${name}! 😊 Passando pra saber se ainda tem interesse no ${vehicle}. Tem alguma dúvida que posso esclarecer?`
        : `Oi ${name}! Passando pra saber se ainda tem interesse. Posso te ajudar com mais alguma coisa?`,
    },
    {
      label: 'Condições especiais',
      message: (name, vehicle) => vehicle
        ? `Olá ${name}! Temos ótimas condições de financiamento pro ${vehicle} essa semana. Quer que eu te passe os detalhes? 🎯`
        : `Olá ${name}! Estamos com condições especiais de financiamento essa semana. Posso te apresentar as opções?`,
    },
    {
      label: 'Lembrete de visita',
      message: (name, vehicle) => vehicle
        ? `Oi ${name}! Você teve chance de pensar em vir ver o ${vehicle}? Posso reservar um horário pra você 😊`
        : `Oi ${name}! Você teve chance de pensar em nos visitar? Posso reservar um horário pra você 😊`,
    },
  ],
  negotiating: [
    {
      label: 'Confirmar proposta',
      message: (name, vehicle) => vehicle
        ? `Oi ${name}! Queria confirmar se você recebeu nossa proposta pro ${vehicle}. Tem algum ponto que podemos ajustar? 😊`
        : `Oi ${name}! Você recebeu nossa proposta? Tem alguma dúvida ou ponto que posso esclarecer?`,
    },
    {
      label: 'Fechar negócio',
      message: (name, vehicle) => vehicle
        ? `Olá ${name}! Conseguimos uma condição especial pro ${vehicle}. Quando podemos fechar negócio? 🤝`
        : `Olá ${name}! Estamos com uma oportunidade especial. Quando podemos finalizar o negócio? 🤝`,
    },
    {
      label: 'Urgência',
      message: (name, vehicle) => vehicle
        ? `Oi ${name}! O ${vehicle} está com bastante procura. Não quero que você perca essa oportunidade. Consegue dar uma resposta hoje? 🚗`
        : `Oi ${name}! O veículo que você está interessado está com procura alta. Consegue dar uma resposta hoje?`,
    },
  ],
  won: [
    {
      label: 'Parabéns',
      message: (name, vehicle) => vehicle
        ? `Olá ${name}! Parabéns pelo seu novo ${vehicle}! 🎉 Foi um prazer negociar com você. Qualquer coisa, pode me chamar!`
        : `Olá ${name}! Parabéns pela conquista! 🎉 Foi um prazer negociar com você. Qualquer coisa, pode me chamar!`,
    },
    {
      label: 'Pedir indicação',
      message: (name) =>
        `Oi ${name}! Espero que esteja aproveitando o carro! Se algum amigo ou familiar precisar de um veículo, adoraria ajudar. Um abraço! 😊`,
    },
  ],
}

function buildWALink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, '')
  const number = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function WATemplates({ stage, leadName, phone, vehicleName }: Props) {
  const templates = TEMPLATES[stage]
  if (!templates) return null

  const firstName = leadName.split(' ')[0]
  const vehicle = vehicleName ?? ''

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
      <div className="flex items-center gap-2">
        <MessageCircle size={14} className="text-[#25D366]" />
        <h2 className="font-body font-semibold text-white text-sm">Mensagens rápidas</h2>
      </div>

      <div className="flex flex-col gap-2">
        {templates.map(t => {
          const msg = t.message(firstName, vehicle)
          return (
            <a
              key={t.label}
              href={buildWALink(phone, msg)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-1.5 rounded-lg border border-surface hover:border-[#25D366]/40 hover:bg-[#25D366]/[0.04] p-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-body text-xs font-semibold text-[#25D366]">{t.label}</span>
                <span className="font-body text-[10px] text-slate opacity-0 group-hover:opacity-100 transition-opacity">
                  Abrir WhatsApp →
                </span>
              </div>
              <p className="font-body text-xs text-slate leading-relaxed line-clamp-2">{msg}</p>
            </a>
          )
        })}
      </div>
    </section>
  )
}
