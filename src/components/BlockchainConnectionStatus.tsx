
import { useBlockchainStore } from '@/store/blockchainStore';
import { WifiOff, Wifi, Database } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const BlockchainConnectionStatus = () => {
  const isConnected = useBlockchainStore(state => state.isConnected);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <>
                <Database className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-amber-500">Demo Mode</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-500">Offline</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {isConnected 
              ? "Using in-memory blockchain data for demonstration" 
              : "Connection to blockchain network failed"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BlockchainConnectionStatus;
