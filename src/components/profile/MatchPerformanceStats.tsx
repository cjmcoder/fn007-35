import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatFC } from "@/lib/fncMath";
import { 
  Trophy,
  Target,
  TrendingUp,
  Flame,
  DollarSign,
  Coins
} from "lucide-react";

interface MatchPerformanceStatsProps {
  wins?: number;
  losses?: number;
  currentStreak?: number;
  streakType?: 'win' | 'loss';
  lifetimeEarningsFC?: number;
  lifetimeEarningsFNC?: number;
  currentRank?: number;
  totalPlayers?: number;
  xpProgress?: number; // 0-100 percentage
}

export const MatchPerformanceStats = ({
  wins = 12,
  losses = 8, 
  currentStreak = 3,
  streakType = 'win',
  lifetimeEarningsFC = 4850,
  lifetimeEarningsFNC = 12750,
  currentRank = 47,
  totalPlayers = 1250,
  xpProgress = 68
}: MatchPerformanceStatsProps) => {
  
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const totalMatches = wins + losses;

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Stats */}
        <Card className="gaming-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-primary" />
              Match Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{wins}</div>
                <div className="text-xs text-muted-foreground">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{losses}</div>
                <div className="text-xs text-muted-foreground">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{winRate}%</div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${streakType === 'win' ? 'text-primary' : 'text-destructive'}`} />
                <span className="text-sm font-medium">Current Streak</span>
              </div>
              <Badge variant={streakType === 'win' ? 'default' : 'destructive'}>
                {currentStreak} {streakType === 'win' ? 'W' : 'L'}
              </Badge>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Rank Progress</span>
                <span className="text-muted-foreground">
                  #{currentRank} of {totalPlayers.toLocaleString()}
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Progress value={xpProgress} className="h-3" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{xpProgress}% to next rank milestone</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Lifetime Earnings */}
        <Card className="gaming-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-primary" />
              Lifetime Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="text-xl font-bold text-primary font-mono">
                      {formatFC(lifetimeEarningsFC)}
                    </div>
                    <div className="text-xs text-muted-foreground">FC Earned</div>
                    <div className="text-xs text-primary/80 mt-1">Cash Value</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total FC earned from matches and tournaments</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <div className="text-center p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                    <div className="text-xl font-bold text-secondary font-mono">
                      {lifetimeEarningsFNC.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">FNC Earned</div>
                    <div className="text-xs text-secondary/80 mt-1">Speculative</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total FNC earned from performance rewards</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Matches</span>
                <span className="font-medium">{totalMatches}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Avg. per Match</span>
                <span className="font-medium font-mono">
                  {totalMatches > 0 ? formatFC(Math.round(lifetimeEarningsFC / totalMatches)) : '0'} FC
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};