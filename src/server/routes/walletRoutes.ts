
import { Router } from 'express';
import * as db from '../database';

const router = Router();

// Get wallet info
router.get('/:publicKey', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.get('/', async (req, res) => {
  try {
    console.log('Request received for all wallets');
    const wallets = await db.getAllWallets();
    res.json(wallets);
  } catch (err) {
    console.error('Error fetching wallets:', err);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

export default router;
