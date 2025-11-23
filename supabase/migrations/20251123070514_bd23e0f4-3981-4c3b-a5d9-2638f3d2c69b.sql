-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  signature TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  block_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_transactions_from_address ON public.transactions(from_address);
CREATE INDEX idx_transactions_to_address ON public.transactions(to_address);
CREATE INDEX idx_transactions_block_hash ON public.transactions(block_hash);
CREATE INDEX idx_transactions_timestamp ON public.transactions(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read transactions (public blockchain)
CREATE POLICY "Transactions are viewable by everyone" 
ON public.transactions 
FOR SELECT 
USING (true);

-- Create policy to allow authenticated users to create transactions
CREATE POLICY "Authenticated users can create transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);