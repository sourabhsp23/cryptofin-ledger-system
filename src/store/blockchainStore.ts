
import { create } from 'zustand';
import { blockchain } from '../lib/blockchain/blockchain';
import { Block, Transaction, Wallet, MiningState } from '../lib/blockchain/types';
import { generateKeyPair, signData } from '../lib/blockchain/crypto';

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
  createTransaction: (toAddress: string, amount: number) => boolean;
  startMining: () => void;
  stopMining: () => void;
  refreshBlockchain: () => void;
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
  
  createTransaction: (toAddress: string, amount: number) => {
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
    
    // Add the transaction to pending transactions
    const success = blockchain.addTransaction(transaction);
    
    // Refresh blockchain data
    if (success) {
      get().refreshBlockchain();
    }
    
    return success;
  },
  
  startMining: () => {
    const { currentWallet, miningState } = get();
    if (!currentWallet || miningState.isMining) return;
    
    set({ miningState: { ...miningState, isMining: true } });
    
    // Simulate mining in a separate "thread" with setInterval
    const miningInterval = setInterval(() => {
      if (!get().miningState.isMining) {
        clearInterval(miningInterval);
        return;
      }
      
      // Mine the pending transactions
      const startTime = Date.now();
      const minedBlock = blockchain.minePendingTransactions(currentWallet.publicKey);
      const endTime = Date.now();
      
      // Calculate hash rate (hashes per second)
      const timeElapsed = (endTime - startTime) / 1000; // in seconds
      const hashRate = Math.round(minedBlock.nonce / timeElapsed);
      
      // Update the state
      set({
        chain: blockchain.getChain(),
        pendingTransactions: blockchain.getPendingTransactions(),
        miningState: {
          isMining: true,
          hashRate,
          lastMinedBlock: minedBlock
        }
      });
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
  
  refreshBlockchain: () => {
    set({
      chain: blockchain.getChain(),
      pendingTransactions: blockchain.getPendingTransactions()
    });
    
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
  }
}));
