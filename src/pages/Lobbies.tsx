import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopNav } from "@/components/layout/TopNav";
import { LeftNav } from "@/components/layout/LeftNav";
import { RightSquawkbox } from "@/components/layout/RightSquawkbox";
import { FiltersBar } from "@/components/lobbies/FiltersBar";
import { ChallengeTabs } from "@/components/lobbies/ChallengeTabs";
import { ChallengeCard } from "@/components/lobbies/ChallengeCard";
import { SkillStatsGrid } from "@/components/common/SkillStatsGrid";
import { TopUnityGames } from "@/components/common/TopUnityGames";
import { TopLivePlayers } from "@/components/common/TopLivePlayers";
import { RealTimeMatchSystem } from "@/components/matches/RealTimeMatchSystem";
import { EnhancedWallet } from "@/components/wallet/EnhancedWallet";
import { RealtimeWallet } from "@/components/wallet/RealtimeWallet";
import { RealtimeMatches } from "@/components/matches/RealtimeMatches";
import { RealtimeStats } from "@/components/stats/RealtimeStats";
import { MessageSquare, Plus, Wallet, Target, Gamepad2, Zap } from "lucide-react";
import { useUI } from "@/store/useUI";
import { Challenge, LiveProp } from "@/lib/types";
// Removed mock data import - fetch from real API instead
import { PropsTicker } from "@/components/ticker/PropsTicker";
import { SuggestedPlayers } from "@/components/lobbies/SuggestedPlayers";
import { RecentMatches } from "@/components/lobbies/RecentMatches";
import { OnlinePlayers } from "@/components/lobbies/OnlinePlayers";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudGamingPlayer } from "@/components/gaming/CloudGamingPlayer";
import { SelfWageringChallenge } from "@/components/gaming/SelfWageringChallenge";
import { UnifiedMatchCreation } from "@/components/gaming/UnifiedMatchCreation";
import { LiveLobby } from "@/components/lobby/LiveLobby";

