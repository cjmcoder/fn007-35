import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Home, Users, Trophy, Target, Play, MoreVertical, X, TrendingUp } from "lucide-react";
import { GameTitle, LiveProp } from "@/lib/types";
import TopHeader from "@/components/TopHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SkillStatsModal } from "@/components/modals/SkillStatsModal";
import { Seo } from "@/components/Seo";
import { SkillStatsGrid } from "@/components/common/SkillStatsGrid";
import { useSearchParams } from "react-router-dom";
import challengesData from "@/__mocks__/challenges.json";

interface LiveStream {
  id: string;
  matchId: string;
  player1: { name: string; rank: string; rating: number };
  player2: { name: string; rank: string; rating: number };
  game: GameTitle;
  wagerAmount: number;
  currentScore?: string;
  spectatorCount: number;
  streamUrl: string;
  thumbnailUrl: string;
  status: 'live' | 'starting' | 'ended';
}

interface SideProp {
  id: string;
  matchId: string;
  player: string;
  propType: string;
  line: number;
  stake: number;
  odds: string;
}

// Mock data
const liveStreams: LiveStream[] = [
  {
    id: "1",
    matchId: "M001-2024-001",
    player1: { name: "ProGamer_X", rank: "Elite", rating: 1850 },
    player2: { name: "SkillMaster", rank: "Pro", rating: 1720 },
    game: "Madden NFL 25",
    wagerAmount: 500,
    currentScore: "14-7",
    spectatorCount: 342,
    streamUrl: "https://twitch.tv/embed/channel1",
    thumbnailUrl: "/placeholder.svg",
    status: 'live'
  },
  {
    id: "2",
    matchId: "M002-2024-002",
    player1: { name: "UFC_Legend", rank: "Elite", rating: 1920 },
    player2: { name: "Fighter_Pro", rank: "Pro", rating: 1680 },
    game: "UFC 5",
    wagerAmount: 250,
    spectatorCount: 158,
    streamUrl: "https://youtube.com/embed/channel2",
    thumbnailUrl: "/placeholder.svg",
    status: 'live'
  },
  {
    id: "3",
    matchId: "M003-2024-003",
    player1: { name: "HoopsKing", rank: "Pro", rating: 1650 },
    player2: { name: "CourtVision", rank: "Elite", rating: 1780 },
    game: "NBA 2K25",
    wagerAmount: 100,
    currentScore: "45-38",
    spectatorCount: 89,
    streamUrl: "https://twitch.tv/embed/channel3",
    thumbnailUrl: "/placeholder.svg",
    status: 'live'
  }
];

