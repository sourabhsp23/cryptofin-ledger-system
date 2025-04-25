
import { create } from 'zustand';
import { Transaction } from '../lib/blockchain/types';
import { signData } from '../lib/blockchain/crypto';
import blockchainApi from '../lib/api/blockchainApi';
import { toast } from '@/components/ui/use-toast';
import { useWalletStore } from './walletStore';
import { useBlockchainStore } from './blockchainStore';

interface TransactionState {
  createTransaction: (toAddress: string, amount: number) => Promise<boolean>;
}

export const useTransactionStore = create<TransactionState>(() => ({
  createTransaction: async (toAddress: string, amount: number) => {
    const currentWallet = useWalletStore.getState().currentWallet;
    if (!currentWallet) return false;
    
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
      const success = await blockchainApi.createTransaction(transaction);
      
      if (success) {
        console.log("Transaction created successfully");
        toast({
          title: "Transaction Successful",
          description: `Sent ${amount} coins to ${toAddress.substring(0, 10)}...`,
        });
      } else {
        console.error("API reported transaction failure");
        toast({
          title: "Transaction Failed",
          description: "The server rejected the transaction. Please try again.",
          variant: "destructive"
        });
      }
      
      return success;
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
