# Carvys

SaaS B2B multi-tenant de gestão comercial para revendedores de veículos. CRM com pipeline de vendas, estoque, WhatsApp nativo, site público por loja e cobrança recorrente.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript |
| Banco de dados | Supabase (PostgreSQL + Auth + RLS) |
| Estilização | Tailwind CSS |
| Validação | Zod |
| WhatsApp | Evolution API v2 (self-hosted) |
| Pagamentos | Asaas |
| E-mail | Resend |
| Hospedagem app | Vercel |
| Hospedagem Evolution API | DigitalOcean (Docker) |

---

## Funcionalidades

### CRM / Pipeline
- Funil de vendas com etapas: Novo → Contatado → Negociando → Ganho / Perdido
- Temperatura do lead (quente, morno, frio) baseada em última interação
- Histórico de eventos (Timeline) por lead
- Notas e observações
- Veículo de interesse vinculado ao lead
- Follow-ups agendados por canal (WhatsApp, ligação, e-mail, visita)
- Captura automática de lead via site público

### WhatsApp Nativo
- Conexão via Evolution API (sem terceiros — número próprio da loja)
- QR Code para vincular número na tela de configurações
- Envio de mensagem direto do painel com sugestão contextualizada (nome + veículo + etapa)
- Resposta automática na primeira mensagem recebida do lead
- Histórico de mensagens registrado na Timeline do lead
- Avanço automático de etapa ao enviar mensagem (Novo → Contatado)

### Estoque
- Cadastro de veículos com fotos, especificações e preço
- Galeria de imagens
- Vinculação de veículo ao lead de interesse

### Site Público por Loja
- URL pública: `carvys.com.br/loja/[slug]`
- Vitrine de veículos com busca e filtros
- Página individual por veículo
- Captura de lead com nome + telefone antes de abrir WhatsApp
- Geração automática de descrição do veículo

### Financeiro
- Registro de entradas e saídas
- Relatórios financeiros por período

### Relatórios
- Visão geral de leads, conversão e desempenho

### Equipe
- Convite de membros por e-mail
- Papéis: owner, admin, sales

### Cobrança
- Assinatura recorrente via Asaas
- Webhook de pagamento (confirmação, atraso, cancelamento)
- Planos: trial, pro, elite

### Admin
- Painel interno para gestão de todos os tenants
- Controle de status e eventos de cada cliente

---

## Variáveis de Ambiente

Crie `.env.local` na raiz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# WhatsApp (Evolution API)
EVOLUTION_API_URL=https://wa.carvys.com.br
EVOLUTION_API_KEY=
WHATSAPP_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://carvys.com.br

# Pagamentos
ASAAS_ENV=production
ASAAS_API_KEY=
ASAAS_WEBHOOK_TOKEN=

# E-mail
RESEND_API_KEY=
```

---

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`

```bash
npm run typecheck   # verificar tipos
npm run build       # build de produção
```

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/           # login, cadastro, callback
│   ├── (onboarding)/     # fluxo de onboarding do tenant
│   ├── (dashboard)/      # app protegido
│   │   └── app/
│   │       ├── leads/        # pipeline + detalhe do lead
│   │       ├── vehicles/     # estoque
│   │       ├── follow-ups/   # follow-ups
│   │       ├── financeiro/   # financeiro
│   │       ├── relatorios/   # relatórios
│   │       ├── contatos/     # contatos
│   │       └── settings/     # configurações (perfil, loja, equipe, WhatsApp, plano)
│   ├── (admin)/          # painel interno Carvys
│   ├── loja/             # site público por loja
│   │   └── [slug]/
│   │       └── [vehicleId]/
│   └── api/
│       └── webhooks/
│           ├── whatsapp/ # recebe eventos da Evolution API
│           └── asaas/    # recebe eventos de pagamento
├── lib/
│   ├── supabase/         # cliente server/browser/admin
│   ├── evolution.ts      # integração Evolution API
│   ├── asaas.ts          # integração Asaas
│   ├── email.ts          # envio de e-mail (Resend)
│   ├── plans.ts          # definição de planos
│   └── temperature.ts    # lógica de temperatura do lead
└── server/
    ├── actions/          # server actions (mutations)
    └── queries/          # queries de leitura
```

---

## Infraestrutura Evolution API

A Evolution API roda em Docker no DigitalOcean:

```yaml
# docker-compose.yml (resumido)
services:
  postgres:    # banco da Evolution API
  redis:       # cache de sessão
  evolution:   # atendai/evolution-api:v2.1.1 na porta 8080
```

Domínio: `wa.carvys.com.br` → servidor DigitalOcean (porta 8080)

Cada tenant gera uma instância isolada com nome `carvys-{tenantIdSlice}`.

---

## Multi-tenant

- Cada loja é um **tenant** isolado com RLS no Supabase
- Papéis: `owner`, `admin`, `sales`
- Instância WhatsApp separada por tenant
- Site público com slug próprio
- Plano e cobrança independentes

---

## Status

Produção ativa em `carvys.com.br`
