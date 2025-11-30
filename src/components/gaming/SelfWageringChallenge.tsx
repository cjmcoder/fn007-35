import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  Play, 
  Award, 
  Zap,
  DollarSign,
  Timer,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  title: string;
  game: string;
  type: 'time_trial' | 'accuracy' | 'consistency' | 'endurance';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  description: string;
  benchmark: {
    target: number;
    metric: string;
    unit: string;
  };
  wager: {
    entryFee: number;
    payout: number;
    multiplier: number;
  };
  stats: {
    attempts: number;
    successRate: number;
    bestTime: number;
    averageTime: number;
  };
  requirements: string[];
  rewards: {
    fc: number;
    xp: number;
    achievements: string[];
  };
}

interface SelfWageringChallengeProps {
  challenge: Challenge;
  onStartChallenge: (challengeId: string) => void;
  userBalance: number;
}

export const SelfWageringChallenge: React.FC<SelfWageringChallengeProps> = ({
  challenge,
  onStartChallenge,
  userBalance
}) => {
  const [isAttempting, setIsAttempting] = useState(false);
  const [userStats, setUserStats] = useState({
    personalBest: 0,
    attempts: 0,
    successRate: 0,
    rank: 0
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-orange-500';
      case 'Expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'time_trial': return <Timer className="w-5 h-5" />;
      case 'accuracy': return <Target className="w-5 h-5" />;
      case 'consistency': return <TrendingUp className="w-5 h-5" />;
      case 'endurance': return <Zap className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const handleStartChallenge = () => {
    if (userBalance < challenge.wager.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${challenge.wager.entryFee} FC to attempt this challenge.`,
        variant: "destructive"
      });
      return;
    }

    setIsAttempting(true);
    onStartChallenge(challenge.id);
    
    toast({
      title: "Challenge Started!",
      description: `Good luck with "${challenge.title}"!`,
    });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toFixed(2);
    return `${minutes}:${seconds.padStart(5, '0')}`;
  };

  const formatMetric = (value: number, metric: string, unit: string) => {
    switch (metric) {
      case 'lapTime': return formatTime(value);
      case 'accuracy': return `${value}%`;
      case 'score': return value.toLocaleString();
      case 'speed': return `${value} km/h`;
      default: return `${value} ${unit}`;
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getTypeIcon(challenge.type)}
            </div>
            <div>
              <CardTitle className="text-xl">{challenge.title}</CardTitle>
              <p className="text-muted-foreground">{challenge.game}</p>
            </div>
          </div>
          
          <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
            {challenge.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Challenge Description */}
        <p className="text-muted-foreground">{challenge.description}</p>

        {/* Benchmark Target */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Target Benchmark:</span>
            <span className="text-lg font-bold text-primary">
              {formatMetric(challenge.benchmark.target, challenge.benchmark.metric, challenge.benchmark.unit)}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Metric: {challenge.benchmark.metric}</span>
            <span>•</span>
            <span>Type: {challenge.type.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Wager Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-600">Entry Fee</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{challenge.wager.entryFee} FC</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Trophy className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-600">Potential Win</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{challenge.wager.payout} FC</p>
            <p className="text-sm text-green-600">{challenge.wager.multiplier}x return</p>
          </div>
        </div>

        {/* Challenge Statistics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{challenge.stats.attempts}</p>
            <p className="text-sm text-muted-foreground">Total Attempts</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{challenge.stats.successRate}%</p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {formatMetric(challenge.stats.bestTime, challenge.benchmark.metric, challenge.benchmark.unit)}
            </p>
            <p className="text-sm text-muted-foreground">Best Time</p>
          </div>
        </div>

        {/* User Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Progress</span>
            <span className="text-sm text-muted-foreground">Rank #{userStats.rank}</span>
          </div>
          
          {userStats.personalBest > 0 && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Personal Best</span>
                <span className="font-bold text-primary">
                  {formatMetric(userStats.personalBest, challenge.benchmark.metric, challenge.benchmark.unit)}
                </span>
              </div>
              <Progress 
                value={(userStats.personalBest / challenge.benchmark.target) * 100} 
                className="h-2"
              />
            </div>
          )}
        </div>

        {/* Requirements */}
        {challenge.requirements.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Requirements:</h4>
            <ul className="space-y-1">
              {challenge.requirements.map((requirement, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rewards */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center space-x-2">
            <Award className="w-4 h-4 text-primary" />
            <span>Rewards</span>
          </h4>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{challenge.rewards.fc} FC</span>
            <span className="text-sm">•</span>
            <span className="text-sm">{challenge.rewards.xp} XP</span>
            {challenge.rewards.achievements.length > 0 && (
              <>
                <span className="text-sm">•</span>
                <span className="text-sm">{challenge.rewards.achievements.length} Achievements</span>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleStartChallenge}
          disabled={isAttempting || userBalance < challenge.wager.entryFee}
          className="w-full"
          size="lg"
        >
          {isAttempting ? (
            <>
              <Play className="w-4 h-4 mr-2 animate-pulse" />
              Starting Challenge...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start Challenge ({challenge.wager.entryFee} FC)
            </>
          )}
        </Button>

        {/* Insufficient Balance Warning */}
        {userBalance < challenge.wager.entryFee && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Insufficient balance. You need {challenge.wager.entryFee - userBalance} more FC to attempt this challenge.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};


