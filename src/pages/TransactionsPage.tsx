
import { useBlockchainStore, getTransactionsForAddress } from '@/store/blockchainStore';
import { useWalletStore } from '@/store/walletStore';
import TransactionList from '@/components/TransactionList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import { useState } from 'react';

const TransactionsPage = () => {
  const { chain } = useBlockchainStore();
  const { currentWallet } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get all transactions from the blockchain
  const allTransactions = chain.flatMap(block => block.transactions);
  
  // Get current wallet's transactions
  const walletTransactions = currentWallet 
    ? getTransactionsForAddress(currentWallet.publicKey)
    : [];
  
  // Filter transactions by search query (address)
  const filterTransactions = (transactions: any[]) => {
    if (!searchQuery) return transactions;
    
    return transactions.filter(tx => 
      (tx.fromAddress && tx.fromAddress.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.toAddress && tx.toAddress.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };
  
  const filteredAllTransactions = filterTransactions(allTransactions);
  const filteredWalletTransactions = filterTransactions(walletTransactions);
  
  // Split wallet transactions into sent and received
  const sentTransactions = walletTransactions.filter(tx => 
    tx.fromAddress === currentWallet?.publicKey
  );
  
  const receivedTransactions = walletTransactions.filter(tx => 
    tx.toAddress === currentWallet?.publicKey
  );
  
  const filteredSentTransactions = filterTransactions(sentTransactions);
  const filteredReceivedTransactions = filterTransactions(receivedTransactions);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Transactions</h1>
        <p className="text-muted-foreground">
          View and explore all blockchain transactions
        </p>
      </div>
      
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle>Transaction Explorer</CardTitle>
          <CardDescription>
            Search and filter transactions on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by wallet address"
              className="pl-10 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Transaction Tabs */}
          <Tabs defaultValue={currentWallet ? "wallet" : "all"} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="wallet" disabled={!currentWallet}>
                Wallet Transactions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <TransactionList 
                transactions={filteredAllTransactions} 
                userAddress={currentWallet?.publicKey}
              />
            </TabsContent>
            
            <TabsContent value="wallet">
              {currentWallet && (
                <Tabs defaultValue="all">
                  <TabsList className="w-full grid grid-cols-3 mb-6">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="sent">
                      <ArrowUp className="h-3 w-3 mr-1" /> Sent
                    </TabsTrigger>
                    <TabsTrigger value="received">
                      <ArrowDown className="h-3 w-3 mr-1" /> Received
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    <TransactionList 
                      transactions={filteredWalletTransactions} 
                      userAddress={currentWallet.publicKey}
                    />
                  </TabsContent>
                  
                  <TabsContent value="sent">
                    <TransactionList 
                      transactions={filteredSentTransactions} 
                      userAddress={currentWallet.publicKey}
                    />
                  </TabsContent>
                  
                  <TabsContent value="received">
                    <TransactionList 
                      transactions={filteredReceivedTransactions} 
                      userAddress={currentWallet.publicKey}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
