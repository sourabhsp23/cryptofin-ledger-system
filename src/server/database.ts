
// Only import sqlite3 on the server side, not in the browser
// TypeScript will understand the type from our type definitions
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { Block, Transaction, Wallet } from '../lib/blockchain/types';
import fs from 'fs';
import path from 'path';

console.log('Setting up database connection...');

// Make sure the database directory exists
const dbDir = path.dirname('./blockchain.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open database connection
const db = new sqlite3.Database('./blockchain.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Promisify db methods
const runAsync = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('SQL error:', err);
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

const getAsync = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('SQL error:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allAsync = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('SQL error:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Initialize database tables
export const initializeDatabase = async () => {
  console.log('Creating database tables if they don\'t exist...');
  
  try {
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

    console.log('Database tables created successfully.');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Block methods
export const saveBlock = async (block: Block) => {
  const { hash, timestamp, previousHash, nonce, transactions } = block;
  try {
    console.log(`Saving block ${hash} to database`);
    await runAsync(
      'INSERT OR REPLACE INTO blocks (hash, timestamp, previousHash, nonce, data) VALUES (?, ?, ?, ?, ?)',
      [hash, timestamp, previousHash, nonce, JSON.stringify(transactions)]
    );
    console.log(`Block ${hash} saved successfully`);
  } catch (error) {
    console.error(`Error saving block ${hash}:`, error);
    throw error;
  }
};

export const getBlock = async (hash: string): Promise<Block | null> => {
  try {
    console.log(`Fetching block ${hash} from database`);
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
  } catch (error) {
    console.error(`Error fetching block ${hash}:`, error);
    throw error;
  }
};

export const getAllBlocks = async (): Promise<Block[]> => {
  try {
    console.log('Fetching all blocks from database');
    const blocks = await allAsync('SELECT * FROM blocks ORDER BY timestamp DESC');
    console.log(`Found ${blocks.length} blocks in database`);
    
    return blocks.map(block => ({
      hash: block.hash,
      timestamp: block.timestamp,
      previousHash: block.previousHash,
      nonce: block.nonce,
      transactions: JSON.parse(block.data)
    }));
  } catch (error) {
    console.error('Error fetching all blocks:', error);
    throw error;
  }
};

// Transaction methods
export const saveTransaction = async (transaction: Transaction, blockHash?: string) => {
  try {
    const { fromAddress, toAddress, amount, timestamp, signature } = transaction;
    console.log(`Saving transaction from ${fromAddress || 'system'} to ${toAddress}`);
    
    await runAsync(
      'INSERT INTO transactions (fromAddress, toAddress, amount, timestamp, signature, blockHash) VALUES (?, ?, ?, ?, ?, ?)',
      [fromAddress, toAddress, amount, timestamp, signature, blockHash]
    );
    
    console.log('Transaction saved successfully');
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

export const getTransactionsForAddress = async (address: string): Promise<Transaction[]> => {
  try {
    console.log(`Fetching transactions for address ${address}`);
    const transactions = await allAsync(
      'SELECT * FROM transactions WHERE fromAddress = ? OR toAddress = ? ORDER BY timestamp DESC',
      [address, address]
    );
    console.log(`Found ${transactions.length} transactions for address ${address}`);
    return transactions;
  } catch (error) {
    console.error(`Error fetching transactions for address ${address}:`, error);
    throw error;
  }
};

export const getPendingTransactions = async (): Promise<Transaction[]> => {
  try {
    console.log('Fetching pending transactions');
    const transactions = await allAsync('SELECT * FROM transactions WHERE blockHash IS NULL');
    console.log(`Found ${transactions.length} pending transactions`);
    return transactions;
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    throw error;
  }
};

// Wallet methods
export const saveWallet = async (wallet: Wallet) => {
  try {
    const { publicKey, privateKey, balance } = wallet;
    console.log(`Saving wallet ${publicKey.substring(0, 10)}...`);
    
    await runAsync(
      'INSERT OR REPLACE INTO wallets (publicKey, privateKey, balance) VALUES (?, ?, ?)',
      [publicKey, privateKey, balance]
    );
    
    console.log('Wallet saved successfully');
  } catch (error) {
    console.error('Error saving wallet:', error);
    throw error;
  }
};

export const getWallet = async (publicKey: string): Promise<Wallet | null> => {
  try {
    console.log(`Fetching wallet ${publicKey.substring(0, 10)}...`);
    return await getAsync('SELECT * FROM wallets WHERE publicKey = ?', [publicKey]);
  } catch (error) {
    console.error(`Error fetching wallet ${publicKey}:`, error);
    throw error;
  }
};

export const getAllWallets = async (): Promise<Wallet[]> => {
  try {
    console.log('Fetching all wallets');
    const wallets = await allAsync('SELECT * FROM wallets');
    console.log(`Found ${wallets.length} wallets`);
    return wallets;
  } catch (error) {
    console.error('Error fetching all wallets:', error);
    throw error;
  }
};

export const updateWalletBalance = async (publicKey: string, balance: number) => {
  try {
    console.log(`Updating wallet ${publicKey.substring(0, 10)} balance to ${balance}`);
    await runAsync(
      'UPDATE wallets SET balance = ? WHERE publicKey = ?',
      [balance, publicKey]
    );
    console.log('Wallet balance updated successfully');
  } catch (error) {
    console.error(`Error updating wallet ${publicKey} balance:`, error);
    throw error;
  }
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
