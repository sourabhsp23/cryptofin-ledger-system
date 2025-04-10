
import { Block, Transaction } from './types';
import { calculateBlockHash, verifySignature, isValidAddress } from './crypto';

class Blockchain {
  private chain: Block[];
  private difficulty: number;
  private pendingTransactions: Transaction[];
  private miningReward: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4; // Number of zeros required at the beginning of the hash
    this.pendingTransactions = [];
    this.miningReward = 100; // Reward for mining a block
  }

  /**
   * Creates the first block in the blockchain
   */
  private createGenesisBlock(): Block {
    return {
      timestamp: Date.now(),
      transactions: [],
      previousHash: '0',
      hash: '0',
      nonce: 0
    };
  }

  /**
   * Returns the latest block in the chain
   */
  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Returns the entire blockchain
   */
  getChain(): Block[] {
    return this.chain;
  }

  /**
   * Returns pending transactions
   */
  getPendingTransactions(): Transaction[] {
    return this.pendingTransactions;
  }

  /**
   * Adds a new transaction to the list of pending transactions
   */
  addTransaction(transaction: Transaction): boolean {
    // Verify transaction structure
    if (!transaction.fromAddress || !transaction.toAddress || transaction.amount <= 0) {
      return false;
    }

    // If transaction is not from mining reward, verify signature
    if (transaction.fromAddress !== null) {
      // Check if address is valid
      if (!isValidAddress(transaction.fromAddress) || !isValidAddress(transaction.toAddress)) {
        return false;
      }

      // Verify transaction signature
      const txData = JSON.stringify({
        fromAddress: transaction.fromAddress,
        toAddress: transaction.toAddress,
        amount: transaction.amount,
        timestamp: transaction.timestamp
      });

      if (!verifySignature(txData, transaction.signature, transaction.fromAddress)) {
        return false;
      }
    }

    // Add the transaction to pending transactions
    this.pendingTransactions.push(transaction);
    return true;
  }

  /**
   * Creates a new mining reward transaction
   */
  createMiningRewardTransaction(minerAddress: string): Transaction {
    return {
      fromAddress: null, // From the system (mining reward)
      toAddress: minerAddress,
      amount: this.miningReward,
      timestamp: Date.now(),
      signature: 'MINING_REWARD' // No signature needed for mining rewards
    };
  }

  /**
   * Mine pending transactions and create a new block
   */
  minePendingTransactions(minerAddress: string): Block {
    // Create mining reward transaction
    const rewardTx = this.createMiningRewardTransaction(minerAddress);
    this.pendingTransactions.push(rewardTx);

    // Create a new block with pending transactions
    const block = this.createNewBlock(this.pendingTransactions);
    
    // Add the mined block to the chain
    this.chain.push(block);
    
    // Reset pending transactions
    this.pendingTransactions = [];
    
    return block;
  }

  /**
   * Creates a new block with proof of work
   */
  private createNewBlock(transactions: Transaction[]): Block {
    const previousBlock = this.getLatestBlock();
    const timestamp = Date.now();
    let nonce = 0;
    let hash = '';
    
    // Implement proof of work
    do {
      nonce++;
      hash = calculateBlockHash(timestamp, previousBlock.hash, transactions, nonce);
    } while (hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join('0'));
    
    // Create the new block
    return {
      timestamp,
      transactions,
      previousHash: previousBlock.hash,
      hash,
      nonce
    };
  }

  /**
   * Gets the balance of an address
   */
  getBalanceOfAddress(address: string): number {
    let balance = 0;
    
    // Loop through all blocks and transactions
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        // If the address is the sender, subtract the amount
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }
        
        // If the address is the recipient, add the amount
        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }
    
    return balance;
  }

  /**
   * Get all transactions for an address
   */
  getTransactionsForAddress(address: string): Transaction[] {
    const transactions: Transaction[] = [];
    
    // Loop through all blocks
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        // If the address is the sender or recipient, add the transaction
        if (transaction.fromAddress === address || transaction.toAddress === address) {
          transactions.push(transaction);
        }
      }
    }
    
    // Include pending transactions
    for (const transaction of this.pendingTransactions) {
      if (transaction.fromAddress === address || transaction.toAddress === address) {
        transactions.push(transaction);
      }
    }
    
    return transactions;
  }

  /**
   * Validates the blockchain
   */
  isChainValid(): boolean {
    // Loop through the chain, skipping the genesis block
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      // Check if the current block's hash is valid
      const currentBlockHash = calculateBlockHash(
        currentBlock.timestamp,
        currentBlock.previousHash,
        currentBlock.transactions,
        currentBlock.nonce
      );
      
      if (currentBlock.hash !== currentBlockHash) {
        return false;
      }
      
      // Check if the current block points to the correct previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    
    return true;
  }
}

// Export a singleton instance
export const blockchain = new Blockchain();
export default Blockchain;
