CREATE TABLE feedback_suggestions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  submitted_by  UUID        NOT NULL REFERENCES profiles(id),
  tenant_name   TEXT        NOT NULL,
  submitter_name TEXT,
  submitter_email TEXT,
  title         TEXT        NOT NULL,
  description   TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','reviewing','planned','done')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feedback_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can insert feedback"
  ON feedback_suggestions FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Members can view their own feedback"
  ON feedback_suggestions FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
