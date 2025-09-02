import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Star, Trophy, Shield } from "lucide-react";
import type { GameEvent } from "@/lib/types";

interface ParticipantsListProps {
  event: GameEvent;
}

// Mock participants data
const generateParticipants = (count: number) => {
  const names = [
    "ProGamer2024", "SkillMaster", "ChampionX", "ElitePlayer", "GameWizard",
    "VictorySeeker", "TourneyKing", "CompetePro", "DigitalAce", "GameLegend",
    "PixelWarrior", "CyberChamp", "GameTitan", "VirtualHero", "EsportsStar"
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `participant-${i}`,
    name: names[i % names.length] + (i > names.length - 1 ? (i + 1) : ""),
    rating: Math.floor(Math.random() * 500) + 1500,
    rank: Math.floor(Math.random() * 10) + 1,
    gamesPlayed: Math.floor(Math.random() * 200) + 50,
    winRate: Math.floor(Math.random() * 40) + 60,
    isVerified: Math.random() > 0.7,
    joinedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

export function ParticipantsList({ event }: ParticipantsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const participants = generateParticipants(event.currentParticipants);

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 1800) return "text-yellow-400";
    if (rating >= 1600) return "text-purple-400";
    if (rating >= 1400) return "text-blue-400";
    return "text-gray-400";
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 1800) return { label: "Elite", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
    if (rating >= 1600) return { label: "Pro", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
    if (rating >= 1400) return { label: "Advanced", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    return { label: "Rookie", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
  };

  return (
    <div className="space-y-4">
      
      {/* Search */}
      <Card className="p-4 bg-card/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-3 bg-card/50 text-center">
          <div className="font-bold text-primary">{event.currentParticipants}</div>
          <div className="text-xs text-muted-foreground">Registered</div>
        </Card>
        <Card className="p-3 bg-card/50 text-center">
          <div className="font-bold text-orange-400">{event.maxParticipants - event.currentParticipants}</div>
          <div className="text-xs text-muted-foreground">Available</div>
        </Card>
        <Card className="p-3 bg-card/50 text-center">
          <div className="font-bold text-green-400">
            {participants.filter(p => p.isVerified).length}
          </div>
          <div className="text-xs text-muted-foreground">Verified</div>
        </Card>
      </div>

      {/* Participants List */}
      <Card className="bg-card/50">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            {filteredParticipants.length > 0 ? (
              filteredParticipants.map((participant, index) => {
                const ratingBadge = getRatingBadge(participant.rating);
                return (
                  <div 
                    key={participant.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border hover:bg-background/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground w-6">
                          #{index + 1}
                        </span>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.name}`} />
                          <AvatarFallback>{participant.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{participant.name}</span>
                          {participant.isVerified && (
                            <Shield className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Rank #{participant.rank}</span>
                          <span>•</span>
                          <span>{participant.gamesPlayed} games</span>
                          <span>•</span>
                          <span>{participant.winRate}% win rate</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={ratingBadge.className}>
                          {ratingBadge.label}
                        </Badge>
                      </div>
                      <div className={`font-mono font-bold ${getRatingColor(participant.rating)}`}>
                        {participant.rating}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No participants found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Registration Status */}
      <Card className="p-4 bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium">Registration Status</h5>
            <p className="text-sm text-muted-foreground">
              {event.maxParticipants - event.currentParticipants} spots remaining
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {Math.round((event.currentParticipants / event.maxParticipants) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Full</div>
          </div>
        </div>
      </Card>

    </div>
  );
}