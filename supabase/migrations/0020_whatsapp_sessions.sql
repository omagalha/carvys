CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  instance_name text NOT NULL,
  status        text NOT NULL DEFAULT 'disconnected',
  phone_number  text,
  connected_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id),
  UNIQUE(instance_name)
);

ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wa_tenant_select" ON public.whatsapp_sessions
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