export default function Lobbies() {
  const { activeTab, rightRailOpen, setRightRailOpen, setCreateChallengeOpen } = useUI();
  // TODO: Fetch real challenges from backend API
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  useEffect(() => {
    // TODO: Replace with real endpoint when available
    // fetch('/api/challenges').then(r => r.json()).then(d => setChallenges(d.challenges || []));
    setChallenges([]); // Empty until backend endpoint is ready
  }, []);
  const [props, setProps] = useState<LiveProp[]>([]);
  
  // Gaming state management
  const [showCloudGaming, setShowCloudGaming] = useState(false);
  const [showSelfWagering, setShowSelfWagering] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [cloudGamingSession, setCloudGamingSession] = useState<string | null>(null);
  
  // Unified gaming state
  const [gameMode, setGameMode] = useState<'console_stream' | 'cloud_gaming' | null>(null);
  const [matchCreationOpen, setMatchCreationOpen] = useState(false);

  const handleAcceptChallenge = (challenge: Challenge) => {
    toast({
      title: "Challenge Accepted!",
      description: `You've accepted challenge ID: ${challenge.id}`,
    });
  };

  const handleViewChallenge = (challenge: Challenge) => {
    toast({
      title: "Challenge Details",
      description: `Viewing details for challenge ID: ${challenge.id}`,
    });
  };

  // Gaming feature handlers
  const handleCloudGamingStart = (game: string) => {
    setSelectedGame(game);
    setCloudGamingSession(`session-${Date.now()}`);
    setShowCloudGaming(true);
    toast({
      title: "Cloud Gaming Starting",
      description: `Launching ${game} in your browser...`,
    });
  };

  const handleSelfWageringStart = () => {
    setShowSelfWagering(true);
    toast({
      title: "Solo Challenges",
      description: "Opening self-wagering challenges...",
    });
  };

  // Unified gaming handlers
  const handleConsoleStreamMatch = () => {
    setGameMode('console_stream');
    setMatchCreationOpen(true);
    toast({
      title: "Console Stream Match",
      description: "Setting up console streaming match...",
    });
  };

  const handleCloudGamingMatch = () => {
    setGameMode('cloud_gaming');
    setMatchCreationOpen(true);
    toast({
      title: "Cloud Gaming Match",
      description: "Setting up cloud gaming match...",
    });
  };

  const handleCreateMatch = (matchData: any) => {
    // Create match based on selected mode
    console.log('Creating match:', matchData, 'Mode:', gameMode);
    setMatchCreationOpen(false);
    setGameMode(null);
    
    toast({
      title: "Match Created!",
      description: `${gameMode === 'console_stream' ? 'Console stream' : 'Cloud gaming'} match is now live!`,
    });
  };

  const handleCloudGamingEnd = () => {
    setShowCloudGaming(false);
    setCloudGamingSession(null);
    setSelectedGame('');
    toast({
      title: "Session Ended",
      description: "Cloud gaming session has been terminated.",
    });
  };

  // Fetch props data
  useEffect(() => {
    const fetchProps = async () => {
      try {
        const response = await fetch('/api/props/live?limit=50');
        const data = await response.json();
        setProps(data.items || []);
      } catch (error) {
        console.error('Error fetching props:', error);
      }
    };

    fetchProps();
    const interval = setInterval(fetchProps, 5000); // Match ticker refresh rate
    return () => clearInterval(interval);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'challenges':
        return (
          <Tabs defaultValue="gaming" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gaming" className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <Gamepad2 className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-blue-600">Gaming</span>
                <Badge className="bg-red-500/20 text-red-500 border-red-500/30 animate-pulse ml-1">HOT</Badge>
              </TabsTrigger>
              <TabsTrigger value="matches" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Live Matches & Challenges</span>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30 ml-1">ALL</Badge>
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>My Wallet</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gaming" className="mt-6">
              <LiveLobby 
                gameMode="all"
                onJoinMatch={(matchId) => {
                  toast({
                    title: "Joining Match",
                    description: `Connecting to match ${matchId}...`,
                  });
                }}
                onCreateMatch={() => {
                  toast({
                    title: "Match Created",
                    description: "Your match is now live in the lobby!",
                  });
                }}
              />

                {/* Quick Challenge Creation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="w-5 h-5 text-primary" />
                      <span>Quick Actions</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Create challenges and start gaming immediately
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-primary shadow-glow"
                        onClick={() => setCreateChallengeOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Challenge
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Join Tournament
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Solo Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Challenges Grid */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Live Challenges</h3>
                    <div className="space-y-4">
                      {challenges.slice(0, 3).map((challenge) => (
                        <ChallengeCard
                          key={challenge.id}
                          challenge={challenge}
                          onAccept={handleAcceptChallenge}
                          onView={handleViewChallenge}
                        />
                      ))}
                    </div>
                  </div>

                  <aside className="space-y-4">
                    <SuggestedPlayers />
                    <RecentMatches />
                    <OnlinePlayers />
                  </aside>
                </div>
            </TabsContent>

            <TabsContent value="matches" className="mt-6">
              <div className="space-y-6">
                       {/* Live Matches Section */}
                       <div className="space-y-4">
                         <h3 className="text-lg font-semibold flex items-center space-x-2">
                           <Target className="w-5 h-5 text-primary" />
                           <span>Live Matches</span>
                           <Badge className="bg-green-500/20 text-green-500 border-green-500/30">LIVE</Badge>
                         </h3>
                         <RealtimeMatches maxMatches={5} showJoinButton={true} />
                       </div>

                {/* Divider */}
                <div className="border-t border-border/50 my-6"></div>

                {/* Classic Challenges Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <span>Open Challenges</span>
                    <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">CLASSIC</Badge>
                  </h3>
                  
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-primary shadow-glow"
                        onClick={() => setCreateChallengeOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create a Challenge
                      </Button>

                      <div className="space-y-4">
                        {challenges.map((challenge) => (
                          <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            onAccept={handleAcceptChallenge}
                            onView={handleViewChallenge}
                          />
                        ))}
                      </div>

                      <div className="flex justify-center mt-6">
                        <Button
                          variant="outline" 
                          className="bg-card/50 border-border hover:bg-card/80"
                          onClick={() => {
                            toast({
                              title: "Loading More Challenges",
                              description: "Fetching additional challenges...",
                            });
                          }}
                        >
                          Load More Challenges
                        </Button>
                      </div>
                    </div>

                    <aside className="space-y-4">
                      <SuggestedPlayers />
                      <RecentMatches />
                      <OnlinePlayers />
                    </aside>
                  </div>
                </div>
              </div>
            </TabsContent>

                   <TabsContent value="wallet" className="mt-6">
                     <div className="space-y-6">
                       <RealtimeWallet showActions={true} />
                       <RealtimeStats compact={true} />
                     </div>
                   </TabsContent>

          </Tabs>
        );
        
        case 'players':
          return (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Players Directory</h3>
              <p className="text-muted-foreground mb-4">Browse and connect with players from around the world</p>
              <Button 
                className="bg-gradient-primary hover:shadow-glow"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Player directory feature will be available soon!",
                  });
                }}
              >
                Browse Players
              </Button>
            </div>
          );
        
        case 'tournaments':
          return (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Tournament Hub</h3>
              <p className="text-muted-foreground mb-4">Join competitive tournaments and climb the rankings</p>
              <Button 
                className="bg-gradient-primary hover:shadow-glow"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Tournament listings will be available soon!",
                  });
                }}
              >
                View Tournaments
              </Button>
            </div>
          );

      case 'props':
        return (
          <div className="space-y-6">
            <SkillStatsGrid
              title="Skill-Based Player Stats Specials"
              items={props}
              type="prop"
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopNav />
      <PropsTicker className="sticky top-0 z-30 shadow-glow border-b-2 border-primary bg-gradient-primary/5" />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            
            <TopUnityGames />
            <TopLivePlayers />
            <FiltersBar />
            
            <ChallengeTabs>
              {renderTabContent()}
            </ChallengeTabs>
          </div>
        </main>
        
        <RightSquawkbox />
      </div>
      
      {/* Mobile Squawkbox Toggle */}
      <Button
        className="fixed bottom-4 right-4 md:hidden z-30 bg-gradient-primary shadow-glow"
        onClick={() => setRightRailOpen(!rightRailOpen)}
      >
        <MessageSquare className="w-5 h-5" />
      </Button>

      {/* Gaming Components */}
      {showCloudGaming && cloudGamingSession && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-background rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto">
            <CloudGamingPlayer
              sessionId={cloudGamingSession}
              game={selectedGame}
              onSessionEnd={handleCloudGamingEnd}
            />
          </div>
        </div>
      )}

             {showSelfWagering && (
               <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                 <div className="bg-background rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto">
                   <SelfWageringChallenge
                     onClose={() => setShowSelfWagering(false)}
                   />
                 </div>
               </div>
             )}

             {/* Unified Match Creation Modal */}
             <UnifiedMatchCreation
               isOpen={matchCreationOpen}
               onClose={() => {
                 setMatchCreationOpen(false);
                 setGameMode(null);
               }}
               onCreateMatch={handleCreateMatch}
               gameMode={gameMode}
             />
           </div>
         );
       }