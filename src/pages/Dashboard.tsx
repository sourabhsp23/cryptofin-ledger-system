
import { useBlockchainStore } from '@/store/blockchainStore';
import { useWalletStore } from '@/store/walletStore';
import { useMiningStore } from '@/store/miningStore';
import { Wallet, Activity, Cpu, Send } from 'lucide-react';
import StatCard from '@/components/StatCard';
import TransactionList from '@/components/TransactionList';
import BlockCard from '@/components/BlockCard';
import BlockchainStatus from '@/components/BlockchainStatus';
import SendCoinForm from '@/components/SendCoinForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { chain, pendingTransactions, getTransactionsForAddress } = useBlockchainStore();
  const { currentWallet } = useWalletStore();
  const { miningState } = useMiningStore();
  
  // Get the latest blocks (max 3)
  const latestBlocks = [...chain].reverse().slice(0, 3);
  
  // Get the current wallet's transactions if a wallet is selected
  const transactions = currentWallet 
    ? getTransactionsForAddress(currentWallet.publicKey)
    : [];
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your blockchain finance dashboard
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Balance"
          value={currentWallet ? `${currentWallet.balance} Coins` : "No Wallet"}
          icon={<Wallet size={24} />}
          showInr={!!currentWallet}
          coinValue={currentWallet?.balance}
        />
        <StatCard
          title="Transactions"
          value={transactions.length}
          icon={<Activity size={24} />}
        />
        <StatCard
          title="Mining Status"
          value={miningState.isMining ? "Active" : "Inactive"}
          icon={<Cpu size={24} />}
        />
        <StatCard
          title="Pending Transactions"
          value={pendingTransactions.length}
          icon={<Send size={24} />}
        />
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            <Link to="/transactions">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          {currentWallet ? (
            <TransactionList 
              transactions={transactions} 
              userAddress={currentWallet.publicKey}
              limit={5}
            />
          ) : (
            <div className="bg-card rounded-lg p-6 text-center">
              <p className="text-muted-foreground mb-4">
                No wallet selected. Please create or select a wallet to view transactions.
              </p>
              <Link to="/wallet">
                <Button>Manage Wallets</Button>
              </Link>
            </div>
          )}
          
          {/* Latest Blocks */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Latest Blocks</h2>
              <Link to="/explorer">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestBlocks.map((block, index) => (
                <BlockCard 
                  key={block.hash}
                  block={block}
                  isLatest={index === 0}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - Blockchain Status & Send Form */}
        <div className="space-y-6">
          <BlockchainStatus />
          <SendCoinForm />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
