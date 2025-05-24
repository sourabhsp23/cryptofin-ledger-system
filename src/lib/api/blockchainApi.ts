
import { Block, Transaction, Wallet } from '../blockchain/types';

// Set up a proper API URL that works in the Lovable environment
// The API is served at the same origin in this setup
const API_URL = ''; // Empty string will make requests relative to the current domain

// Flag to determine if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Helper function for fetch with better error handling and logging
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  console.log(`API Request: ${url}`);
  
  // In browser environment, proceed with fetch
  if (isBrowser) {
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
  } else {
    // For non-browser environments (this code won't run in the browser)
    console.log('Not in browser environment, fetch not available');
    throw new Error('Fetch not available in this environment');
  }
};

// Fetch all blocks
export const fetchBlocks = async (): Promise<Block[]> => {
  return fetchWithErrorHandling(`${API_URL}/api/blocks`);
};

// Fetch a specific block
export const fetchBlock = async (hash: string): Promise<Block> => {
  return fetchWithErrorHandling(`${API_URL}/api/blocks/${hash}`);
};

// Fetch transactions for an address
export const fetchTransactionsForAddress = async (address: string): Promise<Transaction[]> => {
  return fetchWithErrorHandling(`${API_URL}/api/transactions/${address}`);
};

// Fetch pending transactions
export const fetchPendingTransactions = async (): Promise<Transaction[]> => {
  return fetchWithErrorHandling(`${API_URL}/api/transactions/pending`);
};

// Create a new transaction
export const createTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
    await fetchWithErrorHandling(`${API_URL}/api/transactions`, {
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
  return fetchWithErrorHandling(`${API_URL}/api/mine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ minerAddress }),
  });
};

// Fetch wallet info
export const fetchWallet = async (publicKey: string): Promise<Wallet> => {
  return fetchWithErrorHandling(`${API_URL}/api/wallets/${publicKey}`);
};

// Create a new wallet
export const createWallet = async (wallet: Wallet): Promise<Wallet> => {
  return fetchWithErrorHandling(`${API_URL}/api/wallets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(wallet),
  });
};

// Fetch all wallets
export const fetchWallets = async (): Promise<Wallet[]> => {
  return fetchWithErrorHandling(`${API_URL}/api/wallets`);
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
