import GameSidebar from "@/components/GameSidebar";
import TopHeader from "@/components/TopHeader";
import GameFilters from "@/components/GameFilters";
import ChallengeCard from "@/components/ChallengeCard";
import ChatPanel from "@/components/LiveFeed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockChallenges = [
  {
    player: {
      username: "antsolightskin",
      rating: 8.1,
      status: "online" as const,
    },
    game: "Madden NFL 25",
    platform: "PS5 XBX/S PC",
    prizeRange: "$42.00 - $50.00",
    timePosted: "5 min ago"
  },
  {
    player: {
      username: "TeeTimeAt9",
      rating: 10,
      status: "in-game" as const,
    },
    game: "Madden NFL 25",
    platform: "PS5 XBX/S PC",
    prizeRange: "$25.00",
    timePosted: "12 min ago"
  },
  {
    player: {
      username: "jmazz1022",
      rating: 7.5,
      status: "online" as const,
    },
    game: "Madden NFL 25",
    platform: "PS5 XBX/S PC",
    prizeRange: "$25.00",
    timePosted: "18 min ago"
  },
  {
    player: {
      username: "BaagofmoneyY",
      rating: 5.7,
      status: "offline" as const,
    },
    game: "Madden NFL 25",
    platform: "PS5 XBX/S PC",
    prizeRange: "$25.00 - $50.00",
    timePosted: "25 min ago"
  },
  {
    player: {
      username: "FastNScary",
      rating: 9.2,
      status: "online" as const,
    },
    game: "Madden NFL 25",
    platform: "PS5 XBX/S PC",
    prizeRange: "$15.00 - $25.00",
    timePosted: "32 min ago"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-bg flex">
      {/* Left Sidebar */}
      <GameSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <TopHeader />
        
        <div className="flex-1 flex">
          {/* Center Content */}
          <div className="flex-1 p-6">
            {/* Filters */}
            <div className="mb-6">
              <GameFilters />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="challenges" className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass mb-6">
                <TabsTrigger value="challenges" className="data-[state=active]:bg-primary data-[state=active]:text-background">
                  Challenges (28)
                </TabsTrigger>
                <TabsTrigger value="players" className="data-[state=active]:bg-primary data-[state=active]:text-background">
                  Players (502)
                </TabsTrigger>
                <TabsTrigger value="tournaments" className="data-[state=active]:bg-primary data-[state=active]:text-background">
                  Tournaments (9)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="challenges" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Open Challenges for Madden NFL 25 - PS5 XBX/S PC</h2>
                  <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                    Real-time Updates
                  </Badge>
                </div>
                
                {mockChallenges.map((challenge, index) => (
                  <ChallengeCard key={index} {...challenge} />
                ))}
                
                <div className="text-center py-8">
                  <Button variant="outline" className="neon-border">
                    Load More Challenges
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="players">
                <div className="glass-card p-8 rounded-xl text-center">
                  <h3 className="text-xl font-bold mb-2">Player Directory</h3>
                  <p className="text-muted-foreground">Browse and connect with players from around the world</p>
                </div>
              </TabsContent>

              <TabsContent value="tournaments">
                <div className="glass-card p-8 rounded-xl text-center">
                  <h3 className="text-xl font-bold mb-2">Tournament Hub</h3>
                  <p className="text-muted-foreground">Join competitive tournaments and climb the rankings</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Chat Panel */}
          <div className="w-80 border-l border-border">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;