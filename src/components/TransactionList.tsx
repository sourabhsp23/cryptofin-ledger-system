
import { Transaction } from '@/lib/blockchain/types';
import TransactionCard from './TransactionCard';

interface TransactionListProps {
  transactions: Transaction[];
  userAddress?: string;
  limit?: number;
}

const TransactionList = ({ 
  transactions, 
  userAddress,
  limit 
}: TransactionListProps) => {
  // Sort transactions by timestamp descending (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  
  // Apply limit if provided
  const displayedTransactions = limit 
    ? sortedTransactions.slice(0, limit) 
    : sortedTransactions;
  
  if (displayedTransactions.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No transactions found.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {displayedTransactions.map((transaction, index) => (
        <TransactionCard 
          key={`${transaction.timestamp}-${index}`}
          transaction={transaction}
          userAddress={userAddress}
        />
      ))}
    </div>
  );
};

export default TransactionList;
