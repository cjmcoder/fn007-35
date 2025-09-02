import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, DollarSign, Clock, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ChallengeCardProps {
  player: {
    username: string;
    rating: number;
    avatar?: string;
    status: "online" | "offline" | "in-game";
  };
  game: string;
  platform: string;
  prizeRange: string;
  timePosted: string;
}

const ChallengeCard = ({ player, game, platform, prizeRange, timePosted }: ChallengeCardProps) => {
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

  const handleAcceptChallenge = () => {
    toast({
      title: "Challenge Accepted!",
      description: `You've accepted ${player.username}'s challenge for ${prizeRange}`,
    });
  };

  const handleViewProfile = () => {
    toast({
      title: "Player Profile",
      description: `Viewing ${player.username}'s profile`,
    });
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
          >
            <Trophy className="w-4 h-4 mr-2" />
            Accept
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