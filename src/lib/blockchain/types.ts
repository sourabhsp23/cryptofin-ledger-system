
export interface Transaction {
  fromAddress: string | null;
  toAddress: string;
  amount: number;
  timestamp: number;
  signature: string;
}

export interface Block {
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface Wallet {
  publicKey: string;
  privateKey: string;
  balance: number;
}

export interface MiningState {
  isMining: boolean;
  hashRate: number;
  lastMinedBlock: Block | null;
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}
