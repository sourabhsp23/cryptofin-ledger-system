
import { useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { useBlockchainStore, getTransactionsForAddress } from '@/store/blockchainStore';
import WalletCard from '@/components/WalletCard';
import TransactionList from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { Plus, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const WalletPage = () => {
  const { toast } = useToast();
  const {
    wallets,
    currentWallet,
    createWallet,
    selectWallet
  } = useWalletStore();
  const { refreshBlockchain } = useBlockchainStore();
  
  // Refresh blockchain data on mount to recalculate balances
  useEffect(() => {
    refreshBlockchain();
  }, []);
  
  const handleCreateWallet = () => {
    createWallet();
    toast({
      title: "Wallet Created",
      description: "Your new wallet has been created successfully."
    });
  };
  
  const handleSelectWallet = (publicKey: string) => {
    selectWallet(publicKey);
    toast({
      title: "Wallet Selected",
      description: "You've switched to a different wallet."
    });
  };
  
  // Get current wallet's transactions
  const transactions = currentWallet 
    ? getTransactionsForAddress(currentWallet.publicKey)
    : [];
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Wallet Management</h1>
        <p className="text-muted-foreground">
          Create and manage your blockchain wallets
        </p>
      </div>
      
      {/* Wallet Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Your Wallets</h2>
          <p className="text-sm text-muted-foreground">
            You have {wallets?.length || 0} wallet{wallets?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleCreateWallet}>
          <Plus className="h-4 w-4 mr-2" /> Create New Wallet
        </Button>
      </div>
      
      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wallets?.map((wallet) => (
          <WalletCard
            key={wallet.publicKey}
            publicKey={wallet.publicKey}
            balance={wallet.balance}
            isActive={currentWallet?.publicKey === wallet.publicKey}
            onSelect={() => handleSelectWallet(wallet.publicKey)}
          />
        )) || null}
      </div>
      
      {/* Wallet Details (if a wallet is selected) */}
      {currentWallet && (
        <div className="mt-8 pt-8 border-t border-border/40">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Wallet Details</h2>
              
              <div className="crypto-card p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Public Key</h3>
                    <div className="font-mono text-xs break-all bg-crypto-surfaceLight p-3 rounded-md">
                      {currentWallet.publicKey}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Private Key</h3>
                    <div className="relative">
                      <div className="font-mono text-xs break-all bg-crypto-surfaceLight p-3 rounded-md blur-sm hover:blur-none transition-all duration-200">
                        {currentWallet.privateKey}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 p-2 rounded-full">
                          <Key className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-crypto-red mt-1">Never share your private key!</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">Transaction History</h2>
              <TransactionList 
                transactions={transactions} 
                userAddress={currentWallet.publicKey}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
