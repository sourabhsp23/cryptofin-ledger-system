
import { useBlockchainStore } from '@/store/blockchainStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Database, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const ExplorerPage = () => {
  const { chain } = useBlockchainStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  
  // Sort blocks in reverse order (newest first)
  const sortedBlocks = [...chain].reverse();
  
  // Filter blocks by hash if search query exists
  const filteredBlocks = searchQuery
    ? sortedBlocks.filter(block => 
        block.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.previousHash.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedBlocks;
  
  const toggleExpandBlock = (hash: string) => {
    setExpandedBlock(expandedBlock === hash ? null : hash);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Blockchain Explorer</h1>
        <p className="text-muted-foreground">
          Explore blocks and transactions on the blockchain
        </p>
      </div>
      
      {/* Search Bar */}
      <Card className="crypto-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by block hash"
                className="pl-10 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="md:w-auto"
            >
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Blockchain Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="crypto-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Blocks</h3>
                <div className="text-2xl font-bold">{chain.length}</div>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="crypto-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Transactions</h3>
                <div className="text-2xl font-bold">
                  {chain.reduce((sum, block) => sum + block.transactions.length, 0)}
                </div>
              </div>
              <LinkIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="crypto-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Latest Block</h3>
                <div className="text-2xl font-bold">
                  {new Date(chain[chain.length - 1].timestamp).toLocaleDateString()}
                </div>
              </div>
              <div className="h-8 w-8 flex items-center justify-center text-lg font-mono text-muted-foreground">
                #{chain.length - 1}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Block Explorer */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-crypto-blue" /> Blockchain Explorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBlocks.length > 0 ? (
              filteredBlocks.map((block, index) => (
                <div key={block.hash} className="border border-border/40 rounded-lg overflow-hidden">
                  {/* Block Header */}
                  <div 
                    className="bg-crypto-surface p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpandBlock(block.hash)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-crypto-surfaceLight text-sm font-mono">
                        {chain.length - 1 - index}
                      </div>
                      <div>
                        <div className="font-medium">Block {block.hash.substring(0, 8)}...</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(block.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="text-muted-foreground">
                        {block.transactions.length} Tx
                      </div>
                      <div className={cn(
                        "transition-transform duration-200",
                        expandedBlock === block.hash ? "rotate-180" : ""
                      )}>
                        ↓
                      </div>
                    </div>
                  </div>
                  
                  {/* Block Details */}
                  {expandedBlock === block.hash && (
                    <div className="p-4 space-y-4 bg-card">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Hash</div>
                          <div className="hash-text">{block.hash}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Previous Hash</div>
                          <div className="hash-text">{block.previousHash}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Timestamp</div>
                          <div>{new Date(block.timestamp).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Nonce</div>
                          <div>{block.nonce}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Transactions</div>
                          <div>{block.transactions.length}</div>
                        </div>
                      </div>
                      
                      {/* Block Transactions */}
                      {block.transactions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/40">
                          <div className="text-sm font-medium mb-3">Transactions</div>
                          <div className="space-y-3">
                            {block.transactions.map((tx, txIndex) => (
                              <div key={txIndex} className="bg-crypto-surfaceLight p-3 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">From: </span>
                                    <span className="font-mono">
                                      {tx.fromAddress ? tx.fromAddress.substring(0, 20) + '...' : 'System (Mining Reward)'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">To: </span>
                                    <span className="font-mono">{tx.toAddress.substring(0, 20)}...</span>
                                  </div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">Timestamp: </span>
                                    <span>{new Date(tx.timestamp).toLocaleString()}</span>
                                  </div>
                                  <div className="font-medium">{tx.amount} Coins</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No blocks found matching your search criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExplorerPage;
