
import { Router } from 'express';
import * as db from '../database';
import { blockchain } from '../../lib/blockchain/blockchain';

const router = Router();

// Mine pending transactions
router.post('/', async (req, res) => {
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

export default router;
