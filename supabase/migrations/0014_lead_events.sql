CREATE TABLE lead_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  lead_id     uuid REFERENCES leads(id)   ON DELETE CASCADE NOT NULL,
  type        text NOT NULL, -- 'created' | 'stage_change' | 'note'
  description text NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_lead_events_lead ON lead_events(lead_id, created_at DESC);
