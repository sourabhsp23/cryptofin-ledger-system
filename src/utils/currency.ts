// Currency conversion utilities

const DEFAULT_EXCHANGE_RATE = 100; // 1 Coin = ₹100
const STORAGE_KEY = 'coinToInrRate';

export const getCoinToInrRate = (): number => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseFloat(stored) : DEFAULT_EXCHANGE_RATE;
};

export const setCoinToInrRate = (rate: number): void => {
  localStorage.setItem(STORAGE_KEY, rate.toString());
};

export const formatCoinAmount = (coins: number, showInr: boolean = true): string => {
  if (!showInr) {
    return `${coins.toFixed(2)} Coins`;
  }
  
  const rate = getCoinToInrRate();
  const inr = coins * rate;
  return `${coins.toFixed(2)} Coins (₹${inr.toLocaleString('en-IN', { maximumFractionDigits: 2 })})`;
};

export const formatInrAmount = (coins: number): string => {
  const rate = getCoinToInrRate();
  const inr = coins * rate;
  return `₹${inr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

export const coinsToInr = (coins: number): number => {
  return coins * getCoinToInrRate();
};
