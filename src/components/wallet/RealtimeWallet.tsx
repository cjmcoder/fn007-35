import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, RefreshCw, TrendingUp, Clock, DollarSign, Lock } from 'lucide-react';
import { useRealtimeWallet } from '@/services/realtimeService';
import { toast } from '@/hooks/use-toast';

interface RealtimeWalletProps {
  showActions?: boolean;
  compact?: boolean;
}

export function RealtimeWallet({ showActions = true, compact = false }: RealtimeWalletProps) {
  const { walletData, loading, error, refresh } = useRealtimeWallet();

  const handleRefresh = async () => {
    await refresh();
    toast({
      title: "Wallet Refreshed",
      description: "Your wallet balance has been updated.",
    });
  };

  if (loading && !walletData) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-md"}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading wallet...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-md"}>
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="text-destructive text-sm">{error}</div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!walletData) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-md"}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No wallet data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { balances, lastUpdated } = walletData;
  const totalBalance = balances.FC.available + balances.FC.locked;

  return (
    <Card className={`${compact ? "w-full" : "w-full max-w-md"} border-green-500/20 bg-green-500/5`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-green-600" />
            <span>My Wallet</span>
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-green-600" />}
          </CardTitle>
          <div className="flex space-x-2">
            <Badge variant="secondary" className="bg-green-500/20 text-green-600">
              LIVE
            </Badge>
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Available</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {balances.FC.available.toLocaleString()} FC
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Locked</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {balances.FC.locked.toLocaleString()} FC
            </div>
          </div>
        </div>

        {/* Total Balance */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-semibold">Total Balance</span>
            </div>
            <div className="text-xl font-bold text-primary">
              {totalBalance.toLocaleString()} FC
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Last updated</span>
          </div>
          <span>{new Date(lastUpdated).toLocaleTimeString()}</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="pt-3 border-t border-border/50 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <DollarSign className="w-4 h-4 mr-2" />
                Deposit
              </Button>
              <Button size="sm" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
