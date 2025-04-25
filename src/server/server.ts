
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as db from './database';
import { blockchain } from '../lib/blockchain/blockchain';
import path from 'path';
import fs from 'fs';

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Make sure the database file directory exists
const dbDir = path.dirname('./blockchain.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('Initializing database...');

// Initialize the database
db.initializeDatabase().then(() => {
  console.log('Database initialized successfully.');
  // After database init, sync the blockchain data
  syncBlockchain();
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// Sync the blockchain with the database
const syncBlockchain = async () => {
  try {
    // Get all blocks from the blockchain
    const chain = blockchain.getChain();
    
    console.log(`Syncing ${chain.length} blocks to database...`);
    
    // Save each block to the database
    for (const block of chain) {
      await db.saveBlock(block);
      
      // Save each transaction in the block
      for (const transaction of block.transactions) {
        await db.saveTransaction(transaction, block.hash);
      }
    }
    
    // Save pending transactions
    const pendingTransactions = blockchain.getPendingTransactions();
    console.log(`Syncing ${pendingTransactions.length} pending transactions...`);
    
    for (const transaction of pendingTransactions) {
      await db.saveTransaction(transaction);
    }
    
    console.log('Blockchain synchronized with database.');
  } catch (err) {
    console.error('Failed to sync blockchain:', err);
  }
};

// Routes

// Get all blocks
app.get('/api/blocks', async (req, res) => {
  try {
    console.log('Request received for /api/blocks');
    const blocks = await db.getAllBlocks();
    console.log(`Returning ${blocks.length} blocks`);
    res.json(blocks);
  } catch (err) {
    console.error('Error fetching blocks:', err);
    res.status(500).json({ error: 'Failed to fetch blocks' });
  }
});

// Get a specific block
app.get('/api/blocks/:hash', async (req, res) => {
  try {
    console.log(`Request received for block ${req.params.hash}`);
    const block = await db.getBlock(req.params.hash);
    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }
    res.json(block);
  } catch (err) {
    console.error('Error fetching block:', err);
    res.status(500).json({ error: 'Failed to fetch block' });
  }
});

// Get transactions for an address
app.get('/api/transactions/:address', async (req, res) => {
  try {
    console.log(`Request received for transactions for address ${req.params.address}`);
    const transactions = await db.getTransactionsForAddress(req.params.address);
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get pending transactions
app.get('/api/transactions/pending', async (req, res) => {
  try {
    console.log('Request received for pending transactions');
    const pendingTransactions = await db.getPendingTransactions();
    res.json(pendingTransactions);
  } catch (err) {
    console.error('Error fetching pending transactions:', err);
    res.status(500).json({ error: 'Failed to fetch pending transactions' });
  }
});

// Create a new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    console.log('Request received to create transaction:', req.body);
    const transaction = req.body;
    const success = blockchain.addTransaction(transaction);
    
    if (success) {
      await db.saveTransaction(transaction);
      console.log('Transaction created successfully');
      res.status(201).json({ message: 'Transaction created successfully' });
    } else {
      console.log('Failed to create transaction');
      res.status(400).json({ error: 'Failed to create transaction' });
    }
  } catch (err) {
    console.error('Server error creating transaction:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mine pending transactions
app.post('/api/mine', async (req, res) => {
  try {
    console.log('Request received to mine block with miner address:', req.body.minerAddress);
    const { minerAddress } = req.body;
    if (!minerAddress) {
      return res.status(400).json({ error: 'Miner address is required' });
    }
    
    const minedBlock = blockchain.minePendingTransactions(minerAddress);
    await db.saveBlock(minedBlock);
    
    // Save each transaction with the block reference
    for (const transaction of minedBlock.transactions) {
      await db.saveTransaction(transaction, minedBlock.hash);
    }
    
    console.log('Block mined successfully');
    res.status(201).json({ 
      message: 'Block mined successfully',
      block: minedBlock
    });
  } catch (err) {
    console.error('Mining failed:', err);
    res.status(500).json({ error: 'Mining failed' });
  }
});

// Get wallet info
app.get('/api/wallets/:publicKey', async (req, res) => {
  try {
    console.log(`Request received for wallet ${req.params.publicKey}`);
    const wallet = await db.getWallet(req.params.publicKey);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json(wallet);
  } catch (err) {
    console.error('Error fetching wallet:', err);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Create a new wallet
app.post('/api/wallets', async (req, res) => {
  try {
    console.log('Request received to create wallet');
    const wallet = req.body;
    await db.saveWallet(wallet);
    console.log('Wallet created successfully');
    res.status(201).json(wallet);
  } catch (err) {
    console.error('Error creating wallet:', err);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

// Get all wallets
app.get('/api/wallets', async (req, res) => {
  try {
    console.log('Request received for all wallets');
    const wallets = await db.getAllWallets();
    res.json(wallets);
  } catch (err) {
    console.error('Error fetching wallets:', err);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for testing
export default app;
