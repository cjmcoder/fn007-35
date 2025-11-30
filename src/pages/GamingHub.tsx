import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Gamepad2, 
  Trophy, 
  Zap, 
  Clock, 
  Target, 
  Search, 
  Filter,
  Play,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Cloud
} from 'lucide-react';
import { CloudGamingPlayer } from '@/components/gaming/CloudGamingPlayer';
import { SelfWageringChallenge } from '@/components/gaming/SelfWageringChallenge';
import { useAuth } from '@/store/useAuth';

// Removed mock data - fetch from real API instead
// TODO: Replace with real API endpoint when available
const mockChallenges: any[] = [];
  {
    id: '1',
    title: 'Chess Puzzle Master',
    game: 'Chess',
    type: 'accuracy',
    difficulty: 'Medium',
    description: 'Solve 10 chess puzzles in under 5 minutes with 90%+ accuracy.',
    benchmark: {
      target: 90,
      metric: 'accuracy',
      unit: 'percentage'
    },
    wager: {
      entryFee: 25,
      payout: 50,
      multiplier: 2
    },
    stats: {
      attempts: 450,
      successRate: 40,
      bestTime: 92.5,
      averageTime: 78.3
    },
    requirements: [
      '10 puzzles minimum',
      'Under 5 minutes',
      '90% accuracy required'
    ],
    rewards: {
      fc: 50,
      xp: 200,
      achievements: ['Chess Master', 'Quick Thinker']
    }
  },
  {
    id: '2',
    title: 'Nürburgring Master',
    game: 'Assetto Corsa',
    type: 'time_trial',
    difficulty: 'Expert',
    description: 'Beat the 2:30.00 lap time on the legendary Nürburgring Nordschleife in a GT3 car.',
    benchmark: {
      target: 150.0, // 2:30.00 in seconds
      metric: 'lapTime',
      unit: 'seconds'
    },
    wager: {
      entryFee: 100,
      payout: 300,
      multiplier: 3
    },
    stats: {
      attempts: 1250,
      successRate: 15,
      bestTime: 148.5,
      averageTime: 165.2
    },
    requirements: [
      'GT3 car class only',
      'No assists allowed',
      'Clean lap required'
    ],
    rewards: {
      fc: 300,
      xp: 500,
      achievements: ['Nürburgring Legend', 'Speed Demon']
    }
  },
  {
    id: '3',
    title: 'Chess Speed Blitz',
    game: 'Chess',
    type: 'time_trial',
    difficulty: 'Hard',
    description: 'Win 5 blitz chess games (3+0) in under 15 minutes total.',
    benchmark: {
      target: 15.0,
      metric: 'totalTime',
      unit: 'minutes'
    },
    wager: {
      entryFee: 75,
      payout: 225,
      multiplier: 3
    },
    stats: {
      attempts: 320,
      successRate: 25,
      bestTime: 12.5,
      averageTime: 18.2
    },
    requirements: [
      '5 games minimum',
      '3+0 time control',
      'Must win all games'
    ],
    rewards: {
      fc: 225,
      xp: 350,
      achievements: ['Blitz Master', 'Speed Chess']
    }
  },
  {
    id: '4',
    title: 'Silverstone Consistency',
    game: 'Assetto Corsa',
    type: 'consistency',
    difficulty: 'Medium',
    description: 'Complete 5 consecutive laps within 2 seconds of each other on Silverstone GP.',
    benchmark: {
      target: 5,
      metric: 'laps',
      unit: 'count'
    },
    wager: {
      entryFee: 50,
      payout: 100,
      multiplier: 2
    },
    stats: {
      attempts: 890,
      successRate: 35,
      bestTime: 5,
      averageTime: 3.2
    },
    requirements: [
      'Any car class',
      'No penalties',
      '5 consecutive laps'
    ],
    rewards: {
      fc: 100,
      xp: 250,
      achievements: ['Consistency Master']
    }
  },
  {
    id: '5',
    title: 'Headshot Accuracy',
    game: 'Counter-Strike 2',
    type: 'accuracy',
    difficulty: 'Hard',
    description: 'Achieve 90%+ headshot accuracy over 100 shots in aim training.',
    benchmark: {
      target: 90,
      metric: 'accuracy',
      unit: 'percentage'
    },
    wager: {
      entryFee: 75,
      payout: 225,
      multiplier: 3
    },
    stats: {
      attempts: 650,
      successRate: 20,
      bestTime: 92.5,
      averageTime: 78.3
    },
    requirements: [
      '100 shots minimum',
      'Aim training map only',
      'No cheats or mods'
    ],
    rewards: {
      fc: 225,
      xp: 400,
      achievements: ['Precision Master', 'Aim God']
    }
  }
];

const mockTournaments = [
  {
    id: '1',
    title: 'FLOCKNODE Championship Series',
    game: 'Assetto Corsa',
    type: 'cloud_gaming',
    status: 'upcoming',
    participants: 32,
    maxParticipants: 64,
    entryFee: 200,
    prizePool: 5000,
    startTime: '2025-10-01T19:00:00Z',
    format: 'Single Elimination'
  },
  {
    id: '2',
    title: 'Weekly Speed Challenge',
    game: 'Assetto Corsa',
    type: 'cloud_gaming',
    status: 'live',
    participants: 24,
    maxParticipants: 32,
    entryFee: 100,
    prizePool: 2400,
    startTime: '2025-09-30T20:00:00Z',
    format: 'Time Trial'
  }
];

