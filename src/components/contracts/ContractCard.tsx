import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Gamepad2, Trophy, Timer, Info } from "lucide-react";
import { useState } from "react";

interface ContractCardProps {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  rewards: {
    xp?: number;
    fnc?: number;
    boosts?: number;
    fc?: number;
  };
  multipliers?: {
    mmr?: boolean;
    verification?: boolean;
    diversity?: boolean;
  };
  verificationBadges?: readonly ("Private Server" | "Stream VOD" | "Verified Opponent")[];
  repeatGroup?: "play" | "watch" | "win" | "diversity";
  timeLimit: "Daily" | "Weekly" | "Seasonal";
  state: "locked" | "available" | "active" | "claimed" | "cooldown";
  progress: {
    current: number;
    target: number;
  };
  cta: "Activate" | "Track" | "Claim";
  disabledReason?: string;
  lowBudget?: boolean;
}

const getIcon = (repeatGroup?: string) => {
  switch (repeatGroup) {
    case "play":
      return <Gamepad2 className="h-5 w-5" />;
    case "win":
      return <Trophy className="h-5 w-5" />;
    case "watch":
      return <Timer className="h-5 w-5" />;
    default:
      return <Gamepad2 className="h-5 w-5" />;
  }
};

const getRewardChipColor = (type: string) => {
  switch (type) {
    case "xp":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "fnc":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "boosts":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "fc":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function ContractCard(props: ContractCardProps) {
  const [isActive, setIsActive] = useState(props.state === "active");
  
  const progressPercent = (props.progress.current / props.progress.target) * 100;
  const isCompleted = props.progress.current >= props.progress.target;
  const canClaim = isCompleted && isActive;
  
  const handleAction = () => {
    if (props.cta === "Activate") {
      setIsActive(true);
    } else if (props.cta === "Claim") {
      setIsActive(false);
    }
  };

  const currentCta = canClaim ? "Claim" : (isActive ? "Track" : props.cta);
  const isDisabled = props.state === "locked" || props.state === "cooldown";

  return (
    <Card 
      className={`p-4 space-y-4 ${isActive ? 'ring-2 ring-primary/20 bg-primary/5' : ''} ${isDisabled ? 'opacity-50' : ''}`}
      data-testid={`contract-card-${props.id}`}
    >
      {/* Low Budget Warning */}
      {props.lowBudget && props.rewards.fc && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-sm text-amber-400">
          FC budget low—this reward will convert to a Boost Credit (1x) if budget depletes.
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted text-muted-foreground">
          {getIcon(props.repeatGroup)}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-foreground">{props.title}</h3>
            <Badge variant="outline" className="text-xs">
              {props.timeLimit}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">{props.description}</p>
          
          {/* Verification Badges */}
          {props.verificationBadges && props.verificationBadges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {props.verificationBadges.map((badge) => (
                <Badge key={badge} variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rewards */}
      <div className="flex flex-wrap gap-2">
        {props.rewards.xp && (
          <div className={`px-2 py-1 rounded-full text-xs border ${getRewardChipColor('xp')}`} data-testid="reward-chip-xp">
            +{props.rewards.xp} XP
          </div>
        )}
        {props.rewards.fnc && (
          <div className={`px-2 py-1 rounded-full text-xs border ${getRewardChipColor('fnc')}`} data-testid="reward-chip-fnc">
            +{props.rewards.fnc} FNC
          </div>
        )}
        {props.rewards.boosts && (
          <div className={`px-2 py-1 rounded-full text-xs border ${getRewardChipColor('boosts')}`} data-testid="reward-chip-boost">
            +{props.rewards.boosts} Boost
          </div>
        )}
        {props.rewards.fc && !props.lowBudget && (
          <div className={`px-2 py-1 rounded-full text-xs border ${getRewardChipColor('fc')}`} data-testid="reward-chip-fc">
            Rare FC +{props.rewards.fc}
          </div>
        )}
        {props.rewards.fc && props.lowBudget && (
          <div className={`px-2 py-1 rounded-full text-xs border ${getRewardChipColor('boosts')}`} data-testid="reward-chip-boost">
            +1 Boost
          </div>
        )}
      </div>

      {/* Multipliers */}
      {props.multipliers && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span>
                    {props.multipliers.mmr && "MMR +0.1"}{props.multipliers.mmr && (props.multipliers.verification || props.multipliers.diversity) && ", "}
                    {props.multipliers.verification && "Verified +0.1"}{props.multipliers.verification && props.multipliers.diversity && ", "}
                    {props.multipliers.diversity && "Diversity +0.1"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bonus multipliers for verified play and skill diversity</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground">{props.progress.current}/{props.progress.target}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Action Button */}
      <div className="pt-2">
        {isDisabled && props.disabledReason ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full" disabled>
                  {props.disabledReason}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{props.disabledReason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button 
            variant={canClaim ? "default" : (isActive ? "outline" : "default")}
            className="w-full"
            onClick={handleAction}
            data-testid={`${currentCta?.toLowerCase() || 'action'}-btn`}
          >
            {currentCta}
          </Button>
        )}
      </div>
    </Card>
  );
}