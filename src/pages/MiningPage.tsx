
import { useBlockchainStore } from '@/store/blockchainStore';
import MiningStatus from '@/components/MiningStatus';
import BlockCard from '@/components/BlockCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Cpu, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const MiningPage = () => {
  const { chain, miningState, currentWallet } = useBlockchainStore();
  
  // Get the latest 3 blocks
  const latestBlocks = [...chain].reverse().slice(0, 3);
  
  // Calculate total mined blocks by current wallet
  const minedBlocksCount = currentWallet
    ? chain.filter(block => 
        block.transactions.some(tx => 
          tx.toAddress === currentWallet.publicKey && tx.fromAddress === null
        )
      ).length
    : 0;
  
  // Calculate total mining rewards
  const miningRewards = currentWallet
    ? chain.reduce((total, block) => {
        const rewardTx = block.transactions.find(tx => 
          tx.toAddress === currentWallet.publicKey && tx.fromAddress === null
        );
        return total + (rewardTx ? rewardTx.amount : 0);
      }, 0)
    : 0;
  
  // Calculate mining difficulty stats
  const difficulty = 4; // Same as in blockchain.ts
  const averageBlockTime = 3; // seconds (simplified for the example)
  const networkHashRate = Math.round(Math.pow(16, difficulty) / averageBlockTime);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mining Center</h1>
        <p className="text-muted-foreground">
          Mine new blocks and earn cryptocurrency rewards
        </p>
      </div>
      
      {/* Mining Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Mining Status & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <MiningStatus />
          
          {/* Mining Statistics */}
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-crypto-blue" /> Mining Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center p-4 bg-crypto-surface rounded-lg">
                  <Cpu className="h-10 w-10 text-crypto-blue mb-3" />
                  <div className="text-sm text-muted-foreground">Blocks Mined</div>
                  <div className="text-2xl font-bold mt-1">{minedBlocksCount}</div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-crypto-surface rounded-lg">
                  <Award className="h-10 w-10 text-crypto-orange mb-3" />
                  <div className="text-sm text-muted-foreground">Total Rewards</div>
                  <div className="text-2xl font-bold mt-1">{miningRewards} Coins</div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-crypto-surface rounded-lg">
                  <Activity className="h-10 w-10 text-crypto-green mb-3" />
                  <div className="text-sm text-muted-foreground">Hash Rate</div>
                  <div className="text-2xl font-bold mt-1">
                    {miningState.isMining ? miningState.hashRate : 0} H/s
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Latest Mined Blocks */}
          <div>
            <h2 className="text-xl font-bold mb-4">Latest Mined Blocks</h2>
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
        
        {/* Right Column - Network Info & Mining Guide */}
        <div className="space-y-6">
          {/* Network Information */}
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle>Network Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Mining Difficulty
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={difficulty * 20} className="h-2" />
                  <span className="text-sm font-medium">{difficulty}</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Network Hash Rate
                </div>
                <div className="text-lg font-semibold">
                  {networkHashRate.toLocaleString()} H/s
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Block Reward
                </div>
                <div className="text-lg font-semibold">100 Coins</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Total Chain Length
                </div>
                <div className="text-lg font-semibold">{chain.length} blocks</div>
              </div>
            </CardContent>
          </Card>
          
          {/* Mining Guide */}
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle>Mining Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">How Mining Works</h3>
                <p className="text-sm text-muted-foreground">
                  Mining is the process of validating transactions and adding them to the blockchain through proof of work.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Earning Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Miners earn 100 coins for each block they successfully add to the blockchain.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Getting Started</h3>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Create a wallet to receive mining rewards</li>
                  <li>Click "Start Mining" to begin the mining process</li>
                  <li>Your wallet will automatically receive rewards</li>
                  <li>Mining continues until you stop it</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MiningPage;
