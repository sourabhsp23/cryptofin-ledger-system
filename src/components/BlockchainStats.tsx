import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Users, BarChart3, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCoinAmount, formatInrAmount } from '@/utils/currency';

interface BlockchainStatsData {
  totalTransactions: number;
  totalVolume: number;
  uniqueAddresses: number;
  averageTransactionValue: number;
  timestamp: string;
}

const BlockchainStats = () => {
  const [stats, setStats] = useState<BlockchainStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase.functions.invoke('blockchain-stats');
        
        if (fetchError) throw fetchError;
        
        setStats(data as BlockchainStatsData);
      } catch (err) {
        console.error('Failed to fetch blockchain stats:', err);
        setError('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Blockchain Statistics
          </CardTitle>
          <CardDescription>Real-time blockchain network metrics</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Blockchain Statistics
          </CardTitle>
          <CardDescription>Real-time blockchain network metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {error || 'Unable to load statistics'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Blockchain Statistics
        </CardTitle>
        <CardDescription>Real-time blockchain network metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Activity className="h-4 w-4" />
              <span>Total Transactions</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Total Volume</span>
            </div>
            <p className="text-2xl font-bold">{formatCoinAmount(stats.totalVolume)}</p>
            <p className="text-xs text-muted-foreground">≈ {formatInrAmount(stats.totalVolume)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Users className="h-4 w-4" />
              <span>Active Addresses</span>
            </div>
            <p className="text-2xl font-bold">{stats.uniqueAddresses.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <BarChart3 className="h-4 w-4" />
              <span>Avg Transaction</span>
            </div>
            <p className="text-2xl font-bold">{formatCoinAmount(stats.averageTransactionValue)}</p>
            <p className="text-xs text-muted-foreground">
              ≈ {formatInrAmount(stats.averageTransactionValue)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockchainStats;