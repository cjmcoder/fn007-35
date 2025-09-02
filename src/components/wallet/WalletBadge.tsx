import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wallet, Plus, DollarSign, ChevronDown, CreditCard, Smartphone } from "lucide-react";
import { useWallet } from "@/store/useWallet";
import { useUI } from "@/store/useUI";
import { formatFC } from "@/lib/fncMath";

export const WalletBadge = () => {
  const { wallet, isConnected, isConnecting, connectWallet } = useWallet();
  const { setAddFCModalOpen } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState("25");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [promoCode, setPromoCode] = useState("");

  if (!isConnected) {
    return (
      <Button 
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-gradient-secondary hover:shadow-orange"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-card/50 border-border hover:bg-card/80">
          <div className="flex items-center space-x-2">
            <div className="text-sm">
               <span className="font-mono font-bold text-primary">
                 FC: {formatFC(wallet.fc)}
               </span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 bg-card border-border p-0">
        <Tabs defaultValue="deposit" className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="deposit" className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Load Up Your FC</h3>
              <div className="text-sm text-muted-foreground mb-1">
                <p>Fuel your matches, tournaments, and leaderboards with FC credits.</p>
              </div>
              <div className="text-xs text-primary font-semibold italic">
                "Stack wins, stack FC."
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Deposit Amount</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={selectedAmount === "25" ? "default" : "outline"}
                  onClick={() => setSelectedAmount("25")}
                  className="h-12 flex-col gap-1"
                >
                  <span className="font-bold">$25</span>
                  <span className="text-xs text-primary">+50% Bonus Play</span>
                </Button>
                <Button 
                  variant={selectedAmount === "50" ? "default" : "outline"}
                  onClick={() => setSelectedAmount("50")}
                  className="h-12 flex-col gap-1"
                >
                  <span className="font-bold">$50</span>
                  <span className="text-xs text-primary">Double Your Play</span>
                </Button>
                <Button 
                  variant={selectedAmount === "100" ? "default" : "outline"}
                  onClick={() => setSelectedAmount("100")}
                  className="h-12 flex-col gap-1"
                >
                  <span className="font-bold">$100</span>
                  <span className="text-xs text-primary">Triple Up Bonus</span>
                </Button>
                <Button 
                  variant={selectedAmount === "custom" ? "default" : "outline"}
                  onClick={() => setSelectedAmount("custom")}
                  className="h-12 flex-col gap-1"
                >
                  <span className="font-bold">Other</span>
                  <span className="text-xs">Amount</span>
                </Button>
              </div>
              
              {selectedAmount === "custom" && (
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="mt-2"
                />
              )}
              
               <div className="text-sm text-primary font-semibold">
                 + ${selectedAmount === "25" ? "12.50" : selectedAmount === "50" ? "50" : selectedAmount === "100" ? "200" : "0"} Boost Credits!
               </div>
               <div className="text-xs text-muted-foreground">
                 FC Balance (withdrawable) + Boost Credits (play-only)
               </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="paypal" id="paypal" />
                   <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                     <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">PayPal</div>
                     Pay with PayPal
                   </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="crypto" id="crypto" />
                   <Label htmlFor="crypto" className="flex items-center gap-2 cursor-pointer">
                     <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">₿</div>
                     Pay with Crypto
                   </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="card" id="card" />
                   <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                     <CreditCard className="w-4 h-4" />
                     Pay with Card
                   </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo" className="text-sm font-medium">Promo Code (optional)</Label>
              <Input
                id="promo"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                Promo codes apply Boost Credits only, not withdrawable FC.
              </div>
            </div>

            <Button className="w-full bg-gradient-primary hover:shadow-lightning">
              Deposit & Play
            </Button>

            <div className="text-xs text-muted-foreground border-t pt-3 mt-4">
              <p className="font-semibold mb-1">Compliance Notice</p>
              <p>FC = platform credits for competitive play, withdrawable per policy.<br/>
              Boost Credits = promotional play-only funds, non-withdrawable.<br/>
              FNC = speculative crypto rewards, not guaranteed in value.</p>
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Cash Out Your Winnings</h3>
              <p className="text-sm text-muted-foreground">Turn your FC victories into real rewards.</p>
              <div className="text-xs text-primary font-semibold italic">
                "Play hard. Cash out fast."
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-3 bg-card/50 rounded border">
                  <div className="text-muted-foreground">Withdrawable FC</div>
                  <div className="font-mono font-bold text-primary">{formatFC(wallet.fc)} FC</div>
                  <div className="text-xs text-muted-foreground">Ready to Cash Out</div>
                </div>
                <div className="p-3 bg-card/50 rounded border">
                  <div className="text-muted-foreground">Boost Credits</div>
                  <div className="font-mono font-bold text-muted-foreground">0 BC</div>
                  <div className="text-xs text-muted-foreground">Play-Only Bonus</div>
                </div>
              </div>
              
              <div className="p-3 bg-card/50 rounded border">
                <div className="text-xs text-muted-foreground mb-1">FNC Rewards (Speculative)</div>
                <div className="font-mono font-bold text-orange-500">1,250 FNC</div>
                <div className="text-xs text-muted-foreground">Speculative crypto — not withdrawable (future wallet support coming)</div>
              </div>
              
              <div className="text-xs text-muted-foreground mb-2">
                Only FC earned from wins, tournaments, or leaderboard rewards is eligible for withdrawal. Boost Credits are excluded.
              </div>
              
              <Button className="w-full bg-gradient-primary hover:shadow-lightning">
                <DollarSign className="w-4 h-4 mr-2" />
                Cash Out Now
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground border-t pt-3 mt-4">
              <p className="font-semibold mb-1">Compliance Notice</p>
              <p>FC = platform credits for competitive play, withdrawable per policy.<br/>
              Boost Credits = promotional play-only funds, non-withdrawable.<br/>
              FNC = speculative crypto rewards, not guaranteed in value.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};