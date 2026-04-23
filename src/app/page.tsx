import Link from 'next/link'
import { Check, ArrowRight, BarChart3, Users, Car, TrendingUp, Zap, Shield } from 'lucide-react'

const PLANS = [
  {
    name: 'Starter',
    price: 97,
    description: 'Para revendas que estão começando a se organizar.',
    features: [
      'Até 30 veículos no estoque',
      'CRM de leads ilimitado',
      '2 usuários',
      'Controle financeiro básico',
      'Suporte por e-mail',
    ],
    highlight: false,
    cta: 'Começar agora',
  },
  {
    name: 'Pro',
    price: 147,
    description: 'Para revendas em crescimento que precisam de mais controle.',
    features: [
      'Até 100 veículos no estoque',
      'CRM de leads ilimitado',
      '5 usuários',
      'Controle financeiro completo',
      'Fotos ilimitadas por veículo',
      'Suporte prioritário',
    ],
    highlight: true,
    cta: 'Começar agora',
  },
  {
    name: 'Elite',
    price: 297,
    description: 'Para revendas estabelecidas que exigem o máximo.',
    features: [
      'Veículos ilimitados',
      'CRM de leads ilimitado',
      'Usuários ilimitados',
      'Controle financeiro completo',
      'Fotos ilimitadas por veículo',
      'Suporte VIP via WhatsApp',
    ],
    highlight: false,
    cta: 'Começar agora',
  },
]

const FEATURES = [
  {
    icon: Car,
    title: 'Estoque inteligente',
    description:
      'Cadastre veículos com fotos, defina a ordem das imagens, controle status e nunca perca um carro de vista. Tudo em segundos.',
  },
  {
    icon: Users,
    title: 'CRM de leads',
    description:
      'Funil visual do primeiro contato ao fechamento. Acompanhe cada lead, registre follow-ups e nunca deixe um cliente esfriar.',
  },
  {
    icon: BarChart3,
    title: 'Financeiro em tempo real',
    description:
      'Saiba exatamente quanto você faturou, qual foi seu lucro e qual o ticket médio — por mês, por venda, por veículo.',
  },
]

