
import { create } from 'zustand';
import { blockchain } from '../lib/blockchain/blockchain';
import { Block, Transaction, Wallet, MiningState } from '../lib/blockchain/types';
import { generateKeyPair, signData } from '../lib/blockchain/crypto';
import blockchainApi from '../lib/api/blockchainApi';

interface BlockchainState {
  chain: Block[];
  pendingTransactions: Transaction[];
  currentWallet: Wallet | null;
  wallets: Wallet[];
  miningState: MiningState;
  
  // Actions
  initializeWallet: () => void;
  createWallet: () => void;
  selectWallet: (publicKey: string) => void;
  getWalletBalance: (publicKey: string) => number;
  getTransactionsForAddress: (publicKey: string) => Transaction[];
  createTransaction: (toAddress: string, amount: number) => Promise<boolean>;
  startMining: () => void;
  stopMining: () => void;
  refreshBlockchain: () => Promise<void>;
}

export const useBlockchainStore = create<BlockchainState>((set, get) => ({
  chain: blockchain.getChain(),
  pendingTransactions: blockchain.getPendingTransactions(),
  currentWallet: null,
  wallets: [],
  miningState: {
    isMining: false,
    hashRate: 0,
    lastMinedBlock: null
  },
  
  initializeWallet: () => {
    const storedWallets = localStorage.getItem('cryptoWallets');
    if (storedWallets) {
      const wallets = JSON.parse(storedWallets);
      set({ wallets, currentWallet: wallets[0] || null });
    } else {
      // Create a default wallet if none exists
      const { publicKey, privateKey } = generateKeyPair();
      const newWallet = {
        publicKey,
        privateKey,
        balance: 0
      };
      
      const wallets = [newWallet];
      localStorage.setItem('cryptoWallets', JSON.stringify(wallets));
      set({ wallets, currentWallet: newWallet });
      
      // Save the wallet to the backend
      blockchainApi.createWallet(newWallet).catch(err => {
        console.error('Failed to save wallet to backend:', err);
      });
    }
    
    // Refresh the blockchain data
    get().refreshBlockchain();
  },
  
  createWallet: () => {
    const { publicKey, privateKey } = generateKeyPair();
    const newWallet = {
      publicKey,
      privateKey,
      balance: 0
    };
    
    const wallets = [...get().wallets, newWallet];
    localStorage.setItem('cryptoWallets', JSON.stringify(wallets));
    set({ wallets, currentWallet: newWallet });
    
    // Save the wallet to the backend
    blockchainApi.createWallet(newWallet).catch(err => {
      console.error('Failed to save wallet to backend:', err);
    });
  },
  
  selectWallet: (publicKey: string) => {
    const wallet = get().wallets.find(w => w.publicKey === publicKey);
    if (wallet) {
      set({ currentWallet: wallet });
    }
  },
  
  getWalletBalance: (publicKey: string) => {
    return blockchain.getBalanceOfAddress(publicKey);
  },
  
  getTransactionsForAddress: (publicKey: string) => {
    return blockchain.getTransactionsForAddress(publicKey);
  },
  
  createTransaction: async (toAddress: string, amount: number) => {
    const { currentWallet } = get();
    if (!currentWallet) return false;
    
    const fromAddress = currentWallet.publicKey;
    const fromBalance = blockchain.getBalanceOfAddress(fromAddress);
    
    // Check if the sender has enough funds
    if (fromBalance < amount) return false;
    
    // Create transaction data to sign
    const transactionData = {
      fromAddress,
      toAddress,
      amount,
      timestamp: Date.now()
    };
    
    // Sign the transaction with the sender's private key
    const signature = signData(
      JSON.stringify(transactionData),
      currentWallet.privateKey
    );
    
    // Create the signed transaction
    const transaction: Transaction = {
      ...transactionData,
      signature
    };
    
    try {
      // Add the transaction through the API
      const success = await blockchainApi.createTransaction(transaction);
      
      // Refresh blockchain data
      if (success) {
        await get().refreshBlockchain();
      }
      
      return success;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return false;
    }
  },
  
  startMining: () => {
    const { currentWallet, miningState } = get();
    if (!currentWallet || miningState.isMining) return;
    
    set({ miningState: { ...miningState, isMining: true } });
    
    // Simulate mining in a separate "thread" with setInterval
    const miningInterval = setInterval(async () => {
      if (!get().miningState.isMining) {
        clearInterval(miningInterval);
        return;
      }
      
      try {
        // Mine the pending transactions via API
        const startTime = Date.now();
        const minedBlock = await blockchainApi.minePendingTransactions(
          currentWallet.publicKey
        );
        const endTime = Date.now();
        
        // Calculate hash rate (hashes per second)
        const timeElapsed = (endTime - startTime) / 1000; // in seconds
        const hashRate = Math.round(minedBlock.nonce / timeElapsed);
        
        // Update the state
        await get().refreshBlockchain();
        set(state => ({
          miningState: {
            ...state.miningState,
            hashRate,
            lastMinedBlock: minedBlock
          }
        }));
      } catch (error) {
        console.error('Mining error:', error);
      }
    }, 3000); // Mine every 3 seconds in this simulation
  },
  
  stopMining: () => {
    set(state => ({
      miningState: {
        ...state.miningState,
        isMining: false
      }
    }));
  },
  
  refreshBlockchain: async () => {
    try {
      // Fetch chain and pending transactions from API
      const [chain, pendingTransactions] = await Promise.all([
        blockchainApi.fetchBlocks(),
        blockchainApi.fetchPendingTransactions()
      ]);
      
      set({ chain, pendingTransactions });
      
      // Update wallet balances
      const updatedWallets = get().wallets.map(wallet => ({
        ...wallet,
        balance: blockchain.getBalanceOfAddress(wallet.publicKey)
      }));
      
      set({ wallets: updatedWallets });
      
      // Update current wallet if exists
      const currentWallet = get().currentWallet;
      if (currentWallet) {
        const updatedCurrentWallet = updatedWallets.find(
          w => w.publicKey === currentWallet.publicKey
        );
        if (updatedCurrentWallet) {
          set({ currentWallet: updatedCurrentWallet });
        }
      }
    } catch (error) {
      console.error('Error refreshing blockchain data:', error);
    }
  }
}));
