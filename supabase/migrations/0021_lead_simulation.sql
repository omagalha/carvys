-- Adiciona campos de simulação de financiamento na tabela leads
alter table public.leads
  add column if not exists cpf text,
  add column if not exists birth_date date,
  add column if not exists simulation_data jsonb;

comment on column public.leads.cpf             is 'CPF do lead (coletado via simulador público)';
comment on column public.leads.birth_date      is 'Data de nascimento do lead';
comment on column public.leads.simulation_data is 'Dados da simulação de financiamento: { entry, rate, months, installment, total, vehicle_price }';
