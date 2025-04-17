
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { Block, Transaction, Wallet } from '../lib/blockchain/types';

// Open database connection
const db = new sqlite3.Database('./blockchain.db');

// Promisify db methods
const runAsync = promisify(db.run.bind(db));
const getAsync = promisify(db.get.bind(db));
const allAsync = promisify(db.all.bind(db));

// Initialize database tables
export const initializeDatabase = async () => {
  // Create blocks table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS blocks (
      hash TEXT PRIMARY KEY,
      timestamp INTEGER,
      previousHash TEXT,
      nonce INTEGER,
      data TEXT
    )
  `);

  // Create transactions table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fromAddress TEXT,
      toAddress TEXT,
      amount REAL,
      timestamp INTEGER,
      signature TEXT,
      blockHash TEXT,
      FOREIGN KEY (blockHash) REFERENCES blocks(hash)
    )
  `);

  // Create wallets table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS wallets (
      publicKey TEXT PRIMARY KEY,
      privateKey TEXT,
      balance REAL
    )
  `);

  console.log('Database initialized successfully.');
};

// Block methods
export const saveBlock = async (block: Block) => {
  const { hash, timestamp, previousHash, nonce, transactions } = block;
  await runAsync(
    'INSERT OR REPLACE INTO blocks (hash, timestamp, previousHash, nonce, data) VALUES (?, ?, ?, ?, ?)',
    [hash, timestamp, previousHash, nonce, JSON.stringify(transactions)]
  );
};

export const getBlock = async (hash: string): Promise<Block | null> => {
  const block = await getAsync('SELECT * FROM blocks WHERE hash = ?', [hash]);
  if (!block) return null;
  
  // Parse transactions from JSON
  const transactions = JSON.parse(block.data);
  
  return {
    hash: block.hash,
    timestamp: block.timestamp,
    previousHash: block.previousHash,
    nonce: block.nonce,
    transactions
  };
};

export const getAllBlocks = async (): Promise<Block[]> => {
  const blocks = await allAsync('SELECT * FROM blocks ORDER BY timestamp DESC');
  return blocks.map(block => ({
    hash: block.hash,
    timestamp: block.timestamp,
    previousHash: block.previousHash,
    nonce: block.nonce,
    transactions: JSON.parse(block.data)
  }));
};

// Transaction methods
export const saveTransaction = async (transaction: Transaction, blockHash?: string) => {
  const { fromAddress, toAddress, amount, timestamp, signature } = transaction;
  await runAsync(
    'INSERT INTO transactions (fromAddress, toAddress, amount, timestamp, signature, blockHash) VALUES (?, ?, ?, ?, ?, ?)',
    [fromAddress, toAddress, amount, timestamp, signature, blockHash]
  );
};

export const getTransactionsForAddress = async (address: string): Promise<Transaction[]> => {
  return await allAsync(
    'SELECT * FROM transactions WHERE fromAddress = ? OR toAddress = ? ORDER BY timestamp DESC',
    [address, address]
  );
};

export const getPendingTransactions = async (): Promise<Transaction[]> => {
  return await allAsync('SELECT * FROM transactions WHERE blockHash IS NULL');
};

// Wallet methods
export const saveWallet = async (wallet: Wallet) => {
  const { publicKey, privateKey, balance } = wallet;
  await runAsync(
    'INSERT OR REPLACE INTO wallets (publicKey, privateKey, balance) VALUES (?, ?, ?)',
    [publicKey, privateKey, balance]
  );
};

export const getWallet = async (publicKey: string): Promise<Wallet | null> => {
  return await getAsync('SELECT * FROM wallets WHERE publicKey = ?', [publicKey]);
};

export const getAllWallets = async (): Promise<Wallet[]> => {
  return await allAsync('SELECT * FROM wallets');
};

export const updateWalletBalance = async (publicKey: string, balance: number) => {
  await runAsync(
    'UPDATE wallets SET balance = ? WHERE publicKey = ?',
    [balance, publicKey]
  );
};

export default {
  initializeDatabase,
  saveBlock,
  getBlock,
  getAllBlocks,
  saveTransaction,
  getTransactionsForAddress,
  getPendingTransactions,
  saveWallet,
  getWallet,
  getAllWallets,
  updateWalletBalance
};
