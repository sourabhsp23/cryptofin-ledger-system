
import { useBlockchainStore } from '@/store/blockchainStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cpu, Hammer, Play, Square } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MiningStatus = () => {
  const { toast } = useToast();
  const { miningState, startMining, stopMining, currentWallet } = useBlockchainStore();
  
  const handleStartMining = () => {
    startMining();
    toast({
      title: "Mining Started",
      description: "You've started mining the blockchain. Rewards will be added to your wallet."
    });
  };
  
  const handleStopMining = () => {
    stopMining();
    toast({
      title: "Mining Stopped",
      description: "You've stopped mining the blockchain."
    });
  };
  
  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-crypto-blue" /> Mining Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${miningState.isMining ? 'bg-crypto-green animate-pulse' : 'bg-muted'}`}></div>
            <div className="text-sm font-medium">
              Status: {miningState.isMining ? 'Mining in progress' : 'Idle'}
            </div>
          </div>
          
          {miningState.isMining && (
            <>
              <div className="flex justify-between items-center text-sm">
                <span>Hash Rate:</span>
                <span className="font-mono">{miningState.hashRate} H/s</span>
              </div>
              
              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span>Mining Progress:</span>
                  <span className="animate-mining inline-block">
                    <Hammer className="h-4 w-4 text-crypto-orange" />
                  </span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </>
          )}
          
          <div className="flex justify-between gap-4 pt-2">
            <Button
              onClick={handleStartMining}
              disabled={miningState.isMining || !currentWallet}
              className="flex-1"
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" /> Start Mining
            </Button>
            
            <Button
              onClick={handleStopMining}
              disabled={!miningState.isMining}
              className="flex-1"
              variant="outline"
            >
              <Square className="h-4 w-4 mr-2" /> Stop Mining
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MiningStatus;
