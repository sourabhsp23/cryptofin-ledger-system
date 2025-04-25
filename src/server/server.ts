
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as db from './database';
import { blockchain } from '../lib/blockchain/blockchain';
import path from 'path';
import fs from 'fs';

// Import routes
import blockRoutes from './routes/blockRoutes';
import transactionRoutes from './routes/transactionRoutes';
import walletRoutes from './routes/walletRoutes';
import miningRoutes from './routes/miningRoutes';

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
app.use('/api/blocks', blockRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/mine', miningRoutes);

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for testing
export default app;
