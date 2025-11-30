import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Build system prompt with wallet context
    let systemPrompt = 'You are a helpful blockchain and cryptocurrency assistant. You help users understand blockchain technology, cryptocurrencies, mining, and wallet management. Be clear, concise, and friendly.';
    
    if (walletContext) {
      systemPrompt += `\n\nCurrent Wallet Information:
- Public Key: ${walletContext.publicKey}
- Balance: ${walletContext.balanceFormatted} (${walletContext.balanceInr})
- Total Wallets: ${walletContext.totalWallets}
- Total Transactions: ${walletContext.totalTransactions}`;

      if (walletContext.transactions && walletContext.transactions.length > 0) {
        systemPrompt += `\n\nRecent Transaction History:`;
        walletContext.transactions.slice(0, 10).forEach((tx: any, index: number) => {
          systemPrompt += `\n${index + 1}. ${tx.from === walletContext.publicKey ? 'Sent' : 'Received'} ${tx.amountFormatted} (${tx.amountInr})`;
          systemPrompt += `\n   ${tx.from === walletContext.publicKey ? 'To' : 'From'}: ${tx.from === walletContext.publicKey ? tx.to : tx.from}`;
          systemPrompt += `\n   Date: ${tx.timestamp}`;
        });
      }

      systemPrompt += `\n\nWhen the user asks about their wallet, balance, address, transactions, transaction history, spending, or account information, use this information to provide accurate and personalized answers. You can help them understand their transaction patterns, who they've sent to or received from, and analyze their blockchain activity.`;
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
