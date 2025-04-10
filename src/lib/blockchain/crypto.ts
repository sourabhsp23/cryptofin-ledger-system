
import * as CryptoJS from 'crypto-js';
import EC from 'elliptic';

// Initialize elliptic curve for crypto operations
const ec = new EC.ec('secp256k1');

/**
 * Generates a new key pair for a wallet
 */
export const generateKeyPair = () => {
  const keyPair = ec.genKeyPair();
  return {
    privateKey: keyPair.getPrivate('hex'),
    publicKey: keyPair.getPublic('hex')
  };
};

/**
 * Signs data with a private key
 */
export const signData = (data: string, privateKey: string): string => {
  const keyPair = ec.keyFromPrivate(privateKey);
  const signature = keyPair.sign(data);
  return signature.toDER('hex');
};

/**
 * Verifies a signature with a public key
 */
export const verifySignature = (
  data: string,
  signature: string,
  publicKey: string
): boolean => {
  try {
    const key = ec.keyFromPublic(publicKey, 'hex');
    return key.verify(data, signature);
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Calculates SHA-256 hash of data
 */
export const calculateHash = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

/**
 * Calculates a simple hash for a block
 */
export const calculateBlockHash = (
  timestamp: number,
  previousHash: string,
  transactions: any[],
  nonce: number
): string => {
  const data = `${timestamp}${previousHash}${JSON.stringify(transactions)}${nonce}`;
  return calculateHash(data);
};

/**
 * Derives address from public key
 */
export const deriveAddress = (publicKey: string): string => {
  // In a real blockchain, this would involve more steps like RIPEMD-160 + Base58Check
  // For simplicity, we'll use the first 40 chars of the hash
  return calculateHash(publicKey).substring(0, 40);
};

/**
 * Simplistic wallet address validation
 */
export const isValidAddress = (address: string): boolean => {
  return address.length === 40 && /^[a-f0-9]+$/i.test(address);
};
