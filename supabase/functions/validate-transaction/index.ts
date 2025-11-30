import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransactionValidationRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
  signature: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fromAddress, toAddress, amount, signature }: TransactionValidationRequest = await req.json();

    console.log('Validating transaction:', { fromAddress, toAddress, amount });

    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!fromAddress || fromAddress.length < 10) {
      errors.push('Invalid sender address format');
    }

    if (!toAddress || toAddress.length < 10) {
      errors.push('Invalid recipient address format');
    }

    if (fromAddress === toAddress) {
      errors.push('Cannot send to the same address');
    }

    if (amount <= 0) {
      errors.push('Amount must be greater than zero');
    }

    if (!signature || signature.length < 20) {
      errors.push('Invalid transaction signature');
    }

    // Check for duplicate transactions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: existingTx, error: txError } = await supabase
      .from('transactions')
      .select('id')
      .eq('signature', signature)
      .maybeSingle();

    if (txError) {
      console.error('Error checking for duplicate transactions:', txError);
    } else if (existingTx) {
      errors.push('Duplicate transaction detected');
    }

    // Calculate sender's balance
    const { data: sentTx } = await supabase
      .from('transactions')
      .select('amount')
      .eq('from_address', fromAddress);

    const { data: receivedTx } = await supabase
      .from('transactions')
      .select('amount')
      .eq('to_address', fromAddress);

    const totalSent = sentTx?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    const totalReceived = receivedTx?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    const balance = totalReceived - totalSent;

    if (balance < amount) {
      errors.push(`Insufficient balance. Available: ${balance.toFixed(2)}, Required: ${amount.toFixed(2)}`);
    }

    // Add warnings for unusual transactions
    if (amount > 1000) {
      warnings.push('Large transaction amount detected');
    }

    const { data: recentTx } = await supabase
      .from('transactions')
      .select('created_at')
      .eq('from_address', fromAddress)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentTx) {
      const lastTxTime = new Date(recentTx.created_at).getTime();
      const timeDiff = Date.now() - lastTxTime;
      if (timeDiff < 1000) { // Less than 1 second
        warnings.push('Multiple transactions in quick succession detected');
      }
    }

    const isValid = errors.length === 0;

    const response = {
      isValid,
      errors,
      warnings,
      senderBalance: balance,
      timestamp: new Date().toISOString()
    };

    console.log('Validation result:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in validate-transaction function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});