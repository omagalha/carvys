CREATE TABLE IF NOT EXISTS public.platform_whatsapp_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name text NOT NULL UNIQUE,
  status        text NOT NULL DEFAULT 'disconnected',
  phone_number  text,
  connected_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_whatsapp_sessions ENABLE ROW LEVEL SECURITY;
