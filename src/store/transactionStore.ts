
import { create } from 'zustand';
import { Transaction } from '../lib/blockchain/types';
import { signData } from '../lib/blockchain/crypto';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useWalletStore } from './walletStore';
import { useBlockchainStore } from './blockchainStore';

interface TransactionState {
  createTransaction: (toAddress: string, amount: number) => Promise<boolean>;
}

export const useTransactionStore = create<TransactionState>(() => ({
  createTransaction: async (toAddress: string, amount: number) => {
    const currentWallet = useWalletStore.getState().currentWallet;
    if (!currentWallet) {
      toast({
        title: "No Wallet",
        description: "Please create or select a wallet first.",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create transactions.",
        variant: "destructive"
      });
      return false;
    }
    
    const fromAddress = currentWallet.publicKey;
    const fromBalance = useBlockchainStore.getState().getWalletBalance(fromAddress);
    
    console.log(`Creating transaction: ${fromAddress} → ${toAddress}, amount: ${amount}, balance: ${fromBalance}`);
    
    if (fromBalance < amount) {
      toast({
        title: "Insufficient Funds",
        description: `Your wallet balance (${fromBalance}) is less than the amount (${amount}).`,
        variant: "destructive"
      });
      return false;
    }
    
    const transactionData = {
      fromAddress,
      toAddress,
      amount,
      timestamp: Date.now()
    };
    
    const signature = signData(
      JSON.stringify(transactionData),
      currentWallet.privateKey
    );
    
    const transaction: Transaction = {
      ...transactionData,
      signature
    };
    
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('transactions')
        .insert({
          from_address: transaction.fromAddress,
          to_address: transaction.toAddress,
          amount: transaction.amount,
          signature: transaction.signature,
          timestamp: transaction.timestamp,
        });
      
      if (error) {
        console.error("Database error:", error);
        toast({
          title: "Transaction Failed",
          description: "Failed to save transaction. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Transaction created successfully");
      toast({
        title: "Transaction Successful",
        description: `Sent ${amount} coins to ${toAddress.substring(0, 10)}...`,
      });
      
      // Refresh blockchain data
      await useBlockchainStore.getState().refreshBlockchain();
      
      return true;
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Transaction Error",
        description: "Could not process the transaction. Server error.",
        variant: "destructive"
      });
      return false;
    }
  }
}));
