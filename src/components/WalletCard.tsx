
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface WalletCardProps {
  publicKey: string;
  balance: number;
  isActive?: boolean;
  onSelect?: () => void;
}

const WalletCard = ({ 
  publicKey, 
  balance, 
  isActive = false,
  onSelect
}: WalletCardProps) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Card className={cn(
      "crypto-card border transition-all",
      isActive ? "border-crypto-blue ring-1 ring-crypto-blue/30" : "border-border/40"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Wallet
          </CardTitle>
          {onSelect && !isActive && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={onSelect}
            >
              Select
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Address</div>
            <div className="flex items-center gap-1">
              <div className="font-mono text-xs break-all">{publicKey}</div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-crypto-green" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-1">Balance</div>
            <div className="text-xl font-bold">{balance} Coins</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletCard;
