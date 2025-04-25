
import { create } from 'zustand';
import { Block, MiningState } from '../lib/blockchain/types';
import blockchainApi from '../lib/api/blockchainApi';
import { toast } from '@/components/ui/use-toast';
import { useWalletStore } from './walletStore';

interface MiningStoreState {
  miningState: MiningState;
  startMining: () => void;
  stopMining: () => void;
}

export const useMiningStore = create<MiningStoreState>((set, get) => ({
  miningState: {
    isMining: false,
    hashRate: 0,
    lastMinedBlock: null
  },

  startMining: () => {
    const currentState = get().miningState;
    if (currentState.isMining) return;
    
    set({ miningState: { ...currentState, isMining: true } });
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
        const currentWallet = useWalletStore.getState().currentWallet;
        if (!currentWallet) {
          console.error("No wallet selected for mining");
          return;
        }
        
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
  }
}));
