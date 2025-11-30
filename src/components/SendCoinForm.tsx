
import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { useTransactionStore } from '@/store/transactionStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatInrAmount } from '@/utils/currency';
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  senderBalance: number;
}

const SendCoinForm = () => {
  const { toast } = useToast();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  const { currentWallet } = useWalletStore();
  const { createTransaction } = useTransactionStore();

  // Validate transaction when amount or recipient changes
  useEffect(() => {
    const validateTransaction = async () => {
      if (!recipient || !amount || !currentWallet) {
        setValidationResult(null);
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setValidationResult(null);
        return;
      }

      setIsValidating(true);
      try {
        const { data, error } = await supabase.functions.invoke('validate-transaction', {
          body: {
            fromAddress: currentWallet.publicKey,
            toAddress: recipient,
            amount: amountNum,
            signature: `temp-${Date.now()}` // Temporary signature for validation
          }
        });

        if (error) throw error;
        setValidationResult(data as ValidationResult);
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setIsValidating(false);
      }
    };

    const timeoutId = setTimeout(validateTransaction, 500);
    return () => clearTimeout(timeoutId);
  }, [recipient, amount, currentWallet]);
  
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

    if (validationResult && !validationResult.isValid) {
      toast({
        title: "Validation Failed",
        description: validationResult.errors[0] || "Transaction cannot be processed.",
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
        // Clear the form and validation
        setRecipient('');
        setAmount('');
        setValidationResult(null);
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
                {isValidating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Coins
              </div>
            </div>
            {amount && parseFloat(amount) > 0 && (
              <p className="text-sm text-muted-foreground">
                ≈ {formatInrAmount(parseFloat(amount))}
              </p>
            )}
          </div>

          {/* Validation Messages */}
          {validationResult && (
            <div className="space-y-2">
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {validationResult.errors.map((error, idx) => (
                      <div key={idx}>{error}</div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}
              
              {validationResult.warnings.length > 0 && validationResult.isValid && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {validationResult.warnings.map((warning, idx) => (
                      <div key={idx}>{warning}</div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.isValid && validationResult.errors.length === 0 && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Transaction validated successfully
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <div className="pt-2">
            {currentWallet && (
              <div className="text-sm text-muted-foreground mb-4">
                Available Balance: <span className="font-semibold">{currentWallet.balance} Coins</span>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !currentWallet || isValidating || (validationResult && !validationResult.isValid)}
              >
              {isLoading ? "Processing..." : isValidating ? "Validating..." : "Send Coins"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SendCoinForm;
