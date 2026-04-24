import Link from 'next/link'
import { Reveal } from './_reveal'

const CHECK = (
  <span style={{ width: 18, height: 18, background: 'rgba(200,241,53,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#C8F135" strokeWidth="2.5">
      <polyline points="2,6 5,9 10,3" />
    </svg>
  </span>
)

const DASH = (
  <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, color: '#444', fontSize: 12 }}>—</span>
)

export default function HomePage() {
  return (
    <div style={{ background: '#080808', color: '#F0F0F0', fontFamily: "'DM Sans', -apple-system, sans-serif", fontSize: 16, lineHeight: 1.6, overflowX: 'hidden', WebkitFontSmoothing: 'antialiased' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(8,8,8,0.85)', borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.5px', color: '#F0F0F0' }}>
          Car<span style={{ color: '#C8F135' }}>vys</span>
        </div>
        <ul style={{ display: 'flex', gap: 36, listStyle: 'none', margin: 0, padding: 0 }} className="nav-links">
          <li><a href="#planos" style={{ color: '#888', textDecoration: 'none', fontSize: 14, fontWeight: 400 }}>Planos</a></li>
          <li><a href="#comparativo" style={{ color: '#888', textDecoration: 'none', fontSize: 14, fontWeight: 400 }}>Comparativo</a></li>
          <li><a href="#depoimentos" style={{ color: '#888', textDecoration: 'none', fontSize: 14, fontWeight: 400 }}>Depoimentos</a></li>
          <li><Link href="/login" style={{ color: '#888', textDecoration: 'none', fontSize: 14, fontWeight: 400 }}>Entrar</Link></li>
        </ul>
        <Link href="/signup" style={{
          background: '#C8F135', color: '#000', fontWeight: 600, padding: '10px 22px',
          borderRadius: 50, textDecoration: 'none', fontSize: 14, transition: 'opacity 0.2s',
          display: 'inline-block',
        }}>
          Começar agora
        </Link>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden',
      }}>
        {/* glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 700, height: 400,
          background: 'radial-gradient(ellipse, rgba(200,241,53,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(200,241,53,0.12)', border: '1px solid rgba(200,241,53,0.2)',
          borderRadius: 50, padding: '6px 16px', fontSize: 12,
          fontFamily: "'DM Mono', monospace", color: '#C8F135', letterSpacing: '0.5px',
          marginBottom: 40,
          animation: 'fadeUp 0.6s ease forwards 0.1s', opacity: 0,
        }}>
          <span style={{ width: 6, height: 6, background: '#C8F135', borderRadius: '50%', animation: 'pulse 2s infinite', display: 'inline-block' }} />
          CRM automotivo inteligente
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 76px)', fontWeight: 600, lineHeight: 1.08,
          letterSpacing: '-2px', maxWidth: 860, color: '#F0F0F0',
          animation: 'fadeUp 0.7s ease forwards 0.2s', opacity: 0,
          margin: 0,
        }}>
          Você perde vendas<br />todos os dias e<br />
          <em style={{ fontStyle: 'normal', color: '#C8F135' }}>nem percebe.</em>
        </h1>

        <p style={{
          marginTop: 28, fontSize: 'clamp(15px, 2vw, 18px)', color: '#888',
          maxWidth: 520, fontWeight: 300, lineHeight: 1.7,
          animation: 'fadeUp 0.7s ease forwards 0.35s', opacity: 0,
        }}>
          Automatize seu funil, controle seus leads e feche mais negócios — tudo em uma plataforma feita para concessionárias.
        </p>

        <div style={{
          marginTop: 48, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeUp 0.7s ease forwards 0.5s', opacity: 0,
        }}>
          <Link href="/signup" style={{
            background: '#C8F135', color: '#000', fontWeight: 600, fontSize: 15,
            padding: '15px 34px', borderRadius: 50, textDecoration: 'none',
            display: 'inline-block', boxShadow: '0 0 32px rgba(200,241,53,0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}>
            Começar agora
          </Link>
          <a href="#planos" style={{
            background: 'transparent', color: '#888', fontSize: 15,
            padding: '15px 34px', borderRadius: 50, textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.12)', display: 'inline-block',
            transition: 'color 0.2s, border-color 0.2s',
          }}>
            Ver planos
          </a>
        </div>

        <div style={{
          marginTop: 80, display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeUp 0.7s ease forwards 0.65s', opacity: 0,
        }}>
          {[
            { value: '+2.400', label: 'concessionárias ativas' },
            { value: 'R$ 4,2M', label: 'em vendas geradas/mês' },
            { value: '34%', label: 'aumento médio em conversão' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: 28, fontWeight: 600, color: '#F0F0F0', letterSpacing: '-1px' }}>{value}</strong>
              <span style={{ fontSize: 13, color: '#444' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" style={{ padding: '100px 24px', background: '#080808' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal className="pricing-header" style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#C8F135', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Planos</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#F0F0F0', marginBottom: 16 }}>
              Simples. Transparente.<br />Sem surpresas.
            </h2>
            <p style={{ fontSize: 16, color: '#888', fontWeight: 300, maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
              Escolha o plano ideal para o tamanho da sua operação. Cancele quando quiser.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>

            {/* Starter */}
            <Reveal>
              <div style={{
                background: '#101010', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '36px 32px', position: 'relative',
                transition: 'transform 0.3s, border-color 0.3s',
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#888', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>Starter</div>
                <div style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-2px', color: '#F0F0F0', lineHeight: 1, marginBottom: 4 }}>
                  <sup style={{ fontSize: 20, fontWeight: 400, verticalAlign: 'super', letterSpacing: 0 }}>R$</sup>97
                </div>
                <div style={{ fontSize: 13, color: '#444', marginBottom: 20 }}>/mês por concessionária</div>
                <div style={{ fontSize: 14, color: '#888', marginBottom: 28, lineHeight: 1.6, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  Para quem está começando a organizar o processo de vendas e precisa de controle básico.
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                  {['CRM de leads (até 200/mês)', 'Funil de vendas visual', 'Gestão de tarefas', 'Relatórios básicos'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#888' }}>{CHECK}{f}</li>
                  ))}
                  {['Automações', 'Controle financeiro', 'Suporte prioritário'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#444' }}>{DASH}{f}</li>
                  ))}
                </ul>
                <Link href="/signup" style={{
                  display: 'block', textAlign: 'center', padding: '14px', borderRadius: 50,
                  fontSize: 14, fontWeight: 600, textDecoration: 'none',
                  background: 'transparent', color: '#888', border: '1px solid rgba(255,255,255,0.12)',
                  transition: 'all 0.2s',
                }}>
                  Começar grátis
                </Link>
              </div>
            </Reveal>

            {/* Pro — featured */}
            <Reveal delay={80}>
              <div style={{
                background: '#141414',
                border: '1px solid rgba(200,241,53,0.35)',
                boxShadow: '0 0 60px rgba(200,241,53,0.08), 0 0 0 1px rgba(200,241,53,0.1) inset',
                borderRadius: 16, padding: '36px 32px', position: 'relative',
                transform: 'translateY(-8px)',
                transition: 'transform 0.3s, border-color 0.3s',
              }}>
                <div style={{
                  display: 'inline-block', background: '#C8F135', color: '#000',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.5px',
                  padding: '4px 12px', borderRadius: 50, marginBottom: 24,
                }}>Mais popular</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#888', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>Pro</div>
                <div style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-2px', color: '#F0F0F0', lineHeight: 1, marginBottom: 4 }}>
                  <sup style={{ fontSize: 20, fontWeight: 400, verticalAlign: 'super', letterSpacing: 0 }}>R$</sup>147
                </div>
                <div style={{ fontSize: 13, color: '#444', marginBottom: 20 }}>/mês por concessionária</div>
                <div style={{ fontSize: 14, color: '#888', marginBottom: 28, lineHeight: 1.6, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  A escolha certa para concessionárias que querem crescer com processos profissionais e seu site no ar.
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                  {['CRM de leads (ilimitado)', 'Funil de vendas avançado', 'Gestão de tarefas + equipes', 'Controle financeiro completo', 'Relatórios avançados', 'Site padrão com seu estoque', 'Logo personalizada'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#888' }}>{CHECK}{f}</li>
                  ))}
                  {['Domínio próprio', 'Suporte prioritário'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#444' }}>{DASH}{f}</li>
                  ))}
                </ul>
                <Link href="/signup" style={{
                  display: 'block', textAlign: 'center', padding: '14px', borderRadius: 50,
                  fontSize: 14, fontWeight: 600, textDecoration: 'none',
                  background: '#C8F135', color: '#000', border: 'none',
                  boxShadow: '0 0 24px rgba(200,241,53,0.2)',
                  transition: 'all 0.2s',
                }}>
                  Assinar Pro
                </Link>
              </div>
            </Reveal>

            {/* Premium */}
            <Reveal delay={160}>
              <div style={{
                background: '#101010', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '36px 32px', position: 'relative',
                transition: 'transform 0.3s, border-color 0.3s',
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#888', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>Premium</div>
                <div style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-2px', color: '#F0F0F0', lineHeight: 1, marginBottom: 4 }}>
                  <sup style={{ fontSize: 20, fontWeight: 400, verticalAlign: 'super', letterSpacing: 0 }}>R$</sup>297
                </div>
                <div style={{ fontSize: 13, color: '#444', marginBottom: 20 }}>/mês por concessionária</div>
                <div style={{ fontSize: 14, color: '#888', marginBottom: 28, lineHeight: 1.6, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  Para quem quer o máximo: sistema completo, site com sua identidade e domínio próprio.
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                  {['Tudo do plano Pro', 'Site premium com cor personalizada', 'Domínio próprio (ex: sualoja.com.br)', 'Automações ilimitadas', 'Multi-unidades / grupos', 'API + integrações avançadas', 'Suporte prioritário 24h', 'Onboarding dedicado'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#888' }}>{CHECK}{f}</li>
                  ))}
                </ul>
                <Link href="/signup" style={{
                  display: 'block', textAlign: 'center', padding: '14px', borderRadius: 50,
                  fontSize: 14, fontWeight: 600, textDecoration: 'none',
                  background: 'transparent', color: '#888', border: '1px solid rgba(255,255,255,0.12)',
                  transition: 'all 0.2s',
                }}>
                  Assinar Premium
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section id="comparativo" style={{ padding: '100px 24px', background: '#080808', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#C8F135', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Comparativo</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#F0F0F0' }}>
              Veja o que está<br />incluso em cada plano
            </h2>
          </Reveal>

          <Reveal>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', color: '#444', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.07)', width: '40%' }}>Funcionalidade</th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', color: '#444', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>Starter</th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', color: '#C8F135', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>Pro</th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', color: '#444', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'CRM de leads', sub: 'Gestão e rastreamento de oportunidades', starter: 'Até 200/mês', pro: 'Ilimitado', premium: 'Ilimitado', proTick: false, starterTick: false, premiumTick: false },
                    { feature: 'Funil de vendas', sub: 'Visualização e gestão de pipeline', starter: '✓ Básico', pro: '✓ Avançado', premium: '✓ Avançado', proTick: true, starterTick: true, premiumTick: true },
                    { feature: 'Gestão financeira', sub: 'Controle de receitas e custos', starter: '—', pro: '✓', premium: '✓', proTick: true, starterTick: false, premiumTick: true },
                    { feature: 'Automações', sub: 'Fluxos automáticos de follow-up e tarefas', starter: '—', pro: 'Até 50 fluxos', premium: 'Ilimitado', proTick: false, starterTick: false, premiumTick: false },
                    { feature: 'Relatórios', sub: 'Análise de desempenho e conversão', starter: '✓ Básico', pro: '✓ Avançado', premium: '✓ Executivo', proTick: true, starterTick: true, premiumTick: true },
                    { feature: 'Gestão de equipes', sub: 'Usuários, permissões e metas', starter: '—', pro: '✓', premium: '✓', proTick: true, starterTick: false, premiumTick: true },
                    { feature: 'Multi-unidades', sub: 'Gestão de múltiplas lojas/filiais', starter: '—', pro: '—', premium: '✓', proTick: false, starterTick: false, premiumTick: true },
                    { feature: 'API & integrações', sub: 'WhatsApp, portais, ERPs e mais', starter: '—', pro: '—', premium: '✓', proTick: false, starterTick: false, premiumTick: true },
                    { feature: 'Site público', sub: 'Vitrine online com seu estoque', starter: '—', pro: '✓ Padrão + logo', premium: '✓ Premium + domínio', proTick: false, starterTick: false, premiumTick: false },
                    { feature: 'Suporte', sub: 'Canal e tempo de resposta', starter: 'Chat + email', pro: 'Chat prioritário', premium: '24h dedicado', proTick: false, starterTick: false, premiumTick: false },
                  ].map((row, i, arr) => (
                    <tr key={row.feature}>
                      <td style={{ padding: '18px 20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', color: '#F0F0F0', verticalAlign: 'middle' }}>
                        {row.feature}
                        <span style={{ fontSize: 12, color: '#444', display: 'block', marginTop: 4, fontWeight: 300 }}>{row.sub}</span>
                      </td>
                      <td style={{ padding: '18px 20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', textAlign: 'center', color: row.starter === '—' ? '#444' : row.starter.startsWith('✓') ? '#C8F135' : '#888', verticalAlign: 'middle' }}>
                        {row.starter}
                      </td>
                      <td style={{ padding: '18px 20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', textAlign: 'center', background: 'rgba(200,241,53,0.03)', color: row.pro === '—' ? '#444' : row.pro.startsWith('✓') || row.pro === 'Ilimitado' || row.pro === 'Até 50 fluxos' || row.pro === 'Chat prioritário' ? '#C8F135' : '#888', verticalAlign: 'middle' }}>
                        {row.pro}
                      </td>
                      <td style={{ padding: '18px 20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', textAlign: 'center', color: row.premium === '—' ? '#444' : row.premium.startsWith('✓') || row.premium === 'Ilimitado' || row.premium === '24h dedicado' ? '#C8F135' : '#888', verticalAlign: 'middle' }}>
                        {row.premium}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#C8F135', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Depoimentos</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#F0F0F0' }}>
              Quem já usa, não volta<br />para o caos de antes.
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                text: '"Em 3 semanas usando o Carvys, aumentei minha taxa de retorno de leads em 40%. Antes eu perdia contato com metade dos interessados. Hoje automatizo o follow-up inteiro."',
                initials: 'MR', name: 'Marcelo Rocha', role: 'Diretor — Rocha Veículos, SP',
              },
              {
                text: '"Sempre soubemos que perdíamos vendas, mas não sabíamos onde. Com o funil do Carvys, ficou visível: 60% das perdas aconteciam após o primeiro contato. Resolvemos em dias."',
                initials: 'FL', name: 'Fernanda Lima', role: 'Gestora Comercial — Grupo Lux Auto, MG',
              },
              {
                text: '"Tenho 4 lojas e antes era impossível ter visão consolidada. O plano Premium me deu um dashboard que mostra tudo em tempo real. Valeu cada centavo já no primeiro mês."',
                initials: 'CT', name: 'Carlos Tenório', role: 'Sócio-fundador — Rede T Motors, RJ',
              },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <div style={{
                  background: '#101010', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16, padding: '28px 28px 24px',
                  transition: 'border-color 0.3s',
                }}>
                  <div style={{ color: '#C8F135', fontSize: 13, marginBottom: 16, letterSpacing: '2px' }}>★★★★★</div>
                  <p style={{ fontSize: 15, color: '#888', lineHeight: 1.7, marginBottom: 24, fontWeight: 300 }}>{t.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', background: '#141414',
                      border: '1px solid rgba(255,255,255,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 600, color: '#C8F135', flexShrink: 0,
                    }}>
                      {t.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#F0F0F0' }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: '#444' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ textAlign: 'center', padding: '100px 24px', background: '#080808', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(200,241,53,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#C8F135', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20 }}>Pronto para começar?</div>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 600, letterSpacing: '-2px', lineHeight: 1.05, color: '#F0F0F0', marginBottom: 24 }}>
              Pare de perder vendas.<br />
              <em style={{ fontStyle: 'normal', color: '#C8F135' }}>Comece hoje.</em>
            </h2>
            <p style={{ fontSize: 17, color: '#888', marginBottom: 48, fontWeight: 300 }}>
              Sem taxa de setup. Sem contrato. Cancele quando quiser.
            </p>
            <Link href="/signup" style={{
              background: '#C8F135', color: '#000', fontWeight: 600,
              fontSize: 16, padding: '18px 48px', borderRadius: 50,
              textDecoration: 'none', display: 'inline-block',
              boxShadow: '0 0 32px rgba(200,241,53,0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              Assinar agora
            </Link>
            <div style={{ marginTop: 28, fontSize: 13, color: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 1L2 3.5V7c0 3 2.5 5 5 5.5C12 12 12 10 12 7V3.5L7 1Z" />
              </svg>
              Garantia de 14 dias — se não gostar, devolvemos tudo.
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        maxWidth: '100%',
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.5px', color: '#F0F0F0' }}>
          Car<span style={{ color: '#C8F135' }}>vys</span>
        </div>
        <p style={{ fontSize: 12, color: '#444' }}>© 2026 Carvys. Todos os direitos reservados.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a
            href="https://www.instagram.com/usecarvys?igsh=MXFlNjF4aGp2Mjh1cw%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4.5" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="#888" stroke="none" />
            </svg>
          </a>
          <Link href="/login" style={{ fontSize: 12, color: '#444', textDecoration: 'none' }}>Entrar</Link>
          <p style={{ fontSize: 12, color: '#444' }}>Privacidade · Termos</p>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          nav { padding: 16px 20px !important; }
        }
        nav a:hover { color: #F0F0F0 !important; }
      `}</style>
    </div>
  )
}
