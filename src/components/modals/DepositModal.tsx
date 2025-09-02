import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, Bitcoin } from "lucide-react";

interface Balances {
  fc: number;
  boostCredits: number;
  fnc: number;
}

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances?: Balances;
}

const depositTaglines = [
  "Stack wins, stack FC.",
  "Fuel your arena, power your play.",
  "More credits. More clashes. More glory."
];

export const DepositModal = ({ open, onOpenChange, balances }: DepositModalProps) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % depositTaglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const presetAmounts = [
    { value: 25, bonus: 50, label: "+50% Bonus Play" },
    { value: 50, bonus: 100, label: "Double Your Play" },
    { value: 100, bonus: 200, label: "Triple Up Bonus" }
  ];

  const handleDeposit = () => {
    // Handle deposit logic
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl">Load Up Your FC</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Fuel your matches, tournaments, and leaderboards with FC credits.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preset Amounts */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Amount</Label>
            <div className="grid grid-cols-1 gap-2">
              {presetAmounts.map((preset) => (
                <Card 
                  key={preset.value}
                  className={`p-3 cursor-pointer border transition-all ${
                    amount === preset.value.toString() 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setAmount(preset.value.toString())}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="font-medium">${preset.value}</span>
                    </div>
                    <Badge variant="secondary" className="bg-neon-orange/20 text-neon-orange">
                      {preset.label}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Custom Amount</Label>
            <Input
              id="custom-amount"
              type="number"
              placeholder="Enter amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-muted/50"
            />
          </div>

          {/* Promo Code */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="promo-code">Promo Code (Optional)</Label>
              <div className="group relative">
                <span className="text-xs text-muted-foreground cursor-help">ⓘ</span>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-popover border border-border rounded p-2 text-xs w-48 z-10">
                  Promo codes apply Boost Credits only, not withdrawable FC.
                </div>
              </div>
            </div>
            <Input
              id="promo-code"
              placeholder="Enter promo code..."
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="bg-muted/50"
            />
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue placeholder="Choose payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>PayPal</span>
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Credit/Debit Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="crypto">
                  <div className="flex items-center space-x-2">
                    <Bitcoin className="w-4 h-4" />
                    <span>Crypto (BTC, ETH, SOL)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Balance Display */}
          <Card className="p-3 bg-muted/30">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>FC Balance (withdrawable):</span>
                <span className="font-medium text-primary">{balances?.fc || 0} FC</span>
              </div>
              <div className="flex justify-between">
                <span>Boost Credits (play-only):</span>
                <span className="font-medium text-neon-orange">{balances?.boostCredits || 0} Credits</span>
              </div>
              <div className="flex justify-between">
                <span>FNC Tokens:</span>
                <span className="font-medium text-accent">{balances?.fnc || 0} FNC</span>
              </div>
            </div>
          </Card>

          {/* Hype Tagline */}
          <div className="text-center">
            <p className="text-sm font-medium text-primary italic transition-all duration-500">
              {depositTaglines[taglineIndex]}
            </p>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleDeposit}
            disabled={!amount || !paymentMethod}
            className="w-full bg-gradient-primary hover:opacity-80 text-base py-6"
          >
            Deposit & Play
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