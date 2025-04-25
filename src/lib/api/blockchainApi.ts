
import { Block, Transaction, Wallet } from '../blockchain/types';

// In development, use the correct URL for your server
// In production, you might use a relative URL or the deployed backend URL
const API_URL = import.meta.env.PROD 
  ? '/api'  // In production, we'd use a relative path or specific domain
  : 'http://localhost:3001/api'; // In development, connect to local server

// Helper function for fetch with better error handling and logging
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  console.log(`API Request: ${url}`);
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
