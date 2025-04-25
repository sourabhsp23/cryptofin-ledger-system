
import { create } from 'zustand';
import { Wallet } from '../lib/blockchain/types';
import { generateKeyPair } from '../lib/blockchain/crypto';
import blockchainApi from '../lib/api/blockchainApi';
import { toast } from '@/components/ui/use-toast';

// Forward declaration to avoid circular dependency
// We will only use this function, not the whole store
let getWalletBalance: (publicKey: string) => number = () => 0;

// Function to set the wallet balance calculator from blockchainStore
export const setWalletBalanceCalculator = (calculator: (publicKey: string) => number) => {
  getWalletBalance = calculator;
};

interface WalletState {
  currentWallet: Wallet | null;
  wallets: Wallet[];
  initializeWallet: () => void;
  createWallet: () => void;
  selectWallet: (publicKey: string) => void;
  updateWalletBalances: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  currentWallet: null,
  wallets: [],

  initializeWallet: () => {
    console.log("Initializing wallet...");
    const storedWallets = localStorage.getItem('cryptoWallets');
    if (storedWallets) {
      const wallets = JSON.parse(storedWallets);
      console.log(`Found ${wallets.length} wallets in local storage`);
      set({ wallets, currentWallet: wallets[0] || null });
    } else {
      console.log("No wallets found, creating a new default wallet");
      const { publicKey, privateKey } = generateKeyPair();
      const newWallet = {
        publicKey,
        privateKey,
        balance: 0
      };
      
      const wallets = [newWallet];
      localStorage.setItem('cryptoWallets', JSON.stringify(wallets));
      set({ wallets, currentWallet: newWallet });
      
      blockchainApi.createWallet(newWallet).then(() => {
        console.log("Default wallet saved to backend");
      }).catch(err => {
        console.error('Failed to save wallet to backend:', err);
        toast({
          title: "Error",
          description: "Could not save wallet to backend.",
          variant: "destructive"
        });
      });
    }
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

  updateWalletBalances: () => {
    const updatedWallets = get().wallets.map(wallet => ({
      ...wallet,
      balance: getWalletBalance(wallet.publicKey)
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
