
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatInrAmount } from '@/utils/currency';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  showInr?: boolean;
  coinValue?: number;
}

const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  className,
  showInr = false,
  coinValue
}: StatCardProps) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-crypto-green';
    if (trend === 'down') return 'text-crypto-red';
    return 'text-muted-foreground';
  };
  
  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };
  
  return (
    <Card className={cn("crypto-card overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
            <div className="text-2xl font-bold">{value}</div>
            
            {showInr && coinValue !== undefined && (
              <div className="text-sm text-muted-foreground mt-1">
                {formatInrAmount(coinValue)}
              </div>
            )}
            
            {trend && trendValue && (
              <div className={cn("text-sm mt-1 flex items-center", getTrendColor())}>
                <span>{getTrendIcon()}</span>
                <span className="ml-1">{trendValue}</span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
