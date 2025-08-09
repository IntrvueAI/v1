
-- 1) Credits balance per user
CREATE TABLE IF NOT EXISTS public.credits_balance (
  user_id UUID PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credits_balance ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage only their own balance
CREATE POLICY "view_own_credits"
  ON public.credits_balance
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own_credits"
  ON public.credits_balance
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_credits"
  ON public.credits_balance
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Updated-at trigger
DROP TRIGGER IF EXISTS trg_credits_balance_updated_at ON public.credits_balance;
CREATE TRIGGER trg_credits_balance_updated_at
  BEFORE UPDATE ON public.credits_balance
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

--------------------------------------------------------------------------------

-- 2) Orders table to track purchases (Stripe)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_session_id TEXT UNIQUE,
  amount INTEGER NOT NULL,                 -- amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  credits_purchased INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'paid' | 'failed'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: users can only view their own orders
CREATE POLICY "view_own_orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Note: We intentionally do NOT grant INSERT/UPDATE/DELETE to regular clients.
-- Edge functions using the service role will write to this table.

-- Updated-at trigger
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

--------------------------------------------------------------------------------

-- 3) Safe credit consumption function (atomic decrement)
-- Returns true if a credit was consumed, false if no credits available.
CREATE OR REPLACE FUNCTION public.consume_credit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  updated_rows integer;
BEGIN
  -- Ensure we have an authenticated user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Attempt to decrement a credit if available
  UPDATE public.credits_balance
  SET credits = credits - 1
  WHERE user_id = auth.uid()
    AND credits > 0;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  IF updated_rows = 1 THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$function$;

-- Note: Creation of a credits_balance row is handled on purchase (edge function).
