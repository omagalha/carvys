CREATE TABLE IF NOT EXISTS public.login_attempts (
  email_hash   text        PRIMARY KEY,
  count        integer     NOT NULL DEFAULT 0,
  blocked_until timestamptz,
  last_attempt timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