const PAINS = [
  {
    icon: '📋',
    problem: 'Controla o estoque em planilha',
    solution: 'Estoque visual com fotos e status em tempo real',
  },
  {
    icon: '💬',
    problem: 'Perde leads no WhatsApp',
    solution: 'CRM com funil, follow-ups e lembretes automáticos',
  },
  {
    icon: '💸',
    problem: 'Não sabe se tá lucrando',
    solution: 'Dashboard financeiro com faturamento e margem por venda',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-void text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-surface/50 bg-void/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green">
              <span className="font-display text-base font-black text-void">C</span>
            </div>
            <span className="font-display text-xl font-bold text-white">
              Car<span className="text-green">vys</span>
            </span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="font-body text-sm text-slate transition-colors hover:text-white">
              Produto
            </a>
            <a href="#pricing" className="font-body text-sm text-slate transition-colors hover:text-white">
              Preços
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="font-body text-sm text-slate transition-colors hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="flex h-9 items-center gap-1.5 rounded-lg bg-green px-4 font-body text-sm font-semibold text-void transition-opacity hover:opacity-90"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-32">
        {/* Glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 opacity-20"
          aria-hidden
        >
          <div className="h-[500px] w-[800px] rounded-full bg-green blur-[160px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green/20 bg-green/5 px-4 py-1.5">
            <Zap size={12} className="text-green" />
            <span className="font-body text-xs text-green">7 dias grátis, sem cartão de crédito</span>
          </div>

          <h1 className="font-display text-4xl font-black leading-tight text-white md:text-6xl lg:text-7xl">
            Sua revenda.<br />
            <span className="text-green">Organizada.</span><br />
            Lucrativa.
          </h1>

          <p className="mx-auto mt-6 max-w-xl font-body text-base leading-relaxed text-slate md:text-lg">
            Estoque, leads e financeiro em um só lugar. Pare de perder venda por desorganização e comece a gerir sua revenda como um negócio de verdade.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green px-8 py-4 font-body text-base font-bold text-void transition-opacity hover:opacity-90 sm:w-auto"
            >
              Começar 7 dias grátis
              <ArrowRight size={16} />
            </Link>
            <a
              href="#pricing"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-surface px-8 py-4 font-body text-base text-slate transition-colors hover:border-slate/40 hover:text-white sm:w-auto"
            >
              Ver planos e preços
            </a>
          </div>

          <p className="mt-4 font-body text-xs text-slate">
            Cancele quando quiser. Sem multa, sem burocracia.
          </p>
        </div>
      </section>

      {/* Dores */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-center font-body text-sm uppercase tracking-widest text-slate">
            Reconhece algum desses problemas?
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {PAINS.map(({ icon, problem, solution }) => (
              <div
                key={problem}
                className="flex flex-col gap-4 rounded-xl border border-surface bg-deep p-6"
              >
                <span className="text-2xl">{icon}</span>
                <div className="flex flex-col gap-1">
                  <p className="font-body text-sm text-slate line-through">{problem}</p>
                  <p className="font-body text-sm font-semibold text-white">{solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="mb-3 font-body text-sm uppercase tracking-widest text-green">Produto</p>
            <h2 className="font-display text-3xl font-black text-white md:text-4xl">
              Tudo que sua revenda precisa,<br />sem complicação
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-4 rounded-xl border border-surface bg-deep p-6 transition-colors hover:border-green/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green/10">
                  <Icon size={20} className="text-green" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-base font-bold text-white">{title}</h3>
                  <p className="font-body text-sm leading-relaxed text-slate">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 rounded-2xl border border-green/10 bg-green/5 p-8 md:grid-cols-3">
            {[
              { value: '+30%', label: 'de conversão com CRM' },
              { value: '< 5 min', label: 'para cadastrar um veículo' },
              { value: '100%', label: 'de visibilidade do seu negócio' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <span className="font-display text-4xl font-black text-green">{value}</span>
                <span className="font-body text-sm text-slate">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="mb-3 font-body text-sm uppercase tracking-widest text-green">Preços</p>
            <h2 className="font-display text-3xl font-black text-white md:text-4xl">
              Simples. Sem surpresas.
            </h2>
            <p className="mt-3 font-body text-sm text-slate">
              Todos os planos incluem 7 dias grátis para você testar sem risco.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col gap-6 rounded-xl p-6 ${
                  plan.highlight
                    ? 'border-2 border-green bg-green/5'
                    : 'border border-surface bg-deep'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-green px-3 py-1 font-body text-xs font-bold text-void">
                      Mais popular
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-lg font-bold text-white">{plan.name}</h3>
                  <p className="font-body text-xs leading-relaxed text-slate">{plan.description}</p>
                </div>

                <div className="flex items-end gap-1">
                  <span className="font-body text-sm text-slate">R$</span>
                  <span className="font-display text-4xl font-black text-white leading-none">{plan.price}</span>
                  <span className="font-body text-sm text-slate mb-1">/mês</span>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check size={13} className="shrink-0 text-green" />
                      <span className="font-body text-sm text-slate">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`mt-auto flex h-11 items-center justify-center rounded-lg font-body text-sm font-semibold transition-opacity hover:opacity-90 ${
                    plan.highlight
                      ? 'bg-green text-void'
                      : 'border border-surface text-white hover:border-slate/40'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-surface bg-deep px-8 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green">
              <span className="font-display text-2xl font-black text-void">C</span>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-3xl font-black text-white">
                Comece hoje, gratuitamente.
              </h2>
              <p className="font-body text-sm text-slate">
                7 dias para testar tudo. Sem cartão de crédito, sem compromisso.
              </p>
            </div>
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-xl bg-green px-8 py-4 font-body text-base font-bold text-void transition-opacity hover:opacity-90"
            >
              Criar minha conta grátis
              <ArrowRight size={16} />
            </Link>
            <div className="flex items-center gap-4">
              {['Sem cartão', 'Cancele quando quiser', 'Suporte incluso'].map((item) => (
                <span key={item} className="flex items-center gap-1 font-body text-xs text-slate">
                  <Shield size={10} className="text-green" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-green">
              <span className="font-display text-xs font-black text-void">C</span>
            </div>
            <span className="font-display text-sm font-bold text-white">
              Car<span className="text-green">vys</span>
            </span>
          </div>
          <p className="font-body text-xs text-slate">
            © {new Date().getFullYear()} Carvys. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="font-body text-xs text-slate hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/signup" className="font-body text-xs text-slate hover:text-white transition-colors">
              Cadastrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
