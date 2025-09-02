import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

const availableMatches = [
  {
    id: 1,
    player: "EliteGamer23",
    game: "Madden NFL 25",
    platform: "PS5",
    wager: "$15.00",
    skill: "Expert",
    timePosted: "2 min ago"
  },
  {
    id: 2,
    player: "ProPlayer88",
    game: "NBA 2K25",
    platform: "Xbox",
    wager: "$10.00",
    skill: "Advanced",
    timePosted: "5 min ago"
  },
  {
    id: 3,
    player: "ChampionZ",
    game: "Madden NFL 25",
    platform: "PC",
    wager: "$25.00",
    skill: "Master",
    timePosted: "8 min ago"
  }
];

export function FindMatches() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Find a Match</h2>
          <p className="text-sm text-muted-foreground">Browse available challenges and create your own</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-card/40 border-border">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by game, player, or platform..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Available Matches */}
      <div className="space-y-3">
        {availableMatches.map((match) => (
          <Card key={match.id} className="p-4 bg-card/40 border-border hover:bg-card/60 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>{match.player.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{match.player}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{match.game}</span>
                    <Badge variant="outline" className="text-xs">
                      {match.platform}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {match.skill}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-primary">{match.wager}</div>
                <div className="text-xs text-muted-foreground">{match.timePosted}</div>
                <Button size="sm" className="mt-2">
                  Accept Challenge
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card className="p-4 bg-card/40 border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">47</div>
            <div className="text-sm text-muted-foreground">Available Matches</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-neon-cyan">$1,250</div>
            <div className="text-sm text-muted-foreground">Total Prizes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-neon-orange">12</div>
            <div className="text-sm text-muted-foreground">Active Players</div>
          </div>
        </div>
      </Card>
    </div>
  );
}