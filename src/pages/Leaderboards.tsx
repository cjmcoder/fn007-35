import React, { useEffect, useMemo, useState } from "react";
import { Seo } from "@/components/Seo";
import { TopNav } from "@/components/layout/TopNav";
import { LeftNav } from "@/components/layout/LeftNav";
import { RightSquawkbox } from "@/components/layout/RightSquawkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillStatsGrid } from "@/components/common/SkillStatsGrid";
import { cn } from "@/lib/utils";
import type { GameTitle, Platform } from "@/lib/types";
import { Link } from "react-router-dom";
import { Home, Target, MessageSquare } from "lucide-react";
import { FlockTubeClock } from "@/components/FlockTubeClock";
import { calculateLeaderboardRewards } from "@/lib/fncMath";
import { useUI } from "@/store/useUI";
// Removed mock data import - fetch from real API instead

const allGames: GameTitle[] = [
  "Madden","UFC","FIFA","NHL","NBA","UNDISPUTED","F1","TENNIS","MLB","CustomUnity"
];
const allPlatforms: Platform[] = ["PS5","Xbox","PC","Switch"];

type PlayerRow = {
  id: string;
  name: string;
  rating: number;
  winRate: number;
  gamesPlayed: number;
  avatarUrl?: string;
  platform: Platform;
  game: GameTitle;
  fcRewards: number;
};

const samplePlayers: PlayerRow[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `p-${i+1}`,
  name: `Player_${i+1}`,
  rating: Math.round(900 + Math.random()*900),
  winRate: Math.round(45 + Math.random()*55),
  gamesPlayed: Math.round(50 + Math.random()*500),
  avatarUrl: undefined,
  platform: allPlatforms[i % allPlatforms.length],
  game: allGames[i % allGames.length],
  fcRewards: calculateLeaderboardRewards(i + 1), // Top 15 get rewards, rest get 0
})).sort((a, b) => b.rating - a.rating);

const usePageSEO = (title: string, description: string, path = "/leaderboards") => {
  useEffect(() => {
    document.title = title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", description);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = description;
      document.head.appendChild(m);
    }
    const canonicalHref = `${window.location.origin}${path}`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalHref;
  }, [title, description, path]);
};

const rankBadge = (rank: number) => {
  if (rank === 1) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (rank === 2) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  if (rank === 3) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  return "bg-primary/15 text-primary border-primary/30";
};