export default function FlockTube() {
  const [searchParams] = useSearchParams();
  const playerParam = searchParams.get('player');
  
  const [selectedGame, setSelectedGame] = useState<GameTitle | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState(playerParam || '');
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [selectedProp, setSelectedProp] = useState<LiveProp | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'stats'>('live');
  const [skillProps, setSkillProps] = useState<LiveProp[]>([]);
  const challenges = challengesData as any[];

  // Fetch skill props data
  useEffect(() => {
    const fetchSkillProps = async () => {
      try {
        const response = await fetch('/api/props/live?limit=100');
        const data = await response.json();
        setSkillProps(data.items || []);
      } catch (error) {
        console.error('Error fetching skill props:', error);
      }
    };

    fetchSkillProps();
    const interval = setInterval(fetchSkillProps, 5000); // Match other components refresh rate
    return () => clearInterval(interval);
  }, []);

  // Update search when player param changes
  useEffect(() => {
    if (playerParam) {
      setSearchQuery(playerParam);
    }
  }, [playerParam]);

  const gameOptions: (GameTitle | 'All')[] = ['All', 'Madden NFL 25', 'UFC 5', 'NBA 2K25', 'FIFA 24', 'NHL 24'];

  const filteredStreams = liveStreams.filter(stream => {
    const matchesGame = selectedGame === 'All' || stream.game === selectedGame;
    const matchesSearch = searchQuery === '' || 
      stream.player1.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.player2.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.matchId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGame && matchesSearch;
  });

  const handleStreamClick = (stream: LiveStream) => {
    setSelectedStream(stream);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo 
        title="FlockTube - Live VIP Match Streaming | FLOCKNODE"
        description="Watch live VIP private server matches, place side bets, and follow your favorite skilled players on FLOCKNODE's premium streaming platform."
      />
      
      <div className="min-h-screen bg-background">
        <TopHeader />
        
        <div className="container mx-auto px-4 py-4">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold gradient-text">FLOCKTUBE</h1>
                <p className="text-sm text-muted-foreground">Live VIP Match Streaming</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {filteredStreams.length} Live Matches
              </Badge>
              {playerParam && (
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Showing: {playerParam}
                </Badge>
              )}
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search players, matches, or Match IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-border focus:border-primary"
              />
            </div>
            <Select value={selectedGame} onValueChange={(value: GameTitle | 'All') => setSelectedGame(value)}>
              <SelectTrigger className="w-48 bg-card/50 border-border">
                <SelectValue placeholder="Select Game" />
              </SelectTrigger>
              <SelectContent>
                {gameOptions.map((game) => (
                  <SelectItem key={game} value={game}>
                    {game}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Game Filters */}
            <div className="lg:col-span-1">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span>Game Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {gameOptions.map((game) => (
                    <Button
                      key={game}
                      variant={selectedGame === game ? "default" : "ghost"}
                      className="w-full justify-start text-left"
                      onClick={() => setSelectedGame(game)}
                    >
                      {game}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Central Content - Live Stream Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStreams.map((stream) => (
                  <Card key={stream.id} className="gaming-card hover:border-primary cursor-pointer" onClick={() => handleStreamClick(stream)}>
                    <div className="relative">
                      {/* Stream Thumbnail with FLOCKNODE Logo Overlay */}
                      <div className="aspect-video bg-muted/20 rounded-t-lg relative overflow-hidden">
                        <img 
                          src={stream.thumbnailUrl} 
                          alt={`${stream.player1.name} vs ${stream.player2.name}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold">
                          FLOCKNODE
                        </div>
                        <div className="absolute top-2 left-2 flex space-x-2">
                          <Badge className="bg-destructive text-destructive-foreground">
                            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                            LIVE
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="secondary" className="bg-background/80">
                            <Users className="w-3 h-3 mr-1" />
                            {stream.spectatorCount}
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <Button size="sm" variant="secondary" className="bg-primary/20 hover:bg-primary/30">
                            <Play className="w-3 h-3 mr-1" />
                            Watch
                          </Button>
                        </div>
                      </div>

                      {/* Stream Info */}
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Match ID */}
                          <div className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded">
                            Match ID: {stream.matchId}
                          </div>
                          
                          {/* Players */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{stream.player1.name}</span>
                                <Badge variant="outline" className="text-xs">{stream.player1.rank}</Badge>
                                <span className="text-xs text-muted-foreground">({stream.player1.rating})</span>
                              </div>
                            </div>
                            <div className="text-center text-xs text-muted-foreground">VS</div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{stream.player2.name}</span>
                                <Badge variant="outline" className="text-xs">{stream.player2.rank}</Badge>
                                <span className="text-xs text-muted-foreground">({stream.player2.rating})</span>
                              </div>
                            </div>
                          </div>

                          {/* Game & Wager */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{stream.game}</span>
                            <Badge className="bg-primary/20 text-primary">
                              ${stream.wagerAmount} FC
                            </Badge>
                          </div>

                          {/* Score */}
                          {stream.currentScore && (
                            <div className="text-center">
                              <span className="text-lg font-bold text-primary">{stream.currentScore}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredStreams.length === 0 && (
                <Card className="gaming-card">
                  <CardContent className="p-8 text-center">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Live Matches</h3>
                    <p className="text-muted-foreground">No matches are currently streaming for the selected filters.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Player Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <Card className="p-6 text-center bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h2 className="text-xl font-bold mb-2">Live Player Stats & Challenges</h2>
                  <p className="text-muted-foreground mb-4">
                    Watch live streams while tracking real-time player statistics and participate in skill-based challenges
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">Real-time Stats</Badge>
                    <Badge variant="outline">Live Challenges</Badge>
                    <Badge variant="outline">Stream Integration</Badge>
                    <Badge variant="outline">Performance Analytics</Badge>
                  </div>
                </Card>

                <SkillStatsGrid
                  title="Live Stream Player Challenges"
                  items={challenges.slice(0, 9)}
                  type="challenge"
                  className="mb-6"
                />
              </div>
            )}

            {/* Right Sidebar - Live Challenge Feed */}
            <div className="lg:col-span-1">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span>Skill Props</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skillProps.slice(0, 5).map((prop) => (
                    <div 
                      key={prop.id} 
                      className="glass-card p-3 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                      onClick={() => setSelectedProp(prop)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{prop.player.name}</span>
                        <Badge variant="outline" className="text-xs">+{((prop.payoutFC / prop.entryFC - 1) * 100).toFixed(0)}%</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">{prop.propType}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">O/U {prop.line}</span>
                        <span className="text-sm text-primary">${prop.entryFC} FC</span>
                      </div>
                      <Button size="sm" className="w-full mt-2 bg-primary/20 hover:bg-primary/30 text-primary">
                        Place Bet
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Full Screen Stream Modal */}
        <Dialog open={!!selectedStream} onOpenChange={() => setSelectedStream(null)}>
          <DialogContent className="max-w-6xl h-[90vh] bg-card border-border">
            <DialogHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <DialogTitle className="gradient-text">
                  {selectedStream?.player1.name} vs {selectedStream?.player2.name}
                </DialogTitle>
                <Badge className="bg-primary/20 text-primary">
                  Match ID: {selectedStream?.matchId}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedStream(null)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogHeader>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Stream Player */}
              <div className="lg:col-span-3">
                <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Stream Player</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStream?.streamUrl}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Side Props Panel */}
              <div className="lg:col-span-1">
                <Card className="h-full gaming-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Skill Props</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {skillProps
                      .filter(prop => prop.matchId === selectedStream?.matchId)
                      .slice(0, 5)
                      .map((prop) => (
                        <div 
                          key={prop.id} 
                          className="glass-card p-3 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                          onClick={() => setSelectedProp(prop)}
                        >
                          <div className="text-sm font-medium mb-1">{prop.player.name}</div>
                          <div className="text-xs text-muted-foreground mb-2">{prop.propType}</div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">O/U {prop.line}</span>
                            <Badge variant="outline">+{((prop.payoutFC / prop.entryFC - 1) * 100).toFixed(0)}%</Badge>
                          </div>
                          <Button size="sm" className="w-full bg-primary/20 hover:bg-primary/30 text-primary">
                            Bet ${prop.entryFC} FC
                          </Button>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Prop Details Modal */}
        <SkillStatsModal
          open={!!selectedProp}
          onOpenChange={() => setSelectedProp(null)}
          data={selectedProp}
          type="prop"
        />
      </div>
    </div>
  );
}