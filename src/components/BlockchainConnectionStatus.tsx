
import { useBlockchainStore } from '@/store/blockchainStore';
import { WifiOff, Wifi } from 'lucide-react';

const BlockchainConnectionStatus = () => {
  const isConnected = useBlockchainStore(state => state.isConnected);
  
  return (
    <div className="flex items-center gap-1">
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-xs text-green-500">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-xs text-red-500">Offline</span>
        </>
      )}
    </div>
  );
};

export default BlockchainConnectionStatus;
