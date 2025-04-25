
import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { useTransactionStore } from '@/store/transactionStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SendCoinForm = () => {
  const { toast } = useToast();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { currentWallet } = useWalletStore();
  const { createTransaction } = useTransactionStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentWallet) {
      toast({
        title: "No Wallet Selected",
        description: "Please select or create a wallet first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!recipient || !amount) {
      toast({
        title: "Missing Information",
        description: "Please enter a recipient address and amount.",
        variant: "destructive"
      });
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Process the transaction
      const success = await createTransaction(recipient, amountNum);
      
      if (success) {
        // Clear the form
        setRecipient('');
        setAmount('');
      }
    } catch (error) {
      console.error("Transaction error:", error);
      toast({
        title: "Transaction Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-crypto-blue" /> Send Coins
        </CardTitle>
        <CardDescription>
          Transfer coins from your wallet to another address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="Enter recipient's wallet address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
              className="bg-muted/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
                className="bg-muted/50 pr-16"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                Coins
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            {currentWallet && (
              <div className="text-sm text-muted-foreground mb-4">
                Available Balance: <span className="font-semibold">{currentWallet.balance} Coins</span>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !currentWallet}
              >
              {isLoading ? "Processing..." : "Send Coins"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SendCoinForm;
