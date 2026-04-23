# 🚀 Carvys

Sistema SaaS de automação comercial para negócios locais, com foco em geração, gestão e conversão de leads.

---

## 🧠 Visão do Produto

O **Carvys** é uma plataforma multi-tenant que permite empresas gerenciarem seus leads, acompanhar negociações e automatizar o processo de vendas.

Criado para escalar operações comerciais com organização, velocidade e inteligência.

---

## 🎯 Problema que resolve

Negócios locais perdem vendas todos os dias por:
- falta de controle de leads
- ausência de follow-up
- processos manuais no WhatsApp
- desorganização comercial

---

## 💡 Solução

O Carvys centraliza:
- 📥 Captura de leads
- 💬 Integração com WhatsApp
- 📊 Gestão de funil de vendas
- 🔁 Follow-ups automatizados
- 📈 Controle por empresa (multi-tenant)

---

## 🏗️ Arquitetura

- Multi-tenant (isolamento por cliente)
- Controle de acesso por papéis (admin/member)
- Backend com regras seguras (RLS)
- Integração com serviços externos (pagamento e WhatsApp)

---

## 🧰 Stack

- Frontend: Next.js + React + TypeScript
- Backend: Supabase (PostgreSQL + Auth + RLS)
- Validação: Zod
- Integrações:
  - Asaas (pagamentos)
  - Z-API (WhatsApp)

---

## 📂 Estrutura do Projeto


/app → rotas e páginas (Next.js)
/components → componentes reutilizáveis
/lib → utilitários e integrações
/supabase → migrations e configuração do banco
/docs → documentação de arquitetura


---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local` baseado em:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ASAAS_API_KEY=
ZAPI_INSTANCE_ID=
ZAPI_TOKEN=

▶️ Como rodar o projeto
# instalar dependências
npm install

# rodar ambiente de desenvolvimento
npm run dev

Acesse:
http://localhost:3000

📌 Funcionalidades (MVP)
 Autenticação de usuários
 Multi-tenant (empresas)
 Gestão de leads
 Follow-ups
 Integração com WhatsApp
 Dashboard analítico
 Automações avançadas
 Sistema de planos e cobrança

🧱 Roadmap
Painel de métricas comerciais
Automação de mensagens
Inteligência de conversão (IA)
CRM visual (pipeline)
Integração com múltiplos canais
💼 Modelo de Negócio

SaaS por assinatura:

Plano base mensal
Upsell por automações
White-label para parceiros
📈 Objetivo

Transformar o Carvys em uma plataforma completa de automação comercial para pequenas e médias empresas.


📩 Contato

📧 contato@carvys.com.br

⚠️ Status

🚧 Em desenvolvimento ativo


---