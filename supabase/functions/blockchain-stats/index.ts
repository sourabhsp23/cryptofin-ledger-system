import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching blockchain statistics...');

    // Get total transactions
    const { count: totalTransactions, error: txError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    if (txError) {
      console.error('Error fetching transactions count:', txError);
      throw txError;
    }

    // Get total volume
    const { data: transactions, error: volumeError } = await supabase
      .from('transactions')
      .select('amount');

    if (volumeError) {
      console.error('Error fetching transaction volumes:', volumeError);
      throw volumeError;
    }

    const totalVolume = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

    // Get unique addresses
    const { data: fromAddresses, error: fromError } = await supabase
      .from('transactions')
      .select('from_address');

    const { data: toAddresses, error: toError } = await supabase
      .from('transactions')
      .select('to_address');

    if (fromError || toError) {
      console.error('Error fetching addresses:', fromError || toError);
      throw fromError || toError;
    }

    const uniqueAddresses = new Set([
      ...(fromAddresses?.map(tx => tx.from_address) || []),
      ...(toAddresses?.map(tx => tx.to_address) || [])
    ]);

    // Get recent transactions (last 10)
    const { data: recentTx, error: recentError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error fetching recent transactions:', recentError);
      throw recentError;
    }

    // Calculate average transaction value
    const avgTransactionValue = totalTransactions ? totalVolume / totalTransactions : 0;

    const stats = {
      totalTransactions: totalTransactions || 0,
      totalVolume,
      uniqueAddresses: uniqueAddresses.size,
      averageTransactionValue: avgTransactionValue,
      recentTransactions: recentTx || [],
      timestamp: new Date().toISOString()
    };

    console.log('Blockchain stats:', stats);

    return new Response(
      JSON.stringify(stats),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in blockchain-stats function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});