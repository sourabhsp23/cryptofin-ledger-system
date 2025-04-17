
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as db from './database';
import { blockchain } from '../lib/blockchain/blockchain';

// Initialize the app
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize the database
db.initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Sync the blockchain with the database
const syncBlockchain = async () => {
  try {
    // Get all blocks from the blockchain
    const chain = blockchain.getChain();
    
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
    const blocks = await db.getAllBlocks();
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blocks' });
  }
});

// Get a specific block
app.get('/api/blocks/:hash', async (req, res) => {
  try {
    const block = await db.getBlock(req.params.hash);
    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }
    res.json(block);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch block' });
  }
});

// Get transactions for an address
app.get('/api/transactions/:address', async (req, res) => {
  try {
    const transactions = await db.getTransactionsForAddress(req.params.address);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get pending transactions
app.get('/api/transactions/pending', async (req, res) => {
  try {
    const pendingTransactions = await db.getPendingTransactions();
    res.json(pendingTransactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending transactions' });
  }
});

// Create a new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const transaction = req.body;
    const success = blockchain.addTransaction(transaction);
    
    if (success) {
      await db.saveTransaction(transaction);
      res.status(201).json({ message: 'Transaction created successfully' });
    } else {
      res.status(400).json({ error: 'Failed to create transaction' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mine pending transactions
app.post('/api/mine', async (req, res) => {
  try {
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
    
    res.status(201).json({ 
      message: 'Block mined successfully',
      block: minedBlock
    });
  } catch (err) {
    res.status(500).json({ error: 'Mining failed' });
  }
});

// Get wallet info
app.get('/api/wallets/:publicKey', async (req, res) => {
  try {
    const wallet = await db.getWallet(req.params.publicKey);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Create a new wallet
app.post('/api/wallets', async (req, res) => {
  try {
    const wallet = req.body;
    await db.saveWallet(wallet);
    res.status(201).json({ message: 'Wallet created successfully', wallet });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

// Get all wallets
app.get('/api/wallets', async (req, res) => {
  try {
    const wallets = await db.getAllWallets();
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  syncBlockchain(); // Sync blockchain with database on startup
});

export default app;
