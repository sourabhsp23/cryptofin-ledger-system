
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Block } from '@/lib/blockchain/types';
import { Badge } from '@/components/ui/badge';

interface BlockCardProps {
  block: Block;
  isLatest?: boolean;
}

const BlockCard = ({ block, isLatest }: BlockCardProps) => {
  return (
    <Card className="crypto-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">
            Block #{block.hash.substring(0, 8)}
          </CardTitle>
          {isLatest && (
            <Badge variant="outline" className="bg-crypto-blue/10 text-crypto-blue border-crypto-blue/20">
              Latest
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Hash:</span>
            <div className="hash-text">{block.hash}</div>
          </div>
          
          <div>
            <span className="text-muted-foreground">Previous Hash:</span>
            <div className="hash-text">{block.previousHash}</div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <span className="text-muted-foreground">Nonce:</span>
              <div>{block.nonce}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Tx Count:</span> 
              <div>{block.transactions.length}</div>
            </div>
          </div>
          
          <div>
            <span className="text-muted-foreground">Timestamp:</span>
            <div>{new Date(block.timestamp).toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockCard;
