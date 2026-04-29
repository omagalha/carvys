CREATE TABLE IF NOT EXISTS public.platform_messages_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type         text NOT NULL,
  external_ref text NOT NULL DEFAULT '',
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  sent_at      timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, type, external_ref)
);

CREATE INDEX IF NOT EXISTS platform_messages_log_tenant_id_idx
  ON public.platform_messages_log (tenant_id);

CREATE INDEX IF NOT EXISTS platform_messages_log_type_idx
  ON public.platform_messages_log (type);

ALTER TABLE public.platform_messages_log ENABLE ROW LEVEL SECURITY;
