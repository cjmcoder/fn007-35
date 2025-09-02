import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Medal } from "lucide-react";
import type { GameEvent } from "@/lib/types";

interface PayoutTableProps {
  event: GameEvent;
}

export function PayoutTable({ event }: PayoutTableProps) {
  // Generate payout structure based on event type and prize pool
  const generatePayouts = () => {
    const totalPrize = event.prizePool;
    const participants = event.maxParticipants;
    
    // Different payout structures based on tournament size
    if (participants <= 8) {
      return [
        { position: 1, percentage: 60, amount: Math.floor(totalPrize * 0.6), icon: Trophy },
        { position: 2, percentage: 30, amount: Math.floor(totalPrize * 0.3), icon: Award },
        { position: 3, percentage: 10, amount: Math.floor(totalPrize * 0.1), icon: Medal },
      ];
    } else if (participants <= 32) {
      return [
        { position: 1, percentage: 50, amount: Math.floor(totalPrize * 0.5), icon: Trophy },
        { position: 2, percentage: 25, amount: Math.floor(totalPrize * 0.25), icon: Award },
        { position: 3, percentage: 15, amount: Math.floor(totalPrize * 0.15), icon: Medal },
        { position: 4, percentage: 10, amount: Math.floor(totalPrize * 0.1), icon: Medal },
      ];
    } else {
      return [
        { position: 1, percentage: 40, amount: Math.floor(totalPrize * 0.4), icon: Trophy },
        { position: 2, percentage: 20, amount: Math.floor(totalPrize * 0.2), icon: Award },
        { position: 3, percentage: 15, amount: Math.floor(totalPrize * 0.15), icon: Medal },
        { position: 4, percentage: 10, amount: Math.floor(totalPrize * 0.1), icon: Medal },
        { position: 5, percentage: 8, amount: Math.floor(totalPrize * 0.08), icon: Medal },
        { position: 6, percentage: 7, amount: Math.floor(totalPrize * 0.07), icon: Medal },
      ];
    }
  };

  const payouts = generatePayouts();

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 2: return "bg-gray-400/20 text-gray-300 border-gray-400/30";
      case 3: return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const formatPosition = (position: number) => {
    if (position === 1) return "1st";
    if (position === 2) return "2nd";
    if (position === 3) return "3rd";
    return `${position}th`;
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Prize Distribution</h4>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            Total: {event.prizePool.toLocaleString()} FC
          </Badge>
        </div>
        
        <div className="space-y-3">
          {payouts.map((payout) => {
            const Icon = payout.icon;
            return (
              <div 
                key={payout.position}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <div>
                    <Badge className={getPositionColor(payout.position)}>
                      {formatPosition(payout.position)} Place
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-primary">
                    {payout.amount.toLocaleString()} FC
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {payout.percentage}% of prize pool
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4 bg-card/50">
        <h5 className="font-medium mb-2">Payout Information</h5>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>• Prizes are automatically distributed upon tournament completion</div>
          <div>• FC will be credited to your wallet within 5 minutes</div>
          <div>• All payouts are subject to verification and fair play review</div>
          <div>• Disputes must be filed within 24 hours of tournament end</div>
        </div>
      </Card>
    </div>
  );
}