const Leaderboards: React.FC = () => {
  const { rightRailOpen, setRightRailOpen } = useUI();
  // TODO: Fetch real challenges from backend API
  const [challenges, setChallenges] = useState<any[]>([]);
  useEffect(() => {
    // TODO: Replace with real endpoint when available
    // fetch('/api/challenges').then(r => r.json()).then(d => setChallenges(d.challenges || []));
    setChallenges([]); // Empty until backend endpoint is ready
  }, []);
  
  usePageSEO(
    "Leaderboards | FLOCKNODE",
    "Explore global and game-specific leaderboards on FLOCKNODE. See top players, ratings, and win rates across all platforms.",
    "/leaderboards"
  );

  const [game, setGame] = useState<GameTitle | "All">("All");
  const [platform, setPlatform] = useState<Platform | "All">("All");
  const [scope, setScope] = useState<"Global" | "Regional" | "Friends">("Global");
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<'weekly' | 'all-time' | 'stats'>('weekly');

  const filtered = useMemo(() => {
    return samplePlayers
      .filter(p => (game === "All" ? true : p.game === game))
      .filter(p => (platform === "All" ? true : p.platform === platform))
      .filter(p => (q ? (p.name || '').toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a,b) => b.rating - a.rating)
      .slice(0, 100);
  }, [game, platform, q]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Seo
        title="Leaderboards - Skill Rankings & Player Stats"
        description="View top player rankings, skill statistics, and performance metrics across all games and platforms."
        canonicalUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      
      <TopNav />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-3">
                  <h1 className="text-3xl font-bold gradient-text">Leaderboards</h1>
                  <FlockTubeClock />
                </div>
                <p className="text-muted-foreground mt-1">
                  Track top performers by game, platform, and skill metrics
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild aria-label="Go to homepage">
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Link>
                </Button>
                <Tabs value={scope} onValueChange={(v) => setScope(v as any)}>
                  <TabsList>
                    <TabsTrigger value="Global">Global</TabsTrigger>
                    <TabsTrigger value="Regional">Regional</TabsTrigger>
                    <TabsTrigger value="Friends">Friends</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(['weekly', 'all-time', 'stats'] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab)}
                  className="capitalize flex items-center gap-2"
                >
                  {tab === 'stats' && <Target className="w-4 h-4" />}
                  {tab === 'stats' ? 'Player Stats' : tab.replace('-', ' ')}
                </Button>
              ))}
            </div>

            {/* Stats Tab Content */}
            {activeTab === 'stats' ? (
              <div className="space-y-6">
                <Card className="p-6 text-center bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
                  <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h2 className="text-xl font-bold mb-2">Player Statistics Leaderboard</h2>
                  <p className="text-muted-foreground mb-4">
                    Track top players across different skill metrics and game-specific stats
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">Accuracy Rating</Badge>
                    <Badge variant="outline">Win Rate</Badge>
                    <Badge variant="outline">Performance Score</Badge>
                    <Badge variant="outline">Consistency Index</Badge>
                  </div>
                </Card>

                <SkillStatsGrid
                  title="Top Player Skill Challenges"
                  items={challenges.slice(0, 6)}
                  type="challenge"
                  className="mb-6"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Filters */}
                <section aria-labelledby="filters">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs mb-1 text-muted-foreground">Game</label>
                      <Select value={game} onValueChange={(v) => setGame(v as any)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select game" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="All">All</SelectItem>
                            {allGames.map(g => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-muted-foreground">Platform</label>
                      <Select value={platform} onValueChange={(v) => setPlatform(v as any)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="All">All</SelectItem>
                            {allPlatforms.map(p => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs mb-1 text-muted-foreground">Search players</label>
                      <div className="flex gap-2">
                        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by player name" />
                        <Button variant="secondary" onClick={() => setQ("")}>Clear</Button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Leaderboard */}
                <section aria-labelledby="leaderboard-list">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Top Players {game !== "All" && (
                          <span className="text-muted-foreground">— {game}</span>
                        )} {platform !== "All" && (
                          <span className="text-muted-foreground">· {platform}</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="divide-y divide-border">
                        {filtered.map((p, idx) => (
                          <li key={p.id} className="py-3 flex items-center gap-3">
                            <Badge className={cn("shrink-0", rankBadge(idx+1))}>#{idx+1}</Badge>
                            <Avatar>
                              <AvatarImage src={p.avatarUrl || ""} alt={`${p.name} avatar`} loading="lazy" />
                              <AvatarFallback>{p.name.slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{p.name}</span>
                                <Badge variant="outline">{p.platform}</Badge>
                                <Badge variant="outline">{p.game}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">{p.gamesPlayed} games · {p.winRate}% WR</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="font-mono font-semibold text-primary">{p.fcRewards}</div>
                                <div className="text-xs text-muted-foreground">FC Earned</div>
                              </div>
                              <div className="text-center">
                                <div className="font-mono font-semibold">{p.rating}</div>
                                <div className="text-xs text-muted-foreground">Rating</div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </section>
              </div>
            )}
          </div>
        </main>
        
        <RightSquawkbox />
      </div>

      {/* Mobile Chat Toggle */}
      <Button
        className="fixed bottom-4 right-4 md:hidden z-30 bg-gradient-primary shadow-glow"
        onClick={() => setRightRailOpen(!rightRailOpen)}
      >
        <MessageSquare className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Leaderboards;