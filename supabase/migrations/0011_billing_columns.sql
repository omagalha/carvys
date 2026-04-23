ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS asaas_customer_id     text,
  ADD COLUMN IF NOT EXISTS asaas_subscription_id text;
