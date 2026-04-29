import Link from 'next/link'
import { CheckCircle2, Circle, Car, MessageCircle, Users } from 'lucide-react'

interface Props {
  hasVehicle: boolean
  hasWhatsApp: boolean
  hasLead: boolean
}

export function OnboardingChecklist({ hasVehicle, hasWhatsApp, hasLead }: Props) {
  const steps = [
    {
      done: hasVehicle,
      icon: Car,
      label: 'Cadastre seu primeiro veículo',
      hint: 'Coloque seu estoque no sistema',
      href: '/app/vehicles/novo',
      cta: 'Adicionar veículo',
    },
    {
      done: hasWhatsApp,
      icon: MessageCircle,
      label: 'Conecte seu WhatsApp',
      hint: 'Fale com leads direto pelo Carvys',
      href: '/app/settings',
      cta: 'Conectar',
    },
    {
      done: hasLead,
      icon: Users,
      label: 'Adicione seu primeiro lead',
      hint: 'Comece a acompanhar suas negociações',
      href: '/app/leads/novo',
      cta: 'Novo lead',
    },
  ]

  const doneCount = steps.filter(s => s.done).length
  if (doneCount === steps.length) return null

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-green/20 bg-green/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-body font-semibold text-white text-sm">Primeiros passos</h2>
          <p className="font-body text-xs text-slate mt-0.5">{doneCount} de {steps.length} concluídos</p>
        </div>
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${s.done ? 'bg-green' : 'bg-surface'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                step.done
                  ? 'opacity-50'
                  : 'border border-surface bg-deep hover:border-green/20'
              }`}
            >
              {step.done
                ? <CheckCircle2 size={16} className="text-green shrink-0" />
                : <Circle size={16} className="text-slate shrink-0" />
              }
              <Icon size={14} className={step.done ? 'text-slate shrink-0' : 'text-green shrink-0'} />
              <div className="flex flex-col flex-1 min-w-0">
                <span className={`font-body text-sm ${step.done ? 'text-slate line-through' : 'text-white'}`}>
                  {step.label}
                </span>
                {!step.done && (
                  <span className="font-body text-xs text-slate">{step.hint}</span>
                )}
              </div>
              {!step.done && (
                <Link
                  href={step.href}
                  className="shrink-0 h-8 px-3 rounded-lg bg-green text-void font-body text-xs font-semibold hover:bg-green/90 transition-colors flex items-center"
                >
                  {step.cta}
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
