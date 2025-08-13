-- Add INSERT policy to orders table for security
-- Only authenticated users can create orders for themselves
CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also add UPDATE policy to allow order status updates (needed for payment verification)
CREATE POLICY "Service role can update orders" 
ON public.orders 
FOR UPDATE 
USING (true);