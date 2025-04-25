
import { create } from 'zustand';
import { Block, Transaction } from '../lib/blockchain/types';
import { blockchain } from '../lib/blockchain/blockchain';
import blockchainApi from '../lib/api/blockchainApi';
import { toast } from '@/components/ui/use-toast';
import { useWalletStore } from './walletStore';
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
      useWalletStore.getState().updateWalletBalances(chain);
      
      console.log("Blockchain data refresh complete");
    } catch (error) {
      console.error('Error refreshing blockchain data:', error);
      throw error;
    }
  }
}));

// Export everything for backward compatibility
export const {
  initializeWallet,
  createWallet,
  selectWallet,
  startMining,
  stopMining,
  createTransaction
} = {
  initializeWallet: useWalletStore.getState().initializeWallet,
  createWallet: useWalletStore.getState().createWallet,
  selectWallet: useWalletStore.getState().selectWallet,
  startMining: useMiningStore.getState().startMining,
  stopMining: useMiningStore.getState().stopMining,
  createTransaction: useTransactionStore.getState().createTransaction
};
