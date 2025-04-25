
import SendCoinForm from '@/components/SendCoinForm';
import { useWalletStore } from '@/store/walletStore';
import WalletCard from '@/components/WalletCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SendPage = () => {
  const { currentWallet, wallets, selectWallet } = useWalletStore();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Send Coins</h1>
        <p className="text-muted-foreground">
          Transfer coins to other wallet addresses
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Coin Form */}
        <div className="lg:col-span-2">
          <SendCoinForm />
          
          {/* Transaction Tips */}
          <Card className="crypto-card mt-6">
            <CardHeader>
              <CardTitle>Transaction Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Double-check Addresses</h3>
                <p className="text-sm text-muted-foreground">
                  Always verify the recipient's address before sending. Blockchain transactions cannot be reversed.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Transaction Confirmations</h3>
                <p className="text-sm text-muted-foreground">
                  Transactions require mining to be confirmed. This process may take some time to complete.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Transaction Fees</h3>
                <p className="text-sm text-muted-foreground">
                  This blockchain implementation currently has no transaction fees, but real blockchains require fees.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Wallet Selection */}
        <div className="space-y-6">
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle>Your Wallets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {wallets.length > 0 ? (
                <div className="space-y-4">
                  {wallets.map((wallet) => (
                    <WalletCard
                      key={wallet.publicKey}
                      publicKey={wallet.publicKey}
                      balance={wallet.balance}
                      isActive={currentWallet?.publicKey === wallet.publicKey}
                      onSelect={() => selectWallet(wallet.publicKey)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No wallets found. Create a wallet first.
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Active Wallet */}
          {currentWallet && (
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle>Active Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Public Key (Sending From)</div>
                    <div className="font-mono text-xs break-all bg-crypto-surfaceLight p-2 rounded-md">
                      {currentWallet.publicKey}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
                    <div className="text-2xl font-bold">{currentWallet.balance} Coins</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendPage;
