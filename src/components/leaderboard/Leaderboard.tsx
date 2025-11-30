import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Crown, Medal, Star, TrendingUp, Users, Target, RefreshCw } from 'lucide-react';
import { useLeaderboard } from '@/services/leaderboardService';
import { leaderboardService, LeaderboardCategory } from '@/services/leaderboardService';
import { toast } from '@/hooks/use-toast';

interface LeaderboardProps {
  userId?: string;
  compact?: boolean;
}

export function Leaderboard({ userId, compact = false }: LeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const { entries, loading, error, refresh } = useLeaderboard(selectedCategory);
  const categories = leaderboardService.getCategories();

  const handleRefresh = async () => {
    await refresh();
    toast({
      title: "Leaderboard Refreshed",
      description: "Leaderboard data has been updated.",
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 2:
        return 'bg-gray-400/20 text-gray-600 border-gray-400/30';
      case 3:
        return 'bg-amber-600/20 text-amber-600 border-amber-600/30';
      case 4:
      case 5:
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const formatScore = (score: number) => {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    } else if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toLocaleString();
  };

  const formatWinRate = (winRate: number) => {
    return `${winRate.toFixed(1)}%`;
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span>Top Players</span>
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            </CardTitle>
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {entries.slice(0, 5).map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center space-x-3">
                {getRankIcon(entry.rank)}
                <div>
                  <div className="font-semibold text-sm">{entry.displayName}</div>
                  <div className="text-xs text-muted-foreground">{formatScore(entry.score)} pts</div>
                </div>
              </div>
              <Badge className={getRankBadgeColor(entry.rank)}>
                {entry.rank <= 3 ? 'TOP 3' : `#${entry.rank}`}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              FLOCKNODE Leaderboard
            </h2>
            <p className="text-muted-foreground">
              Compete with the best players and climb the rankings
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
            <Users className="w-3 h-3 mr-1" />
            {entries.length} PLAYERS
          </Badge>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
              <span className="text-lg">{category.icon}</span>
              <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {categories.find(c => c.id === selectedCategory)?.icon}
                  </span>
                  <div>
                    <CardTitle>
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {categories.find(c => c.id === selectedCategory)?.description}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {entries.length} Players
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading && entries.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Loading leaderboard...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-destructive mb-4">{error}</div>
                  <Button onClick={handleRefresh} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No players found in this category</p>
                  <p className="text-sm">Be the first to join the leaderboard!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Top 3 Podium */}
                  {entries.slice(0, 3).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {entries.slice(0, 3).map((entry, index) => (
                        <Card 
                          key={entry.id} 
                          className={`relative overflow-hidden ${
                            entry.rank === 1 ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10' :
                            entry.rank === 2 ? 'border-gray-400/50 bg-gradient-to-br from-gray-400/10 to-gray-500/10' :
                            'border-amber-600/50 bg-gradient-to-br from-amber-600/10 to-orange-500/10'
                          }`}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="mb-4">
                              {getRankIcon(entry.rank)}
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-bold text-lg">{entry.displayName}</h3>
                              <div className="text-2xl font-bold text-primary">
                                {formatScore(entry.score)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Level {entry.level} • {formatWinRate(entry.winRate)} WR
                              </div>
                              <div className="flex justify-center space-x-1">
                                {entry.badges.slice(0, 3).map((badge, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {badge}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Full Leaderboard */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold mb-4">Full Leaderboard</h3>
                    {entries.map((entry) => (
                      <Card key={entry.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-8">
                                {getRankIcon(entry.rank)}
                              </div>
                              <div className="flex items-center space-x-3">
                                {entry.avatarUrl ? (
                                  <img 
                                    src={entry.avatarUrl} 
                                    alt={entry.displayName}
                                    className="w-10 h-10 rounded-full border-2 border-border"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-sm font-bold text-primary">
                                      {entry.displayName.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold">{entry.displayName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {entry.gamesPlayed} games • {formatWinRate(entry.winRate)} WR
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary">
                                  {formatScore(entry.score)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Level {entry.level}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <Badge className={getRankBadgeColor(entry.rank)}>
                                  #{entry.rank}
                                </Badge>
                                {entry.streak > 0 && (
                                  <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                                    🔥 {entry.streak}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
