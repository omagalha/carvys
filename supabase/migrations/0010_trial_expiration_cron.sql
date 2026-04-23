-- Função que expira trials vencidos (7 dias após created_at)
CREATE OR REPLACE FUNCTION expire_trials()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_tenant RECORD;
BEGIN
  FOR expired_tenant IN
    SELECT id, name
    FROM tenants
    WHERE status = 'trial'
      AND created_at < now() - interval '7 days'
  LOOP
    UPDATE tenants
    SET status = 'past_due'
    WHERE id = expired_tenant.id;

    -- Registra na timeline do cliente
    INSERT INTO tenant_events (tenant_id, type, description)
    VALUES (expired_tenant.id, 'status_changed', 'Trial expirado — status alterado para Inadimplente');
  END LOOP;
END;
$$;

-- Agenda execução diária às 3h UTC (meia-noite no horário de Brasília)
SELECT cron.schedule(
  'expire-trials-daily',
  '0 3 * * *',
  'SELECT expire_trials()'
);
