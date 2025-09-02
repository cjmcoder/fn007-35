import { useState, useEffect } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { LeftNav } from "@/components/layout/LeftNav";
import { RightSquawkbox } from "@/components/layout/RightSquawkbox";
import { SkillStatsGrid } from "@/components/common/SkillStatsGrid";
import { PropsTicker } from "@/components/ticker/PropsTicker";
import { Button } from "@/components/ui/button";
import { MessageSquare, Filter } from "lucide-react";
import { useUI } from "@/store/useUI";
import { LiveProp } from "@/lib/types";
import { Seo } from "@/components/Seo";

export default function Props() {
  const { rightRailOpen, setRightRailOpen } = useUI();
  const [props, setProps] = useState<LiveProp[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch props data
  useEffect(() => {
    const fetchProps = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/props/live?limit=100');
        const data = await response.json();
        setProps(data.items || []);
      } catch (error) {
        console.error('Error fetching props:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProps();
    const interval = setInterval(fetchProps, 5000); // Match ticker refresh rate
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Seo 
        title="Skill Props - Live Player Statistics Betting"
        description="Bet on skill-based player statistics across all your favorite games. Live props with real-time updates and competitive odds."
      />
      
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        <TopNav />
        <PropsTicker className="sticky top-0 z-30 shadow-glow border-b-2 border-primary bg-gradient-primary/5" />
        
        <div className="flex flex-1 overflow-hidden">
          <LeftNav />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-6 space-y-6">
              
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">Skill Props</h1>
                  <p className="text-muted-foreground">
                    Skill-based player statistics betting with real-time updates
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="hidden sm:flex">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <div className="text-right text-sm">
                    <div className="text-muted-foreground">Skill Props</div>
                    <div className="font-semibold text-primary">{props.length}</div>
                  </div>
                </div>
              </div>

              {/* Props Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-card/50 border border-border rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-muted rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <SkillStatsGrid
                  title="All Available Skill Props"
                  items={props}
                  type="prop"
                />
              )}

              {/* Load More Section */}
              {!loading && props.length > 0 && (
                <div className="flex justify-center pt-6">
                  <Button variant="outline" className="bg-card/50 border-border hover:bg-card/80">
                    Load More Skill Props
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!loading && props.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    No skill props available at the moment
                  </div>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Skill Props
                  </Button>
                </div>
              )}
              
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
    </>
  );
}