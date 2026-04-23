ALTER TABLE leads ADD COLUMN IF NOT EXISTS loss_reason text;
-- Valores: 'price' | 'competitor' | 'no_response' | 'gave_up' | 'other'
