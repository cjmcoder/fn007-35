import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, DollarSign, Bitcoin, Building2 } from "lucide-react";

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
    // Handle withdrawal logic
    onOpenChange(false);
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

          {/* Withdrawal Amount */}
          <div className="space-y-2">
            <Label htmlFor="withdrawal-amount">Withdrawal Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="withdrawal-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 bg-muted/50"
                max={balances?.fc || 0}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum withdrawal: {balances?.fc || 0} FC
            </p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <Label>Cash Out Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue placeholder="Choose cash out method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Cash Out to PayPal</span>
                  </div>
                </SelectItem>
                <SelectItem value="crypto">
                  <div className="flex items-center space-x-2">
                    <Bitcoin className="w-4 h-4" />
                    <span>Send to Crypto Wallet</span>
                  </div>
                </SelectItem>
                <SelectItem value="bank">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>Bank Transfer</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Confirmation */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="confirm-withdrawal"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked as boolean)}
            />
            <Label htmlFor="confirm-withdrawal" className="text-sm">
              I understand Boost Credits and FNC cannot be withdrawn.
            </Label>
          </div>

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

          {/* Action Button */}
          <Button 
            onClick={handleWithdrawal}
            disabled={!amount || !paymentMethod || !confirmed}
            className="w-full bg-gradient-primary hover:opacity-80 text-base py-6"
          >
            Cash Out Now
          </Button>

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