import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/layout/TopNav";
import { LeftNav } from "@/components/layout/LeftNav";
import { RightSquawkbox } from "@/components/layout/RightSquawkbox";
import { FiltersBar } from "@/components/lobbies/FiltersBar";
import { ChallengeTabs } from "@/components/lobbies/ChallengeTabs";
import { ChallengeCard } from "@/components/lobbies/ChallengeCard";
import { SkillStatsGrid } from "@/components/common/SkillStatsGrid";
import { TopUnityGames } from "@/components/common/TopUnityGames";
import { TopLivePlayers } from "@/components/common/TopLivePlayers";
import { MessageSquare, Plus } from "lucide-react";
import { useUI } from "@/store/useUI";
import { Challenge, LiveProp } from "@/lib/types";
import challengesData from "@/__mocks__/challenges.json";
import { PropsTicker } from "@/components/ticker/PropsTicker";
import { SuggestedPlayers } from "@/components/lobbies/SuggestedPlayers";
import { RecentMatches } from "@/components/lobbies/RecentMatches";
import { OnlinePlayers } from "@/components/lobbies/OnlinePlayers";
import { toast } from "@/hooks/use-toast";

export default function Lobbies() {
  const { activeTab, rightRailOpen, setRightRailOpen, setCreateChallengeOpen } = useUI();
  const [challenges] = useState<Challenge[]>(challengesData as Challenge[]);
  const [props, setProps] = useState<LiveProp[]>([]);

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

              <section aria-labelledby="open-challenges">
                <h3 id="open-challenges" className="text-base font-semibold mb-2">Open Challenges</h3>
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

                {/* Skill Stats Grid for All Games */}
                <div className="mt-8">
                  <SkillStatsGrid
                    title="Skill-Based Player Stats Specials"
                    items={challenges.slice(0, 6)} // Show sample challenges as skill stats
                    type="challenge"
                  />
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
              </section>
            </div>

            <aside className="space-y-4">
              <SuggestedPlayers />
              <RecentMatches />
              <OnlinePlayers />
            </aside>
          </div>
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
    </div>
  );
}