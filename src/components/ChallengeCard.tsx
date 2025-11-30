import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, DollarSign, Clock, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { matchApi } from "@/lib/api-client";
import { useState } from "react";

interface ChallengeCardProps {
  id?: string; // Match ID for backend integration
  player: {
    username: string;
    rating: number;
    avatar?: string;
    status: "online" | "offline" | "in-game";
    userId?: string; // User ID for profile navigation
  };
  game: string;
  platform: string;
  prizeRange: string;
  timePosted: string;
  onJoinSuccess?: () => void; // Callback for successful join
  onViewProfile?: (userId: string) => void; // Callback for viewing profile
}

const ChallengeCard = ({ id, player, game, platform, prizeRange, timePosted, onJoinSuccess, onViewProfile }: ChallengeCardProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-neon-cyan";
      case "in-game": return "bg-neon-orange";
      default: return "bg-muted-foreground";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 9) return "bg-neon-orange text-background";
    if (rating >= 7) return "bg-neon-purple text-background";
    return "bg-neon-cyan text-background";
  };

  const handleAcceptChallenge = async () => {
    if (!id) {
      toast({
        title: "Error",
        description: "Match ID not available. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      await matchApi.joinMatch(id);
      onJoinSuccess?.();
    } catch (error) {
      // Error handling is done in the API client
    } finally {
      setIsJoining(false);
    }
  };

  const handleViewProfile = () => {
    if (player.userId && onViewProfile) {
      onViewProfile(player.userId);
    } else {
      toast({
        title: "Player Profile",
        description: `Viewing ${player.username}'s profile`,
      });
    }
  };

  return (
    <div className="gaming-card p-6 rounded-xl group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Player Avatar */}
          <div className="relative">
            <Avatar className="w-12 h-12 neon-border">
              <AvatarImage src={player.avatar} alt={player.username} />
              <AvatarFallback className="bg-gradient-primary text-background font-bold">
                {player.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(player.status)}`} />
          </div>

          {/* Player Info */}
          <div>
            <div className="flex items-center space-x-2">
              <h3 
                className="font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={handleViewProfile}
              >
                {player.username}
              </h3>
              <Badge className={`px-2 py-1 text-xs font-bold ${getRatingColor(player.rating)}`}>
                {player.rating.toFixed(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{game} • {platform}</p>
          </div>
        </div>

        {/* Challenge Actions */}
        <div className="flex items-center space-x-4">
          {/* Prize */}
          <div className="text-right">
            <div className="flex items-center space-x-1 text-neon-cyan">
              <DollarSign className="w-4 h-4" />
              <span className="font-mono font-bold">{prizeRange}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{timePosted}</span>
            </div>
          </div>

          {/* Accept Button */}
          <Button 
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 group-hover:scale-105"
            onClick={handleAcceptChallenge}
            disabled={isJoining}
          >
            <Trophy className="w-4 h-4 mr-2" />
            {isJoining ? "Joining..." : "Accept"}
          </Button>
        </div>
      </div>

      {/* Game Details */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground">Rank Req:</span>
            <Badge variant="outline" className="border-neon-purple text-neon-purple">
              All Ranks
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-neon-orange" />
            <span className="text-muted-foreground">Quick Match</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;