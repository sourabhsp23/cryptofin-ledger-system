
import { useBlockchainStore } from '@/store/blockchainStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

const BlockchainStatus = () => {
  const chain = useBlockchainStore(state => state.chain);
  const pendingTransactions = useBlockchainStore(state => state.pendingTransactions);
  
  const chainLength = chain.length;
  const totalTransactions = chain.reduce((total, block) => total + block.transactions.length, 0);
  const lastBlockTimestamp = chain[chain.length - 1].timestamp;
  const timeSinceLastBlock = Date.now() - lastBlockTimestamp;
  
  // Format time since last block
  const formatTimeSince = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };
  
  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-crypto-blue" /> Blockchain Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Chain Length</div>
              <div className="text-lg font-semibold">{chainLength} blocks</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Transactions</div>
              <div className="text-lg font-semibold">{totalTransactions}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Last Block</div>
              <div className="text-lg font-semibold">{formatTimeSince(timeSinceLastBlock)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Pending Tx</div>
              <div className="text-lg font-semibold">{pendingTransactions.length}</div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-border/40">
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Chain Status:</div>
              <div className="flex items-center text-crypto-green">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Valid</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockchainStatus;
