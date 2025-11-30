import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropIntegrationService } from '@/services/propIntegrationService';
import { useAuth } from '@/store/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PropStats {
  totalProps: number;
  wins: number;
  losses: number;
  pending: number;
  totalStaked: number;
  totalWinnings: number;
  winRate: number;
  profit: number;
}

interface PropStake {
  id: string;
  propId: string;
  side: string;
  amount: number;
  status: string;
  payoutAmount?: number;
  createdAt: string;
}

interface UserPropStats {
  userStats: any;
  propStats: PropStats;
  recentStakes: PropStake[];
}

export const PropHistory: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<UserPropStats | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadPropStats();
    }
  }, [isAuthenticated, user]);

  const loadPropStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const propStats = await PropIntegrationService.getUserPropStats(user.id);
      setStats(propStats);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load prop statistics.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WON':
        return <Badge className="bg-green-600 text-white">Won</Badge>;
      case 'LOST':
        return <Badge variant="destructive">Lost</Badge>;
      case 'LOCKED':
        return <Badge variant="outline">Pending</Badge>;
      case 'REFUNDED':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(1)} FC`;
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prop Betting History</CardTitle>
          <CardDescription>Login to view your prop betting statistics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prop Betting History</CardTitle>
          <CardDescription>Loading your statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading prop data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prop Betting History</CardTitle>
          <CardDescription>No prop betting data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prop Betting History</CardTitle>
        <CardDescription>Your skill-based prop betting statistics and recent activity</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recent">Recent Stakes</TabsTrigger>
            <TabsTrigger value="stats">Detailed Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="text-2xl font-bold text-blue-600">{stats.propStats.totalProps}</div>
                <div className="text-sm text-muted-foreground">Total Props</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="text-2xl font-bold text-green-600">{stats.propStats.wins}</div>
                <div className="text-sm text-muted-foreground">Wins</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="text-2xl font-bold text-red-600">{stats.propStats.losses}</div>
                <div className="text-sm text-muted-foreground">Losses</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="text-2xl font-bold text-orange-600">{stats.propStats.winRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.propStats.totalStaked)}</div>
                <div className="text-sm text-muted-foreground">Total Staked</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className={`text-2xl font-bold ${stats.propStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.propStats.profit)}
                </div>
                <div className="text-sm text-muted-foreground">Net Profit</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-4">
            <div className="space-y-3">
              {stats.recentStakes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent prop stakes found
                </div>
              ) : (
                stats.recentStakes.map((stake) => (
                  <div key={stake.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">Prop #{stake.propId.slice(-8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {stake.side} • {formatCurrency(stake.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(stake.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(stake.status)}
                      {stake.payoutAmount && (
                        <div className="text-sm font-medium text-green-600 mt-1">
                          +{formatCurrency(stake.payoutAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Performance Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Win Rate:</span>
                    <span className="font-medium">{stats.propStats.winRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Props:</span>
                    <span className="font-medium">{stats.propStats.totalProps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wins:</span>
                    <span className="font-medium text-green-600">{stats.propStats.wins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Losses:</span>
                    <span className="font-medium text-red-600">{stats.propStats.losses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="font-medium text-orange-600">{stats.propStats.pending}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Financial Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Staked:</span>
                    <span className="font-medium">{formatCurrency(stats.propStats.totalStaked)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Winnings:</span>
                    <span className="font-medium text-green-600">{formatCurrency(stats.propStats.totalWinnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Profit:</span>
                    <span className={`font-medium ${stats.propStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.propStats.profit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI:</span>
                    <span className={`font-medium ${stats.propStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.propStats.totalStaked > 0 
                        ? ((stats.propStats.profit / stats.propStats.totalStaked) * 100).toFixed(1) + '%'
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PropHistory;




