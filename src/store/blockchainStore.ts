
import { create } from 'zustand';
import { Block, Transaction } from '../lib/blockchain/types';
import { blockchain } from '../lib/blockchain/blockchain';
import { supabase } from '@/integrations/supabase/client';
import blockchainApi from '../lib/api/blockchainApi';
import { useWalletStore, setWalletBalanceCalculator } from './walletStore';
import { useMiningStore } from './miningStore';
import { useTransactionStore } from './transactionStore';
import { toast } from '@/components/ui/use-toast';

interface BlockchainState {
  chain: Block[];
  pendingTransactions: Transaction[];
  isConnected: boolean;
  getWalletBalance: (publicKey: string) => number;
  getTransactionsForAddress: (publicKey: string) => Transaction[];
  refreshBlockchain: () => Promise<void>;
}

export const useBlockchainStore = create<BlockchainState>((set, get) => ({
  chain: blockchain.getChain(),
  pendingTransactions: [],
  isConnected: false,
  
  getWalletBalance: (publicKey: string) => {
    const state = get();
    let balance = 0;
    
    // Calculate balance from all transactions
    state.chain.forEach(block => {
      block.transactions.forEach(tx => {
        if (tx.toAddress === publicKey) {
          balance += tx.amount;
        }
        if (tx.fromAddress === publicKey) {
          balance -= tx.amount;
        }
      });
    });
    
    // Also account for pending transactions
    state.pendingTransactions.forEach(tx => {
      if (tx.toAddress === publicKey) {
        balance += tx.amount;
      }
      if (tx.fromAddress === publicKey) {
        balance -= tx.amount;
      }
    });
    
    return balance;
  },
  
  getTransactionsForAddress: (publicKey: string) => {
    const state = get();
    const transactions: Transaction[] = [];
    
    // Get transactions from blocks
    state.chain.forEach(block => {
      block.transactions.forEach(tx => {
        if (tx.fromAddress === publicKey || tx.toAddress === publicKey) {
          transactions.push(tx);
        }
      });
    });
    
    // Get pending transactions
    state.pendingTransactions.forEach(tx => {
      if (tx.fromAddress === publicKey || tx.toAddress === publicKey) {
        transactions.push(tx);
      }
    });
    
    return transactions;
  },
  
  refreshBlockchain: async () => {
    try {
      console.log("Refreshing blockchain data...");
      
      // Fetch transactions from Supabase
      const { data: dbTransactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      
      // Convert database transactions to blockchain format
      const transactions: Transaction[] = (dbTransactions || []).map(tx => ({
        fromAddress: tx.from_address,
        toAddress: tx.to_address,
        amount: Number(tx.amount),
        timestamp: Number(tx.timestamp),
        signature: tx.signature,
      }));
      
      console.log(`Fetched ${transactions.length} transactions from database`);
      
      // Try to fetch blocks from API (for demo purposes)
      let chain: Block[];
      try {
        chain = await blockchainApi.fetchBlocks();
      } catch {
        chain = blockchain.getChain();
      }
      
      set({ 
        chain, 
        pendingTransactions: transactions,
        isConnected: true 
      });
      
      // Update wallet balances
      useWalletStore.getState().updateWalletBalances();
      
      console.log("Blockchain data refresh complete");
    } catch (error) {
      console.error('Error refreshing blockchain data:', error);
      
      // Fall back to local blockchain
      const localChain = blockchain.getChain();
      
      set({ 
        chain: localChain, 
        pendingTransactions: [],
        isConnected: false
      });
      
      toast({
        title: "Connection Error",
        description: "Using local blockchain data",
        variant: "default"
      });
    }
  }
}));

// Register wallet balance calculator with WalletStore
setWalletBalanceCalculator(useBlockchainStore.getState().getWalletBalance);

// ===== EXPORT CONVENIENCE FUNCTIONS =====
// Export common getters as a convenience
export const getWalletBalance = (publicKey: string) => useBlockchainStore.getState().getWalletBalance(publicKey);
export const getTransactionsForAddress = (publicKey: string) => useBlockchainStore.getState().getTransactionsForAddress(publicKey);

// These definitions are needed for modules that still import from blockchainStore
// This removes circular dependencies
export const getCurrentWallet = () => useWalletStore.getState().currentWallet;
export const getWallets = () => useWalletStore.getState().wallets;
export const createWallet = () => useWalletStore.getState().createWallet();
export const selectWallet = (publicKey: string) => useWalletStore.getState().selectWallet(publicKey);
export const initializeWallet = () => useWalletStore.getState().initializeWallet();
export const startMining = () => useMiningStore.getState().startMining();
export const stopMining = () => useMiningStore.getState().stopMining();
export const createTransaction = (toAddress: string, amount: number) => {
  return useTransactionStore.getState().createTransaction(toAddress, amount);
};
