import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Clock, DollarSign, GamepadIcon, Filter } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { LeftNav } from "@/components/layout/LeftNav";
import { SquawkboxComponent } from "@/components/common/SquawkboxComponent";
import { useUI } from "@/store/useUI";

const myTournaments = [
  {
    id: 1,
    title: "Madden NFL 25 MUT",
    platform: "PS4",
    game: "Madden NFL 25",
    entryFee: 5.50,
    seats: "2 (1 Left)",
    prizes: 10.00,
    status: "active",
    thumbnail: "/lovable-uploads/934bd6df-9bca-4fb1-8eed-c03afc3fa032.png"
  },
  {
    id: 2,
    title: "Madden NFL 25 MUT",
    platform: "XB1",
    game: "Madden NFL 25",
    entryFee: 11.00,
    seats: "2",
    prizes: 20.00,
    status: "completed",
    thumbnail: "/lovable-uploads/934bd6df-9bca-4fb1-8eed-c03afc3fa032.png"
  },
  {
    id: 3,
    title: "Madden NFL 25 Ultimate Team",
    platform: "PS5",
    game: "Madden NFL 25",
    entryFee: 3.50,
    seats: "4",
    prizes: 10.00,
    status: "upcoming",
    thumbnail: "/lovable-uploads/934bd6df-9bca-4fb1-8eed-c03afc3fa032.png"
  }
];

export default function MyTournaments() {
  const { leftNavOpen } = useUI();
  const [selectedConsole, setSelectedConsole] = useState("all");
  const [selectedGame, setSelectedGame] = useState("all");
  const [activeTab, setActiveTab] = useState("active");

  const filteredTournaments = myTournaments.filter(tournament => {
    if (activeTab === "active" && tournament.status !== "active") return false;
    if (activeTab === "completed" && tournament.status !== "completed") return false;
    if (activeTab === "upcoming" && tournament.status !== "upcoming") return false;
    return true;
  });

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "PS4":
      case "PS5":
        return "bg-blue-600";
      case "XB1":
      case "XBX":
        return "bg-green-600";
      default:
        return "bg-accent";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-neon-primary text-neon-primary-foreground";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "upcoming":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="flex">
        <LeftNav />
        
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${leftNavOpen ? 'ml-64' : 'ml-16'}`}>
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                <span className="text-primary">TOURNAMENTS</span>
                <span>&gt;</span>
                <span>ALL</span>
                <span>TEAM</span>
                <span>FREE</span>
                <span>ONGOING</span>
                <span className="text-primary font-semibold">MY TOURNAMENTS</span>
                <span>HISTORY</span>
              </div>
              
              <h1 className="text-3xl font-bold gradient-text mb-4">My Tournaments</h1>
              
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <Select value={selectedConsole} onValueChange={setSelectedConsole}>
                  <SelectTrigger className="w-48 gaming-card">
                    <SelectValue placeholder="All Consoles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Consoles</SelectItem>
                    <SelectItem value="ps4">PlayStation 4</SelectItem>
                    <SelectItem value="ps5">PlayStation 5</SelectItem>
                    <SelectItem value="xbox">Xbox</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedGame} onValueChange={setSelectedGame}>
                  <SelectTrigger className="w-64 gaming-card">
                    <SelectValue placeholder="All Games" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    <SelectItem value="all">All Games</SelectItem>
                    <SelectItem value="cod-black-ops-6">Call of Duty: Black Ops 6</SelectItem>
                    <SelectItem value="cod-warzone">Call of Duty: Warzone 3.0</SelectItem>
                    <SelectItem value="cs-go">Counter-Strike: Global Offensive</SelectItem>
                    <SelectItem value="ea-sports-fc-25">EA SPORTS FC™ 25</SelectItem>
                    <SelectItem value="ea-college-football-26">EA Sports College Football 26</SelectItem>
                    <SelectItem value="fortnite">Fortnite</SelectItem>
                    <SelectItem value="mlb-show-25">MLB The Show 25</SelectItem>
                    <SelectItem value="madden-nfl-25">Madden NFL 25</SelectItem>
                    <SelectItem value="madden-nfl-26">Madden NFL 26</SelectItem>
                    <SelectItem value="mortal-kombat-1">Mortal Kombat 1</SelectItem>
                    <SelectItem value="nba-2k25">NBA 2K25</SelectItem>
                    <SelectItem value="nhl-25">NHL 25</SelectItem>
                    <SelectItem value="pga-tour-2k25">PGA Tour 2K25</SelectItem>
                    <SelectItem value="rocket-league">Rocket League</SelectItem>
                    <SelectItem value="ufc-5">UFC 5</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" className="gaming-card">
                  <Filter className="w-4 h-4 mr-2" />
                  show all
                </Button>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="gaming-card">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex gap-6">
              {/* Tournament List */}
              <div className="flex-1 space-y-4">
                {filteredTournaments.map((tournament) => (
                  <Card key={tournament.id} className="gaming-card hover:border-primary/50 transition-all duration-300">
                    <div className="flex items-center p-4">
                      {/* Tournament Image */}
                      <div className="relative w-20 h-20 mr-4">
                        <img
                          src={tournament.thumbnail}
                          alt={tournament.game}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Badge className={`absolute top-1 right-1 text-xs ${getPlatformColor(tournament.platform)}`}>
                          {tournament.platform}
                        </Badge>
                      </div>

                      {/* Tournament Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-primary mb-1">
                              {tournament.title} <span className="text-sm text-muted-foreground">{tournament.platform}</span>
                            </h3>
                            <p className="text-sm text-muted-foreground">Begins When Full</p>
                            <p className="text-sm text-muted-foreground">
                              Entry Fee: ${tournament.entryFee.toFixed(2)} | Seats: {tournament.seats}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-semibold text-foreground mb-2">
                              Prizes: ${tournament.prizes.toFixed(2)}
                            </div>
                            <Badge className={getStatusColor(tournament.status)}>
                              {tournament.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="ml-4">
                        {tournament.status === "active" && (
                          <Button className="bg-gradient-primary hover:opacity-80 px-8 py-2">
                            VIEW MATCH
                          </Button>
                        )}
                        {tournament.status === "upcoming" && (
                          <Button variant="outline" className="gaming-card px-8 py-2">
                            WAITING
                          </Button>
                        )}
                        {tournament.status === "completed" && (
                          <Button variant="secondary" className="px-8 py-2">
                            VIEW RESULTS
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* SQUAWKBOX Sidebar */}
              <div className="w-80">
                <SquawkboxComponent variant="embedded" height="600px" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}