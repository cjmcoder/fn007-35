import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, DollarSign, Bitcoin, Building2 } from "lucide-react";
import { EnhancedUSDCWithdrawalForm } from "@/components/payment/EnhancedUSDCWithdrawalForm";
import { toast } from "@/hooks/use-toast";

interface Balances {
  fc: number;
  boostCredits: number;
  fnc: number;
}

interface WithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances?: Balances;
}

const withdrawalTaglines = [
  "Play hard. Cash out fast.",
  "Turn skills into FC — and FC into rewards.",
  "Your grind. Your payout."
];

export const WithdrawalModal = ({ open, onOpenChange, balances }: WithdrawalModalProps) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % withdrawalTaglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleWithdrawal = () => {
    // Withdrawal logic now handled by USDCWithdrawalForm
    onOpenChange(false);
  };

  const handleWithdrawalSuccess = () => {
    toast({
      title: 'Withdrawal Initiated!',
      description: 'USDC will arrive in your wallet within 30 seconds',
    });
    onOpenChange(false);
  };

  const handleWithdrawalError = (message: string) => {
    toast({
      title: 'Withdrawal Failed',
      description: message,
      variant: 'destructive',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl">Cash Out Your Winnings</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Turn your FC victories into real rewards.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Display */}
          <Card className="p-4 bg-muted/30">
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Your Balances</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 bg-primary/10 border-primary/30">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Withdrawable FC</p>
                    <p className="text-xl font-bold text-primary">{balances?.fc || 0} FC</p>
                    <p className="text-xs text-primary">Ready to Cash Out</p>
                  </div>
                </Card>
                
                <Card className="p-3 bg-muted/50 border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Boost Credits</p>
                    <p className="text-lg font-medium text-muted-foreground">{balances?.boostCredits || 0} Credits</p>
                    <p className="text-xs text-muted-foreground">Play-Only Bonus</p>
                  </div>
                </Card>
              </div>
              
              <Card className="p-3 bg-accent/20 border-accent/30">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">FNC Rewards</p>
                  <p className="text-lg font-medium text-accent">{balances?.fnc || 0} FNC</p>
                  <p className="text-xs text-muted-foreground">Speculative crypto — not withdrawable</p>
                  <p className="text-xs text-muted-foreground">(future wallet support coming)</p>
                </div>
              </Card>
            </div>
          </Card>

          {/* Enhanced USDC Withdrawal Form */}
          <EnhancedUSDCWithdrawalForm
            currentFcBalance={balances?.fc || 0}
            onSuccess={handleWithdrawalSuccess}
            onError={handleWithdrawalError}
          />

          {/* Notice */}
          <Card className="p-3 bg-accent/10 border-accent/30">
            <p className="text-xs text-muted-foreground">
              Only FC earned from wins, tournaments, or leaderboard rewards is eligible for withdrawal. 
              Boost Credits are excluded. FNC tokens earned through performance rewards are speculative 
              and not withdrawable. Future wallet bridging will be announced.
            </p>
          </Card>

          {/* Hype Tagline */}
          <div className="text-center">
            <p className="text-sm font-medium text-primary italic transition-all duration-500">
              {withdrawalTaglines[taglineIndex]}
            </p>
          </div>

          {/* Withdrawal handled by USDCWithdrawalForm */}

          {/* Compliance */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>FC = platform credits for competitive play, withdrawable per policy.</p>
            <p>Boost Credits = promotional play-only funds, non-withdrawable.</p>
            <p>FNC = speculative crypto rewards, not guaranteed in value.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};