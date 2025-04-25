
import { Router } from 'express';
import * as db from '../database';

const router = Router();

// Get all blocks
router.get('/', async (req, res) => {
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
router.get('/:hash', async (req, res) => {
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

export default router;
