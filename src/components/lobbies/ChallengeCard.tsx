import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, DollarSign, Clock, Star, Eye, Video, Crown, Shield, Zap, Lock, Wifi, MapPin, TrendingUp } from "lucide-react";
import { Challenge } from "@/lib/types";
import { formatFC, calculateFee } from "@/lib/fncMath";
import { SkillStatsModal } from "@/components/modals/SkillStatsModal";
import { useState } from "react";

interface ChallengeCardProps {
  challenge: Challenge;
  onAccept?: (challenge: Challenge) => void;
  onView?: (challenge: Challenge) => void;
}

export const ChallengeCard = ({ challenge, onAccept, onView }: ChallengeCardProps) => {
  const [skillStatsModalOpen, setSkillStatsModalOpen] = useState(false);
  const getRatingColor = (rating: number) => {
    if (rating >= 9) return "bg-neon-orange text-background";
    if (rating >= 7) return "bg-neon-purple text-background";
    return "bg-neon-cyan text-background";
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Elite': return "border-neon-orange text-neon-orange";
      case 'Pro': return "border-neon-purple text-neon-purple";
      default: return "border-neon-cyan text-neon-cyan";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "PS5":
        return "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30";
      case "Xbox":
        return "bg-neon-orange/20 text-neon-orange border-neon-orange/30";
      case "PC":
        return "bg-neon-purple/20 text-neon-purple border-neon-purple/30";
      case "Switch":
        return "bg-muted/50 text-foreground/80";
      default:
        return "bg-muted/50 text-muted-foreground";
    }
  };

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'tier1':
        return {
          name: 'Tier 1',
          icon: Zap,
          badgeClass: 'bg-green-500/20 text-green-400 border-green-500/30',
          borderClass: 'border-green-500/30 shadow-green-500/20',
          glowClass: 'group-hover:shadow-green-500/30',
          tooltip: 'Standard community matches under 25 FC entry.',
          description: 'Basic Quick Match'
        };
      case 'tier2':
        return {
          name: 'Tier 2',
          icon: Shield,
          badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          borderClass: 'border-yellow-500/30 shadow-yellow-500/20',
          glowClass: 'group-hover:shadow-yellow-500/30',
          tooltip: 'Private server required. 25+ FC entry, added fairness & monitoring.',
          description: 'Private Server Match'
        };
      case 'vip':
        return {
          name: 'VIP Server',
          icon: Crown,
          badgeClass: 'bg-gradient-to-r from-red-500/20 to-purple-500/20 text-red-400 border-red-500/30',
          borderClass: 'border-red-500/30 shadow-red-500/20',
          glowClass: 'group-hover:shadow-red-500/30',
          tooltip: 'Exclusive high-stakes arena. Invite-only or rank-based.',
          description: 'High Stakes Arena'
        };
      default:
        return getTierConfig('tier1');
    }
  };

  const getTrustScoreColor = (score: string) => {
    switch (score) {
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'red': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const tier = getTierConfig(challenge.tier);
  const TierIcon = tier.icon;
  const fee = calculateFee(challenge.entryFC);
  const netPayout = challenge.payoutFC - fee;
  const timeAgo = new Date(challenge.createdAt).toLocaleTimeString();
  const isHighStakes = challenge.entryFC >= 100;

  return (
    <TooltipProvider>
      <div className={`gaming-card p-6 rounded-xl group hover:shadow-glow transition-all duration-300 border-2 ${tier.borderClass} ${tier.glowClass} relative overflow-hidden`}>
        {/* Tier Badge - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <Tooltip>
            <TooltipTrigger>
              <Badge className={`px-3 py-1 text-xs font-bold ${tier.badgeClass} animate-fade-in`}>
                <TierIcon className="w-3 h-3 mr-1" />
                {tier.name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{tier.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Content - offset for tier badge */}
        <div className="mt-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4 flex-1">
              {/* Creator Avatar */}
              <div className="relative">
                <Avatar className="w-12 h-12 neon-border">
                  <AvatarImage src={challenge.creator.avatarUrl} alt={challenge.creator.name} />
                  <AvatarFallback className="bg-gradient-primary text-background font-bold">
                    {challenge.creator.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Trust Score Indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getTrustScoreColor(challenge.trustScore)}`}>
                  <div className="w-full h-full rounded-full bg-current opacity-80"></div>
                </div>
              </div>

              {/* Challenge Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-bold text-foreground truncate">{challenge.creator.name}</h3>
                  <Badge className={`px-2 py-1 text-xs font-bold ${getRatingColor(challenge.creator.rating)}`}>
                    {challenge.creator.rating.toFixed(1)}
                  </Badge>
                  {challenge.winStreak > 0 && (
                    <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30 text-xs">
                      {challenge.winStreak} Win Streak
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-primary mb-2 truncate">{challenge.title}</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getPlatformColor(challenge.platform)}>
                    {challenge.platform}
                  </Badge>
                  <Badge variant="outline" className={getRankColor(challenge.rank)}>
                    {challenge.rank}
                  </Badge>
                  <Badge className="bg-muted/30 text-muted-foreground text-xs">
                    {tier.description}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Entry & Payout - Enhanced Display */}
            <div className="w-full md:w-auto text-left md:text-right bg-muted/10 rounded-lg p-4 border border-border/50">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Entry</div>
                  <div className="font-mono font-bold text-lg text-foreground">
                    {formatFC(challenge.entryFC)} FC
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Platform Fee</div>
                  <div className="font-mono text-sm text-muted-foreground">
                    {formatFC(fee)} FC ({Math.round((fee / challenge.entryFC) * 100)}%)
                  </div>
                </div>
                <div className="border-t border-border/30 pt-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Winner Payout</div>
                  <div className={`font-mono font-bold text-xl ${isHighStakes ? 'text-neon-orange animate-pulse' : 'text-neon-cyan'}`}>
                    {formatFC(netPayout)} FC
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Challenge Details & Skills Stats */}
          <div className="mb-4 p-3 bg-muted/20 rounded-lg border border-border/30">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm text-muted-foreground font-medium">Arena Rules:</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSkillStatsModalOpen(true)}
                className="text-primary hover:text-primary-foreground hover:bg-primary/20 transition-all duration-200 flex items-center gap-1 px-2 py-1 h-auto"
              >
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs">View Stats</span>
              </Button>
            </div>
            <p className="text-sm whitespace-pre-line text-foreground/90">{challenge.rules}</p>
          </div>

          {/* Stream Required Banner for Tier 2+ */}
          {(challenge.tier === 'tier2' || challenge.tier === 'vip') && (
            <div className="mb-4 p-3 bg-neon-orange/10 border border-neon-orange/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-neon-orange" />
                <span className="text-sm font-medium text-neon-orange">Stream Required – Include MatchID in Title</span>
              </div>
              <p className="text-xs text-neon-orange/80 mt-1">
                Payouts verified via stream/VOD. Auto-tag: "Verified by Stream/VOD"
              </p>
            </div>
          )}

          {/* Footer - Region, Trust Score, Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Posted {timeAgo}</span>
              </div>
              
              {challenge.region && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{challenge.region}</span>
                  <Wifi className="w-3 h-3 text-green-400" />
                </div>
              )}

              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getTrustScoreColor(challenge.trustScore)} bg-current`}></div>
                    <span className="text-xs">Trust Score</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    {challenge.trustScore === 'green' && 'Excellent reputation'}
                    {challenge.trustScore === 'yellow' && 'Good reputation'} 
                    {challenge.trustScore === 'red' && 'Caution advised'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onView?.(challenge)}
                className="border-border hover:bg-muted/50 transition-all duration-200"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
              
              {challenge.isLocked ? (
                <Tooltip>
                  <TooltipTrigger>
                    <Button 
                      className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                      disabled
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Locked
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">{challenge.lockReason || 'Requirements not met'}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button 
                  className={`transition-all duration-300 ${tier.name === 'VIP Server' 
                    ? 'bg-gradient-to-r from-red-500 to-purple-500 hover:shadow-red-500/50' 
                    : 'bg-gradient-primary hover:shadow-glow'
                  }`}
                  onClick={() => onAccept?.(challenge)}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Accept Challenge
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Skill Stats Modal */}
        <SkillStatsModal
          open={skillStatsModalOpen}
          onOpenChange={setSkillStatsModalOpen}
          data={challenge}
          type="challenge"
        />
      </div>
    </TooltipProvider>
  );
};