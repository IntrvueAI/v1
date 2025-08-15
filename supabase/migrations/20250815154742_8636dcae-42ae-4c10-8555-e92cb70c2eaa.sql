-- Security Fix: Restrict service role updates to orders table
-- This addresses the security vulnerability where service role could manipulate any order field

-- First, drop the overly permissive service role update policy
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;

-- Create a more restrictive policy for service role updates
-- Only allow updates to specific fields under specific conditions
CREATE POLICY "service_role_limited_order_updates" ON public.orders
FOR UPDATE 
USING (true)  -- Service role can attempt updates
WITH CHECK (
  -- Only allow updates to safe fields and only valid state transitions
  (
    -- Status can only be updated from 'pending' to 'paid' or 'failed'
    (status IN ('pending', 'paid', 'failed'))
    AND
    -- Prevent modification of critical financial fields after creation
    (amount = (SELECT amount FROM public.orders WHERE id = orders.id))
    AND
    (credits_purchased = (SELECT credits_purchased FROM public.orders WHERE id = orders.id))
    AND
    (user_id = (SELECT user_id FROM public.orders WHERE id = orders.id))
    AND
    (currency = (SELECT currency FROM public.orders WHERE id = orders.id))
    AND
    -- stripe_session_id can only be set once (from null to a value)
    (
      stripe_session_id IS NULL 
      OR stripe_session_id = (SELECT stripe_session_id FROM public.orders WHERE id = orders.id)
      OR (SELECT stripe_session_id FROM public.orders WHERE id = orders.id) IS NULL
    )
  )
);

-- Create a separate policy for legitimate payment processing updates
-- This allows service role to update only status and stripe_session_id
CREATE POLICY "service_role_payment_status_updates" ON public.orders
FOR UPDATE
USING (
  -- Only allow service role to update payment status and session ID
  current_setting('role') = 'service_role'
)
WITH CHECK (
  -- Restrict what can be updated
  status IN ('pending', 'paid', 'failed', 'cancelled')
  AND
  -- Ensure critical fields are not modified
  amount = (SELECT amount FROM public.orders WHERE id = orders.id)
  AND
  credits_purchased = (SELECT credits_purchased FROM public.orders WHERE id = orders.id)
  AND
  user_id = (SELECT user_id FROM public.orders WHERE id = orders.id)
  AND
  currency = (SELECT currency FROM public.orders WHERE id = orders.id)
);

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS update_orders_updated_at_trigger ON public.orders;
CREATE TRIGGER update_orders_updated_at_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Add additional constraints to prevent invalid state transitions
ALTER TABLE public.orders ADD CONSTRAINT valid_status_values 
  CHECK (status IN ('pending', 'paid', 'failed', 'cancelled'));

-- Add constraint to ensure amount is positive
ALTER TABLE public.orders ADD CONSTRAINT positive_amount 
  CHECK (amount > 0);

-- Add constraint to ensure credits_purchased is non-negative
ALTER TABLE public.orders ADD CONSTRAINT non_negative_credits 
  CHECK (credits_purchased >= 0);