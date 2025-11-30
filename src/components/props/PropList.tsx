import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Target, RefreshCw, TrendingUp, DollarSign } from 'lucide-react';
import PropCard from './PropCard';

interface PropOption {
  id: string;
  title: string;
  odds: number;
  totalWagered: number;
  wagerCount: number;
}

interface Prop {
  id: string;
  title: string;
  description: string;
  category: 'game' | 'tournament' | 'player' | 'team';
  game?: string;
  options: PropOption[];
  status: 'open' | 'closed' | 'settled';
  totalWagered: number;
  houseVig: number;
  createdAt: string;
  closesAt: string;
  settledAt?: string;
  winningOptionId?: string;
}

interface PropStats {
  totalProps: number;
  openProps: number;
  settledProps: number;
  totalWagered: number;
  totalHouseVig: number;
  averageWager: number;
}

export default function PropList() {
  const [props, setProps] = useState<Prop[]>([]);
  const [stats, setStats] = useState<PropStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const loadProps = async () => {
    try {
      const response = await fetch('/api/v1/props');
      if (!response.ok) {
        throw new Error('Failed to load props');
      }
      const data = await response.json();
      setProps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load props');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/v1/props/stats/overview');
      if (!response.ok) {
        throw new Error('Failed to load stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProps(), loadStats()]);
    setRefreshing(false);
  };

  const handlePlaceWager = async (propId: string, optionId: string, amount: number) => {
    const response = await fetch('/api/v1/props/wager', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propId,
        optionId,
        amount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to place wager');
    }

    // Refresh props after placing wager
    await loadProps();
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadProps(), loadStats()]);
      setLoading(false);
    };

    loadData();

    // Refresh every 30 seconds
    const interval = setInterval(loadProps, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prop Bets</h1>
          <p className="text-muted-foreground">
            Bet on game outcomes, player performance, and more
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Props</p>
                  <p className="text-2xl font-bold">{stats.totalProps}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Open Props</p>
                  <p className="text-2xl font-bold">{stats.openProps}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Wagered</p>
                  <p className="text-2xl font-bold">{stats.totalWagered} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">House Vig</p>
                  <p className="text-2xl font-bold">{stats.totalHouseVig} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Props */}
      <div className="space-y-4">
        {props.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No prop bets available</h3>
              <p className="text-muted-foreground">
                Check back later for new betting opportunities!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {props.map((prop) => (
              <PropCard
                key={prop.id}
                prop={prop}
                onPlaceWager={handlePlaceWager}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


