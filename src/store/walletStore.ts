
import { create } from 'zustand';
import { Wallet } from '../lib/blockchain/types';
import { generateKeyPair } from '../lib/blockchain/crypto';
import blockchainApi from '../lib/api/blockchainApi';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  initializeWallet: async () => {
    console.log("Initializing wallet...");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No authenticated user");
        set({ wallets: [], currentWallet: null });
        return;
      }

      // Fetch user's wallets from database
      const { data: userWallets, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (userWallets && userWallets.length > 0) {
        const wallets = userWallets.map(w => ({
          publicKey: w.public_key,
          privateKey: w.private_key,
          balance: Number(w.balance) || 0
        }));
        console.log(`Found ${wallets.length} wallets for user`);
        set({ wallets, currentWallet: wallets[0] });
      } else {
        // Create first wallet for new user
        console.log("No wallets found, creating first wallet");
        const { publicKey, privateKey } = generateKeyPair();
        
        const { error: insertError } = await supabase
          .from('user_wallets')
          .insert({
            user_id: user.id,
            public_key: publicKey,
            private_key: privateKey,
            balance: 0,
            name: 'My Wallet'
          });

        if (insertError) throw insertError;

        const newWallet = { publicKey, privateKey, balance: 0 };
        set({ wallets: [newWallet], currentWallet: newWallet });

        blockchainApi.createWallet(newWallet).catch(err => {
          console.error('Failed to save wallet to backend:', err);
        });
      }
    } catch (err) {
      console.error('Error initializing wallet:', err);
      toast({
        title: "Error",
        description: "Could not load wallets from database.",
        variant: "destructive"
      });
    }
  },

  createWallet: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a wallet.",
          variant: "destructive"
        });
        return;
      }

      const { publicKey, privateKey } = generateKeyPair();
      
      const { error } = await supabase
        .from('user_wallets')
        .insert({
          user_id: user.id,
          public_key: publicKey,
          private_key: privateKey,
          balance: 0,
          name: `Wallet ${get().wallets.length + 1}`
        });

      if (error) throw error;

      const newWallet = { publicKey, privateKey, balance: 0 };
      const wallets = [...get().wallets, newWallet];
      set({ wallets, currentWallet: newWallet });

      blockchainApi.createWallet(newWallet).catch(err => {
        console.error('Failed to save wallet to backend:', err);
      });

      toast({
        title: "Wallet Created",
        description: "Your new wallet has been created successfully."
      });
    } catch (err) {
      console.error('Error creating wallet:', err);
      toast({
        title: "Error Creating Wallet",
        description: "Could not save the wallet to database.",
        variant: "destructive"
      });
    }
  },

  selectWallet: (publicKey: string) => {
    const wallet = get().wallets.find(w => w.publicKey === publicKey);
    if (wallet) {
      set({ currentWallet: wallet });
    }
  },

  updateWalletBalances: async () => {
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

    // Sync balances to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const wallet of updatedWallets) {
        await supabase
          .from('user_wallets')
          .update({ balance: wallet.balance })
          .eq('user_id', user.id)
          .eq('public_key', wallet.publicKey);
      }
    } catch (err) {
      console.error('Error syncing wallet balances:', err);
    }
  }
}));
