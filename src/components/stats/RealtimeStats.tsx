import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, Target, Gamepad2, Zap, RefreshCw, TrendingUp } from 'lucide-react';
import { useRealtimeStats } from '@/services/realtimeService';

interface RealtimeStatsProps {
  compact?: boolean;
}

export function RealtimeStats({ compact = false }: RealtimeStatsProps) {
  const { stats, loading, error } = useRealtimeStats();

  if (loading && !stats) {
    return (
      <Card className={compact ? "w-full" : ""}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading stats...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={compact ? "w-full" : ""}>
        <CardContent className="p-6">
          <div className="text-center text-destructive text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={compact ? "w-full" : ""}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No stats available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Target className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
              <div className="text-lg font-bold text-primary">{stats.activeMatches}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Users className="w-3 h-3 text-blue-600" />
                <span className="text-xs text-muted-foreground">Players</span>
              </div>
              <div className="text-lg font-bold text-blue-600">{stats.totalPlayers}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Gamepad2 className="w-3 h-3 text-green-600" />
                <span className="text-xs text-muted-foreground">Console</span>
              </div>
              <div className="text-lg font-bold text-green-600">{stats.consoleStreamMatches}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Zap className="w-3 h-3 text-purple-600" />
                <span className="text-xs text-muted-foreground">Cloud</span>
              </div>
              <div className="text-lg font-bold text-purple-600">{stats.cloudGamingMatches}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Matches */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Matches</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-2xl font-bold text-primary">{stats.activeMatches}</p>
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
              </div>
            </div>
            <div className="p-2 bg-primary/20 rounded-full">
              <Target className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waiting Matches */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Waiting Matches</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-2xl font-bold text-yellow-600">{stats.waitingMatches}</p>
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-yellow-600" />}
              </div>
            </div>
            <div className="p-2 bg-yellow-500/20 rounded-full">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Players */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Players</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-2xl font-bold text-blue-600">{stats.totalPlayers}</p>
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
              </div>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-full">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gaming Mode Breakdown */}
      <Card className="border-purple-500/20 bg-purple-500/5">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Gaming Modes</p>
              {loading && <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gamepad2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Console Stream</span>
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                  {stats.consoleStreamMatches}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Cloud Gaming</span>
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">
                  {stats.cloudGamingMatches}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
