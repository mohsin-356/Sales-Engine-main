import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  tooltip?: string;
}

export const KPICard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  className,
  tooltip,
}: KPICardProps) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const renderChangeIndicator = () => {
    if (change === undefined) return null;

    const isPositive = changeType === 'positive';
    const isNegative = changeType === 'negative';
    
    return (
      <div className={cn(
        "flex items-center text-xs",
        isPositive && "text-accent",
        isNegative && "text-destructive",
        changeType === 'neutral' && "text-muted-foreground"
      )}>
        {isPositive && <TrendingUp className="mr-1 h-3 w-3" />}
        {isNegative && <TrendingDown className="mr-1 h-3 w-3" />}
        {changeType === 'neutral' && <Minus className="mr-1 h-3 w-3" />}
        {Math.abs(change)}%
      </div>
    );
  };

  const inner = (
    <Card className={cn("w-full bg-card rounded-xl shadow-sm hover:shadow-xl transition-all group border border-muted/10", className)}>
      <CardHeader className="flex items-center justify-between p-4 pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground font-poppins tracking-wide">
          {title}
        </CardTitle>
        {icon && (
          <div className="p-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg hover:scale-110 hover:rotate-6 transition-transform duration-200">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-end justify-between">
          <div className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent font-poppins group-hover:tracking-wide transition-all">
            {formatValue(value)}
          </div>
          {renderChangeIndicator()}
        </div>
      </CardContent>
    </Card>
  );

  if (!tooltip) return inner;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{inner}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-xs text-muted-foreground">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
;