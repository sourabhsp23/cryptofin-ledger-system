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
    const { messages, walletContext } = await req.json();
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    console.log('Sending request to Groq with messages:', messages);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch comprehensive blockchain data
    const { data: allTransactions } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false });

    const { count: totalTransactions } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    // Calculate blockchain statistics
    const totalVolume = allTransactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    const avgTransaction = totalTransactions ? totalVolume / totalTransactions : 0;

    // Get unique addresses
    const uniqueAddresses = new Set([
      ...(allTransactions?.map(tx => tx.from_address) || []),
      ...(allTransactions?.map(tx => tx.to_address) || [])
    ]);

    // Function to calculate balance for any address
    const calculateBalance = (address: string) => {
      const sent = allTransactions
        ?.filter(tx => tx.from_address === address)
        .reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      const received = allTransactions
        ?.filter(tx => tx.to_address === address)
        .reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      return received - sent;
    };

    // Build system prompt with comprehensive data
    let systemPrompt = `You are a helpful blockchain and cryptocurrency assistant. You help users understand blockchain technology, cryptocurrencies, mining, and wallet management.

IMPORTANT FORMATTING RULES:
- Use **bold** for emphasis on important terms
- Use bullet points (- ) for lists
- Use numbered lists (1. 2. 3.) for step-by-step instructions
- Use \`code\` for wallet addresses, transaction hashes, and technical terms
- Use clear paragraphs with line breaks for readability
- Be clear, concise, and friendly
- Format numbers with proper spacing for better readability

BLOCKCHAIN NETWORK STATISTICS:
- **Total Transactions**: ${totalTransactions || 0}
- **Total Volume**: ${totalVolume.toFixed(2)} Coins (₹${(totalVolume * 100).toFixed(2)})
- **Active Addresses**: ${uniqueAddresses.size}
- **Average Transaction**: ${avgTransaction.toFixed(2)} Coins (₹${(avgTransaction * 100).toFixed(2)})

You have access to ALL blockchain data. When users ask about:
- **Any wallet address**: Calculate and provide its balance and transaction history
- **Transaction details**: Look up specific transactions
- **Network statistics**: Provide current blockchain metrics
- **Spending patterns**: Analyze transaction history for insights

To check balance for any address, you can calculate it from the transaction data.
Recent transactions are available in the system context.`;
    
    if (walletContext) {
      systemPrompt += `\n\nCURRENT USER WALLET:
- **Public Key**: \`${walletContext.publicKey}\`
- **Balance**: ${walletContext.balanceFormatted} (${walletContext.balanceInr})
- **Total Wallets**: ${walletContext.totalWallets}
- **Total Transactions**: ${walletContext.totalTransactions}`;

      if (walletContext.transactions && walletContext.transactions.length > 0) {
        systemPrompt += `\n\n**User's Recent Transaction History**:`;
        walletContext.transactions.slice(0, 10).forEach((tx: any, index: number) => {
          systemPrompt += `\n${index + 1}. ${tx.from === walletContext.publicKey ? '**Sent**' : '**Received**'} ${tx.amountFormatted} (${tx.amountInr})`;
          systemPrompt += `\n   ${tx.from === walletContext.publicKey ? 'To' : 'From'}: \`${tx.from === walletContext.publicKey ? tx.to : tx.from}\``;
          systemPrompt += `\n   Date: ${tx.timestamp}`;
        });
      }
    }

    // Add information about how to handle wallet address queries
    systemPrompt += `\n\nWhen users ask about specific wallet addresses (like "what's the balance of [address]"), explain that you can see their transaction history in the blockchain. Calculate balances by:
- Finding all transactions where the address received coins (to_address)
- Finding all transactions where the address sent coins (from_address)
- Balance = Total Received - Total Sent

Provide transaction details, spending patterns, and insights based on the available transaction data.`;

    // Add recent network transactions for context
    if (allTransactions && allTransactions.length > 0) {
      systemPrompt += `\n\n**Recent Network Transactions** (Last 5):`;
      allTransactions.slice(0, 5).forEach((tx: any, index: number) => {
        systemPrompt += `\n${index + 1}. ${Number(tx.amount).toFixed(2)} Coins from \`${tx.from_address.substring(0, 20)}...\` to \`${tx.to_address.substring(0, 20)}...\``;
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    console.error('Error in groq-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
