
import { Router } from 'express';
import * as db from '../database';
import { blockchain } from '../../lib/blockchain/blockchain';

const router = Router();

// Get transactions for an address
router.get('/:address', async (req, res) => {
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
router.get('/pending', async (req, res) => {
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
router.post('/', async (req, res) => {
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

export default router;
