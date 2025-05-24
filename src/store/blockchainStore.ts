
import { create } from 'zustand';
import { Block, Transaction } from '../lib/blockchain/types';
import { blockchain } from '../lib/blockchain/blockchain';
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
  pendingTransactions: blockchain.getPendingTransactions(),
  isConnected: false,
  
  getWalletBalance: (publicKey: string) => {
    return blockchain.getBalanceOfAddress(publicKey);
  },
  
  getTransactionsForAddress: (publicKey: string) => {
    return blockchain.getTransactionsForAddress(publicKey);
  },
  
  refreshBlockchain: async () => {
    try {
      console.log("Refreshing blockchain data...");
      
      // Try to fetch data from API
      const [chain, pendingTransactions] = await Promise.all([
        blockchainApi.fetchBlocks(),
        blockchainApi.fetchPendingTransactions()
      ]);
      
      console.log(`Fetched ${chain.length} blocks and ${pendingTransactions.length} pending transactions`);
      set({ chain, pendingTransactions, isConnected: true });
      
      // Update wallet balances
      useWalletStore.getState().updateWalletBalances();
      
      console.log("Blockchain data refresh complete");
    } catch (error) {
      console.error('Error refreshing blockchain data:', error);
      
      // Fallback to local blockchain if API fails
      console.log("Falling back to local blockchain data");
      const localChain = blockchain.getChain();
      const localPendingTransactions = blockchain.getPendingTransactions();
      
      set({ 
        chain: localChain, 
        pendingTransactions: localPendingTransactions,
        isConnected: false 
      });
      
      // Update wallet balances using local data
      useWalletStore.getState().updateWalletBalances();
      
      // Forward the error to be handled by the caller
      throw error;
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
