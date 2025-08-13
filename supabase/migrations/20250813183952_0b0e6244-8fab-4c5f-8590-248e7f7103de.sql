-- Fix the failed payment for ibrahim@khan.cc (user_id: bd529052-23f9-403c-8af7-ab256cbb685d)
-- Update their pending orders to paid status and credit them their purchases

-- First, update the order status to paid
UPDATE orders 
SET status = 'paid', updated_at = now()
WHERE user_id = 'bd529052-23f9-403c-8af7-ab256cbb685d' 
AND status = 'pending'
AND stripe_session_id IN ('cs_live_a14QlMFhY75prrpmv1Y7BzZE97L0w4XobOivTc0Btwa2kNjPMXeUMwKCr4', 'cs_live_a1Ip2QmBRZvcjeZlFeii8dxlnBQcClWZLv992ns6lmicer1xIXYb8gVL4e');

-- Credit them with their purchases (2 credits total from 2 orders)
INSERT INTO credits_balance (user_id, credits)
VALUES ('bd529052-23f9-403c-8af7-ab256cbb685d', 2)
ON CONFLICT (user_id) 
DO UPDATE SET credits = credits_balance.credits + 2, updated_at = now();