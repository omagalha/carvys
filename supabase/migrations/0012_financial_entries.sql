CREATE TABLE financial_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  vehicle_id  uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  type        text NOT NULL DEFAULT 'expense', -- 'expense' | 'income'
  category    text NOT NULL DEFAULT 'outros',
  description text NOT NULL,
  amount      numeric(12,2) NOT NULL CHECK (amount > 0),
  date        date NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_financial_entries_tenant_date ON financial_entries(tenant_id, date);