export default function GamingHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('challenges');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [userBalance] = useState(user?.walletBalance?.fc || 1000);

  const filteredChallenges = mockChallenges.filter(challenge => {
    const matchesGame = selectedGame === 'all' || challenge.game === selectedGame;
    const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;
    const matchesSearch = (challenge.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (challenge.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesGame && matchesDifficulty && matchesSearch;
  });

  const handleStartChallenge = (challengeId: string) => {
    // In real implementation, this would start a cloud gaming session
    setActiveSession(challengeId);
  };

  const handleSessionEnd = () => {
    setActiveSession(null);
  };

  const handleJoinTournament = (tournamentId: string) => {
    // In real implementation, this would join the tournament
    console.log('Joining tournament:', tournamentId);
  };

  if (activeSession) {
    const challenge = mockChallenges.find(c => c.id === activeSession);
    return (
      <div className="min-h-screen bg-background">
        <CloudGamingPlayer
          sessionId={activeSession}
          game={challenge?.game || 'Unknown Game'}
          onSessionEnd={handleSessionEnd}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold gradient-text">FLOCKNODE Gaming Hub</h1>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Console Stream (1v1) • Cloud Stream (Solo & 1v1) • Private Servers (Tournaments)
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{userBalance}</p>
                  <p className="text-sm text-muted-foreground">Your Balance (FC)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Challenges Won</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Tournaments Won</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="console-stream" className="flex items-center space-x-2">
              <Gamepad2 className="w-4 h-4" />
              <span>Console Stream (1v1)</span>
            </TabsTrigger>
            <TabsTrigger value="cloud-stream" className="flex items-center space-x-2">
              <Cloud className="w-4 h-4" />
              <span>Cloud Stream (Solo & 1v1)</span>
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Private Servers (Tournaments)</span>
            </TabsTrigger>
          </TabsList>

          {/* Console Stream Tab */}
          <TabsContent value="console-stream" className="space-y-6">
            <div className="text-center py-12">
              <Gamepad2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Console Stream (1v1 Matches)</h3>
              <p className="text-muted-foreground mb-6">
                Play traditional 1v1 matches using your own console or PC. 
                Stream your gameplay for verification and compete against other players.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Gamepad2 className="w-5 h-5 text-primary" />
                      <span>Quick Match</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Find opponents quickly and start playing immediately.
                    </p>
                    <Button className="w-full">Find Match</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Custom Match</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create custom matches with specific rules and settings.
                    </p>
                    <Button variant="outline" className="w-full">Create Match</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Cloud Stream Tab */}
          <TabsContent value="cloud-stream" className="space-y-6">
            {/* Cloud Stream Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 1v1 Browser Gaming */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-6 h-6 text-primary" />
                    <span>1v1 Browser Gaming</span>
                    <Badge variant="secondary">No Download</Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Play against other players directly in your browser. Zero downloads, instant play, 
                    impossible to cheat.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Find 1v1 Match
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Create Match
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>• Play in any browser</p>
                    <p>• Games run on FLOCKNODE cloud</p>
                    <p>• Controller support via Gamepad API</p>
                    <p>• Anti-cheat built-in</p>
                  </div>
                </CardContent>
              </Card>

              {/* Solo Self-Wagering */}
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-6 h-6 text-green-600" />
                    <span>Solo Self-Wagering</span>
                    <Badge variant="secondary" className="bg-green-600 text-white">Monetize Skills</Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Wager against yourself on skill-based games like Chess, Assetto Corsa, and more. 
                    Turn your gaming skills into FC rewards.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Target className="w-4 h-4 mr-2" />
                      View Challenges
                    </Button>
                    <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                      <Trophy className="w-4 h-4 mr-2" />
                      My Progress
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>• Chess puzzles and time trials</p>
                    <p>• Assetto Corsa lap time challenges</p>
                    <p>• Accuracy and precision tests</p>
                    <p>• Earn FC for beating benchmarks</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Solo Challenges Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Solo Self-Wagering Challenges</h3>
                <Badge variant="outline">Available Games: Chess, Assetto Corsa, Counter-Strike 2</Badge>
              </div>

              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search challenges..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Select value={selectedGame} onValueChange={setSelectedGame}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Select Game" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Games</SelectItem>
                        <SelectItem value="Chess">Chess</SelectItem>
                        <SelectItem value="Assetto Corsa">Assetto Corsa</SelectItem>
                        <SelectItem value="Counter-Strike 2">Counter-Strike 2</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Select Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Challenges Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge) => (
                  <SelfWageringChallenge
                    key={challenge.id}
                    challenge={challenge}
                    onStartChallenge={handleStartChallenge}
                    userBalance={userBalance}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tournament Play Tab */}
          <TabsContent value="tournaments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockTournaments.map((tournament) => (
                <Card key={tournament.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Trophy className="w-5 h-5 text-primary" />
                          <span>{tournament.title}</span>
                        </CardTitle>
                        <p className="text-muted-foreground">{tournament.game}</p>
                      </div>
                      <Badge variant={tournament.status === 'live' ? 'default' : 'secondary'}>
                        {tournament.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Participants</p>
                        <p className="text-lg font-semibold">
                          {tournament.participants}/{tournament.maxParticipants}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Prize Pool</p>
                        <p className="text-lg font-semibold">{tournament.prizePool} FC</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{tournament.format}</span>
                        </span>
                        <span>Entry: {tournament.entryFee} FC</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      disabled={tournament.participants >= tournament.maxParticipants}
                    >
                      {tournament.status === 'live' ? 'Join Tournament' : 'Register'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
