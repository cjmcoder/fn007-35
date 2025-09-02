import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWallet } from "@/store/useWallet";
import { useUI } from "@/store/useUI";
import { formatFC } from "@/lib/fncMath";
import { Banknote, Plus, Wallet as WalletIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const WalletPanel = () => {
  const { wallet, updateBalance } = useWallet();
  const { setAddFCModalOpen } = useUI();

  const [cashOpen, setCashOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const available = wallet.fc;
  const inMatches = wallet.lockedFC;
  const total = wallet.fc + wallet.lockedFC;
  const lockedPct = total > 0 ? Math.round((inMatches / total) * 100) : 0;

  const activity = [
    { time: "Aug 12, 12:21", type: "Match Entry", amount: -250, note: "Madden 1v1" },
    { time: "Aug 11, 19:04", type: "FC Added", amount: 1000, note: "Credit Card" },
    { time: "Aug 10, 09:32", type: "Cash Out", amount: -500, note: "Pending" },
  ];

  const onCashOut = async () => {
    const val = Math.floor(Number(amount || 0));
    if (Number.isNaN(val) || val <= 0) {
      toast({ title: "Enter a valid amount", description: "Please enter how much FC you want to cash out." });
      return;
    }
    if (val > available) {
      toast({ title: "Insufficient balance", description: "Amount exceeds available FC.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));

    updateBalance({ ...wallet, fc: available - val });
    setIsProcessing(false);
    setCashOpen(false);
    setAmount("");
    toast({ title: "Cash out requested", description: `You cashed out ${formatFC(val)} FC (mock).` });
  };

  return (
    <section aria-labelledby="wallet-heading" className="px-4 lg:px-6">
      <h2 id="wallet-heading" className="sr-only">Wallet</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card className="p-4 bg-card/50 border-border">
          <div className="text-sm text-muted-foreground">Available Balance</div>
          <div className="mt-1 font-mono text-2xl font-bold text-neon-cyan">{formatFC(available)} FC</div>
        </Card>
        <Card className="p-4 bg-card/50 border-border">
          <div className="text-sm text-muted-foreground">In Matches</div>
          <div className="mt-1 font-mono text-2xl font-semibold text-neon-orange">{formatFC(inMatches)} FC</div>
        </Card>
        <Card className="p-4 bg-card/50 border-border">
          <div className="text-sm text-muted-foreground">Total Balance</div>
          <div className="mt-1 font-mono text-2xl font-bold">{formatFC(total)} FC</div>
        </Card>
      </div>

      <Card className="mt-4 p-4 bg-card/50 border-border">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <WalletIcon className="h-4 w-4" />
            <span>Manage your funds</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setAddFCModalOpen(true)} className="bg-gradient-secondary hover:shadow-orange">
              <Plus className="mr-2 h-4 w-4" /> Add FC
            </Button>
            <Button variant="outline" onClick={() => setCashOpen(true)} disabled={available <= 0}>
              <Banknote className="mr-2 h-4 w-4" /> Cash Out
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="p-4 bg-card/50 border-border">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">Available balance</div>
              <div className="mt-1 font-mono text-xl font-semibold">{formatFC(available)} FC</div>
              <p className="text-xs text-muted-foreground mt-1">Ready to use</p>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Locked in matches</div>
              <div className="mt-1 font-mono text-xl font-semibold">{lockedPct}%</div>
              <div className="mt-2 h-1.5 rounded bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${lockedPct}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Recent activity</h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground">View all</Button>
          </div>
          <div className="space-y-2">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">{a.type}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.time} · {a.note}</div>
                </div>
                <div className={a.amount >= 0 ? "text-primary" : "text-destructive"}>
                  {a.amount >= 0 ? "+" : "-"}{formatFC(Math.abs(a.amount))} FC
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog open={cashOpen} onOpenChange={setCashOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Cash Out</DialogTitle>
            <DialogDescription>
              Enter the amount of FC you want to cash out. This is a demo flow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Available</span>
              <span className="font-mono">{formatFC(available)} FC</span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cash-amount">Amount (FC)</Label>
              <Input
                id="cash-amount"
                type="number"
                min={1}
                max={available}
                placeholder="e.g. 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setCashOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={onCashOut} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default WalletPanel;
