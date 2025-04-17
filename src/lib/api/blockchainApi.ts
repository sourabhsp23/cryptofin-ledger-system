
import { Block, Transaction, Wallet } from '../blockchain/types';

const API_URL = 'http://localhost:3001/api';

// Fetch all blocks
export const fetchBlocks = async (): Promise<Block[]> => {
  const response = await fetch(`${API_URL}/blocks`);
  if (!response.ok) {
    throw new Error('Failed to fetch blocks');
  }
  return response.json();
};

// Fetch a specific block
export const fetchBlock = async (hash: string): Promise<Block> => {
  const response = await fetch(`${API_URL}/blocks/${hash}`);
  if (!response.ok) {
    throw new Error('Failed to fetch block');
  }
  return response.json();
};

// Fetch transactions for an address
export const fetchTransactionsForAddress = async (address: string): Promise<Transaction[]> => {
  const response = await fetch(`${API_URL}/transactions/${address}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
};

// Fetch pending transactions
export const fetchPendingTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(`${API_URL}/transactions/pending`);
  if (!response.ok) {
    throw new Error('Failed to fetch pending transactions');
  }
  return response.json();
};

// Create a new transaction
export const createTransaction = async (transaction: Transaction): Promise<boolean> => {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });
  
  return response.ok;
};

// Mine pending transactions
export const minePendingTransactions = async (minerAddress: string): Promise<Block> => {
  const response = await fetch(`${API_URL}/mine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ minerAddress }),
  });
  
  if (!response.ok) {
    throw new Error('Mining failed');
  }
  
  const result = await response.json();
  return result.block;
};

// Fetch wallet info
export const fetchWallet = async (publicKey: string): Promise<Wallet> => {
  const response = await fetch(`${API_URL}/wallets/${publicKey}`);
  if (!response.ok) {
    throw new Error('Failed to fetch wallet');
  }
  return response.json();
};

// Create a new wallet
export const createWallet = async (wallet: Wallet): Promise<Wallet> => {
  const response = await fetch(`${API_URL}/wallets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(wallet),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create wallet');
  }
  
  return response.json();
};

// Fetch all wallets
export const fetchWallets = async (): Promise<Wallet[]> => {
  const response = await fetch(`${API_URL}/wallets`);
  if (!response.ok) {
    throw new Error('Failed to fetch wallets');
  }
  return response.json();
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
