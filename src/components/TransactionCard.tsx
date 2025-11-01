
import { Card, CardContent } from '@/components/ui/card';
import { Transaction } from '@/lib/blockchain/types';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';
import { formatInrAmount } from '@/utils/currency';

interface TransactionCardProps {
  transaction: Transaction;
  userAddress?: string;
}

const TransactionCard = ({ transaction, userAddress }: TransactionCardProps) => {
  const isMiningReward = transaction.fromAddress === null;
  const isOutgoing = transaction.fromAddress === userAddress;
  const isIncoming = transaction.toAddress === userAddress;
  
  const getTransactionTypeIcon = () => {
    if (isMiningReward) return <Award className="h-5 w-5 text-crypto-orange" />;
    if (isOutgoing) return <ArrowUpRight className="h-5 w-5 text-crypto-red" />;
    if (isIncoming) return <ArrowDownRight className="h-5 w-5 text-crypto-green" />;
    return <ArrowUpRight className="h-5 w-5 text-muted-foreground" />;
  };
  
  const getTransactionTypeText = () => {
    if (isMiningReward) return 'Mining Reward';
    if (isOutgoing) return 'Sent';
    if (isIncoming) return 'Received';
    return 'Transaction';
  };
  
  const getAmountColor = () => {
    if (isMiningReward || isIncoming) return 'text-crypto-green';
    if (isOutgoing) return 'text-crypto-red';
    return '';
  };
  
  const getAmountPrefix = () => {
    if (isMiningReward || isIncoming) return '+';
    if (isOutgoing) return '-';
    return '';
  };
  
  return (
    <Card className="crypto-card">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-muted flex items-center justify-center">
              {getTransactionTypeIcon()}
            </div>
            <div>
              <div className="font-medium">{getTransactionTypeText()}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(transaction.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={cn("font-semibold", getAmountColor())}>
              {getAmountPrefix()}{transaction.amount} Coins
            </div>
            <div className="text-xs text-muted-foreground">
              {formatInrAmount(transaction.amount)}
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border/40 grid gap-1 text-xs">
          {transaction.fromAddress ? (
            <div>
              <span className="text-muted-foreground">From: </span>
              <span className="font-mono">{transaction.fromAddress.substring(0, 20)}...</span>
            </div>
          ) : (
            <div>
              <span className="text-muted-foreground">From: </span>
              <span className="font-mono">System (Mining Reward)</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">To: </span>
            <span className="font-mono">{transaction.toAddress.substring(0, 20)}...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
