
import { Block, Transaction, Wallet } from '../blockchain/types';
import { blockchain } from '../blockchain/blockchain';

// Set up a proper API URL that works in the Lovable environment
// The API is served at the same origin in this setup
const API_URL = '/api'; // Relative to the current domain

// Flag to determine if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// In-memory mock data for browser usage
const mockBlocks = blockchain.getChain();
const mockPendingTransactions = blockchain.getPendingTransactions();
const mockWallets: Record<string, Wallet> = {};

// Helper function for fetch with better error handling and logging
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  console.log(`API Request: ${url}`);
  
  // In browser environment, use mock data instead of actual API calls
  // This is a workaround until we have a proper backend setup
  if (isBrowser) {
    console.log('Using in-memory blockchain data (API simulation)');
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock API routing
      if (url.includes('/api/blocks') && !url.includes('/api/blocks/')) {
        return mockBlocks;
      } 
      else if (url.includes('/api/blocks/')) {
        const hash = url.split('/').pop();
        const block = mockBlocks.find(b => b.hash === hash);
        if (!block) {
          throw new Error('Block not found');
        }
        return block;
      } 
      else if (url.includes('/api/transactions/pending')) {
        return mockPendingTransactions;
      } 
      else if (url.includes('/api/transactions/')) {
        const address = url.split('/').pop();
        return blockchain.getTransactionsForAddress(address || '');
      } 
      else if (url.includes('/api/wallets') && !url.includes('/api/wallets/')) {
        return Object.values(mockWallets);
      } 
      else if (url.includes('/api/wallets/')) {
        const publicKey = url.split('/').pop();
        const wallet = mockWallets[publicKey || ''] || { 
          publicKey: publicKey || '', 
          privateKey: '', 
          balance: blockchain.getBalanceOfAddress(publicKey || '') 
        };
        return wallet;
      } 
      else if (url.includes('/api/mine') && options?.method === 'POST') {
        const { minerAddress } = JSON.parse(options.body as string);
        const minedBlock = blockchain.minePendingTransactions(minerAddress);
        return minedBlock;
      } 
      else if (url.includes('/api/transactions') && options?.method === 'POST') {
        const transaction = JSON.parse(options.body as string);
        blockchain.addTransaction(transaction);
        return { success: true };
      }
      
      throw new Error(`Unhandled mock API route: ${url}`);
    } catch (error) {
      console.error(`Mock API Error for ${url}:`, error);
      throw error;
    }
  } else {
    // For server environment (would use real fetch here)
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`API Response from ${url}:`, data);
      return data;
    } catch (error) {
      console.error(`API Request Failed for ${url}:`, error);
      throw error;
    }
  }
};

// Fetch all blocks
export const fetchBlocks = async (): Promise<Block[]> => {
  return fetchWithErrorHandling(`${API_URL}/blocks`);
};

// Fetch a specific block
export const fetchBlock = async (hash: string): Promise<Block> => {
  return fetchWithErrorHandling(`${API_URL}/blocks/${hash}`);
};

// Fetch transactions for an address
export const fetchTransactionsForAddress = async (address: string): Promise<Transaction[]> => {
  return fetchWithErrorHandling(`${API_URL}/transactions/${address}`);
};

// Fetch pending transactions
export const fetchPendingTransactions = async (): Promise<Transaction[]> => {
  return fetchWithErrorHandling(`${API_URL}/transactions/pending`);
};

// Create a new transaction
export const createTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
    await fetchWithErrorHandling(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });
    return true;
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return false;
  }
};

// Mine pending transactions
export const minePendingTransactions = async (minerAddress: string): Promise<Block> => {
  return fetchWithErrorHandling(`${API_URL}/mine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ minerAddress }),
  });
};

// Fetch wallet info
export const fetchWallet = async (publicKey: string): Promise<Wallet> => {
  return fetchWithErrorHandling(`${API_URL}/wallets/${publicKey}`);
};

// Create a new wallet
export const createWallet = async (wallet: Wallet): Promise<Wallet> => {
  if (isBrowser) {
    // Store in mock data
    mockWallets[wallet.publicKey] = wallet;
  }
  
  return fetchWithErrorHandling(`${API_URL}/wallets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(wallet),
  });
};

// Fetch all wallets
export const fetchWallets = async (): Promise<Wallet[]> => {
  return fetchWithErrorHandling(`${API_URL}/wallets`);
};

export default {
  fetchBlocks,
  fetchBlock,
  fetchTransactionsForAddress,
  fetchPendingTransactions,
  createTransaction,
  minePendingTransactions,
  fetchWallet,
  createWallet,
  fetchWallets,
};
