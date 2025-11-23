-- Update RLS policy to allow unauthenticated users to create transactions
DROP POLICY IF EXISTS "Authenticated users can create transactions" ON public.transactions;

CREATE POLICY "Anyone can create transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);