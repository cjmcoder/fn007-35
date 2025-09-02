import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Trophy, Users, Gamepad2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { GameEvent } from "@/lib/types";

interface EventCardProps {
  event: GameEvent;
  onJoin: (event: GameEvent) => void;
  onViewDetails: (event: GameEvent) => void;
}

export function EventCard({ event, onJoin, onViewDetails }: EventCardProps) {
  const getStatusBadge = () => {
    switch (event.status) {
      case 'live':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">LIVE</Badge>;
      case 'full':
        return <Badge variant="secondary">FULL</Badge>;
      case 'completed':
        return <Badge variant="outline">COMPLETED</Badge>;
      default:
        return null;
    }
  };

  const getPlatformIcon = (platform: string) => {
    // Return appropriate platform icon/text
    return <span className="text-xs font-medium">{platform}</span>;
  };

  const getFormatBadge = (format: string) => {
    const colors = {
      '1v1': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Bracket': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Swiss': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Leaderboard': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    
    return (
      <Badge className={colors[format as keyof typeof colors] || 'bg-gray-500/20 text-gray-400'}>
        {format}
      </Badge>
    );
  };

  const fillPercentage = (event.currentParticipants / event.maxParticipants) * 100;
  const isJoinable = event.status === 'open' && event.currentParticipants < event.maxParticipants;

  return (
    <div className="gaming-card rounded-2xl p-4 space-y-4 transition-all duration-300 hover:scale-[1.02]">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight">{event.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Gamepad2 className="w-4 h-4" />
              <span>{event.game}</span>
              <span>•</span>
              {getPlatformIcon(event.platform)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {event.verified && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                VERIFIED
              </Badge>
            )}
            {getStatusBadge()}
          </div>
        </div>

        {/* Event Banner/Thumbnail placeholder */}
        <div className="h-24 bg-gradient-primary/10 rounded-lg flex items-center justify-center">
          <Trophy className="w-8 h-8 text-primary/60" />
        </div>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(event.startTime), 'MMM d, HH:mm')}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{event.duration}</span>
        </div>
      </div>

      {/* Prize & Entry */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Prize Pool</span>
          <span className="font-bold text-primary">{event.prizePool.toLocaleString()} FC</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Entry</span>
          <span className="font-mono font-semibold">{event.entryFee} FC</span>
        </div>
      </div>

      {/* Capacity */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Participants</span>
          <span className="font-medium">
            {event.currentParticipants}/{event.maxParticipants}
          </span>
        </div>
        <Progress value={fillPercentage} className="h-2" />
      </div>

      {/* Format */}
      <div className="flex items-center justify-between">
        {getFormatBadge(event.format)}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{event.maxParticipants} slots</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetails(event)}
        >
          View Details
        </Button>
        <Button
          size="sm"
          className={cn(
            "flex-1",
            isJoinable 
              ? "bg-gradient-primary hover:opacity-90" 
              : "opacity-50 cursor-not-allowed"
          )}
          disabled={!isJoinable}
          onClick={() => isJoinable && onJoin(event)}
        >
          {event.status === 'full' ? 'Full' : 
           event.status === 'live' ? 'Live' : 
           event.isJoined ? 'Joined' : 'Join'}
        </Button>
      </div>
    </div>
  );
}