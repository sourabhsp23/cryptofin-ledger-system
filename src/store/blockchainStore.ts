
import { create } from 'zustand';
import { blockchain } from '../lib/blockchain/blockchain';
import { Block, Transaction, Wallet, MiningState } from '../lib/blockchain/types';
import { generateKeyPair, signData } from '../lib/blockchain/crypto';
import blockchainApi from '../lib/api/blockchainApi';
import { toast } from '@/components/ui/use-toast';

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
    console.log("Initializing wallet...");
    const storedWallets = localStorage.getItem('cryptoWallets');
    if (storedWallets) {
      const wallets = JSON.parse(storedWallets);
      console.log(`Found ${wallets.length} wallets in local storage`);
      set({ wallets, currentWallet: wallets[0] || null });
    } else {
      console.log("No wallets found, creating a new default wallet");
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
      blockchainApi.createWallet(newWallet).then(() => {
        console.log("Default wallet saved to backend");
      }).catch(err => {
        console.error('Failed to save wallet to backend:', err);
      });
    }
    
    // Refresh the blockchain data
    get().refreshBlockchain().catch(err => {
      console.error('Error refreshing blockchain data:', err);
      toast({
        title: "Connection Error",
        description: "Could not connect to the blockchain server. Please ensure it's running.",
        variant: "destructive"
      });
    });
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
    blockchainApi.createWallet(newWallet).then(() => {
      console.log("New wallet saved to backend");
    }).catch(err => {
      console.error('Failed to save wallet to backend:', err);
      toast({
        title: "Error Creating Wallet",
        description: "Could not save the wallet to the blockchain server.",
        variant: "destructive"
      });
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
    
    console.log(`Creating transaction: ${fromAddress} → ${toAddress}, amount: ${amount}, balance: ${fromBalance}`);
    
    // Check if the sender has enough funds
    if (fromBalance < amount) {
      toast({
        title: "Insufficient Funds",
        description: `Your wallet balance (${fromBalance}) is less than the amount (${amount}).`,
        variant: "destructive"
      });
      return false;
    }
    
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
      console.log("Sending transaction to API");
      const success = await blockchainApi.createTransaction(transaction);
      
      if (success) {
        console.log("Transaction created successfully");
        toast({
          title: "Transaction Successful",
          description: `Sent ${amount} coins to ${toAddress.substring(0, 10)}...`,
        });
        
        // Refresh blockchain data
        await get().refreshBlockchain();
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
  },
  
  startMining: () => {
    const { currentWallet, miningState } = get();
    if (!currentWallet || miningState.isMining) return;
    
    set({ miningState: { ...miningState, isMining: true } });
    console.log("Mining started");
    
    // Simulate mining in a separate "thread" with setInterval
    const miningInterval = setInterval(async () => {
      if (!get().miningState.isMining) {
        clearInterval(miningInterval);
        return;
      }
      
      try {
        // Mine the pending transactions via API
        console.log("Mining attempt...");
        const startTime = Date.now();
        const minedBlock = await blockchainApi.minePendingTransactions(
          currentWallet.publicKey
        );
        const endTime = Date.now();
        
        // Calculate hash rate (hashes per second)
        const timeElapsed = (endTime - startTime) / 1000; // in seconds
        const hashRate = Math.round(minedBlock.nonce / timeElapsed);
        
        console.log(`Block mined successfully! Hash rate: ${hashRate} H/s`);
        toast({
          title: "Block Mined!",
          description: `You earned 100 coins as a mining reward.`
        });
        
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
        toast({
          title: "Mining Error",
          description: "There was a problem during the mining process.",
          variant: "destructive"
        });
      }
    }, 5000); // Mine every 5 seconds in this simulation
  },
  
  stopMining: () => {
    console.log("Mining stopped");
    set(state => ({
      miningState: {
        ...state.miningState,
        isMining: false
      }
    }));
    
    toast({
      title: "Mining Stopped",
      description: "You have stopped mining blocks."
    });
  },
  
  refreshBlockchain: async () => {
    try {
      console.log("Refreshing blockchain data...");
      
      // Fetch chain and pending transactions from API
      const [chain, pendingTransactions] = await Promise.all([
        blockchainApi.fetchBlocks(),
        blockchainApi.fetchPendingTransactions()
      ]);
      
      console.log(`Fetched ${chain.length} blocks and ${pendingTransactions.length} pending transactions`);
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
      
      console.log("Blockchain data refresh complete");
    } catch (error) {
      console.error('Error refreshing blockchain data:', error);
      throw error;
    }
  }
}));
