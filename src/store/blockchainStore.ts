
import { create } from 'zustand';
import { Block, Transaction } from '../lib/blockchain/types';
import { blockchain } from '../lib/blockchain/blockchain';
import blockchainApi from '../lib/api/blockchainApi';
import { useWalletStore, setWalletBalanceCalculator } from './walletStore';
import { useMiningStore } from './miningStore';
import { useTransactionStore } from './transactionStore';

interface BlockchainState {
  chain: Block[];
  pendingTransactions: Transaction[];
  getWalletBalance: (publicKey: string) => number;
  getTransactionsForAddress: (publicKey: string) => Transaction[];
  refreshBlockchain: () => Promise<void>;
}

export const useBlockchainStore = create<BlockchainState>((set, get) => ({
  chain: blockchain.getChain(),
  pendingTransactions: blockchain.getPendingTransactions(),
  
  getWalletBalance: (publicKey: string) => {
    return blockchain.getBalanceOfAddress(publicKey);
  },
  
  getTransactionsForAddress: (publicKey: string) => {
    return blockchain.getTransactionsForAddress(publicKey);
  },
  
  refreshBlockchain: async () => {
    try {
      console.log("Refreshing blockchain data...");
      
      const [chain, pendingTransactions] = await Promise.all([
        blockchainApi.fetchBlocks(),
        blockchainApi.fetchPendingTransactions()
      ]);
      
      console.log(`Fetched ${chain.length} blocks and ${pendingTransactions.length} pending transactions`);
      set({ chain, pendingTransactions });
      
      // Update wallet balances
      useWalletStore.getState().updateWalletBalances();
      
      console.log("Blockchain data refresh complete");
    } catch (error) {
      console.error('Error refreshing blockchain data:', error);
      throw error;
    }
  }
}));

// Register wallet balance calculator with WalletStore
setWalletBalanceCalculator(useBlockchainStore.getState().getWalletBalance);

// ===== PROXY GETTERS FOR BACKWARD COMPATIBILITY =====
// This helps components that haven't been updated to use the new store structure

// Export common getters as a convenience
export const getWalletBalance = (publicKey: string) => useBlockchainStore.getState().getWalletBalance(publicKey);
export const getTransactionsForAddress = (publicKey: string) => useBlockchainStore.getState().getTransactionsForAddress(publicKey);

// Expose wallet state and methods for components that still use useBlockchainStore
Object.defineProperties(useBlockchainStore, {
  currentWallet: {
    get: () => useWalletStore.getState().currentWallet
  },
  wallets: {
    get: () => useWalletStore.getState().wallets
  },
  createWallet: {
    get: () => useWalletStore.getState().createWallet
  },
  selectWallet: {
    get: () => useWalletStore.getState().selectWallet
  },
  initializeWallet: {
    get: () => useWalletStore.getState().initializeWallet
  },
  startMining: {
    get: () => useMiningStore.getState().startMining
  },
  stopMining: {
    get: () => useMiningStore.getState().stopMining
  },
  createTransaction: {
    get: () => useTransactionStore.getState().createTransaction
  }
});
