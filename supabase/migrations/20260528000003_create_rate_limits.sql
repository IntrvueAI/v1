-- SEC-09: Durable per-user, per-endpoint rate limiting table.
-- Edge functions call check_and_increment_rate_limit() via service role;
-- no user-facing SELECT/UPDATE policies are needed.
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint      TEXT        NOT NULL,
  request_count INTEGER     NOT NULL DEFAULT 1,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No user-facing policies — only service-role key can read/write this table.

CREATE INDEX idx_rate_limits_user_endpoint
  ON public.rate_limits(user_id, endpoint);

-- Atomically check and increment a rate limit window.
-- Returns TRUE if the request is allowed, FALSE if the limit is exceeded.
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_user_id        UUID,
  p_endpoint       TEXT,
  p_max            INTEGER,
  p_window_minutes INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count        INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  SELECT request_count, window_start
    INTO v_count, v_window_start
    FROM public.rate_limits
   WHERE user_id = p_user_id
     AND endpoint = p_endpoint;

  IF NOT FOUND THEN
    INSERT INTO public.rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, now());
    RETURN TRUE;
  END IF;

  -- Reset window if expired
  IF v_window_start < now() - (p_window_minutes || ' minutes')::INTERVAL THEN
    UPDATE public.rate_limits
       SET request_count = 1,
           window_start  = now()
     WHERE user_id  = p_user_id
       AND endpoint = p_endpoint;
    RETURN TRUE;
  END IF;

  IF v_count >= p_max THEN
    RETURN FALSE;
  END IF;

  UPDATE public.rate_limits
     SET request_count = request_count + 1
   WHERE user_id  = p_user_id
     AND endpoint = p_endpoint;

  RETURN TRUE;
END;
$$;
