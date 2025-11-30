import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWallet } from "@/store/useWallet";
import { useUI } from "@/store/useUI";
import { formatFC } from "@/lib/fncMath";
import { 
  Plus, 
  Banknote, 
  Wallet as WalletIcon, 
  ArrowRightLeft,
  Trophy,
  Clock,
  DollarSign
} from "lucide-react";

export const EnhancedWalletPanel = () => {
  const { wallet } = useWallet();
  const { setAddFCModalOpen } = useUI();
  
  // TODO: Fetch real tournament earnings and FNC balance from API
  // For now, these should come from real backend endpoints
  const tournamentEarningsPending = 0; // TODO: GET /api/wallet/:userId/tournament-pending
  const fncBalance = 0; // TODO: GET /api/wallet/:userId/fnc-balance
  
  const available = wallet.fc;
  const locked = wallet.lockedFC;
  const total = available + locked + tournamentEarningsPending;

  return (
    <TooltipProvider>
      <section className="px-4 lg:px-6 space-y-6 lg:space-y-8">
        {/* Four Balance Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Available FC */}
          <Card className="p-4 lg:p-6 bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
              <span className="text-xs lg:text-sm text-primary font-medium">Available FC</span>
            </div>
            <div className="font-mono text-2xl lg:text-4xl font-bold text-primary mb-3">
              {formatFC(available).replace(' FC', '')}
            </div>
            <div className="px-3 py-1.5 rounded text-xs bg-primary/20 text-primary font-medium inline-block">
              Ready to use
            </div>
          </Card>

          {/* Locked in Matches */}
          <Card className="p-4 lg:p-6 bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" />
              <span className="text-xs lg:text-sm text-yellow-600 font-medium">Locked in Matches</span>
            </div>
            <div className="font-mono text-2xl lg:text-4xl font-bold text-yellow-600 mb-3">
              {locked}
            </div>
            <div className="px-3 py-1.5 rounded text-xs bg-yellow-500/20 text-yellow-600 font-medium inline-block">
              In progress
            </div>
          </Card>

          {/* Tournament Pending */}
          <Card className="p-4 lg:p-6 bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
              <span className="text-xs lg:text-sm text-blue-600 font-medium">Tournament Pending</span>
            </div>
            <div className="font-mono text-2xl lg:text-4xl font-bold text-blue-600 mb-3">
              {tournamentEarningsPending}
            </div>
            <div className="px-3 py-1.5 rounded text-xs bg-blue-500/20 text-blue-600 font-medium inline-block">
              Processing
            </div>
          </Card>

          {/* Total Balance */}
          <Card className="p-4 lg:p-6 gaming-card border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <WalletIcon className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
              <span className="text-xs lg:text-sm text-muted-foreground font-medium">Total Balance</span>
            </div>
            <div className="font-mono text-2xl lg:text-4xl font-bold mb-3">
              {formatFC(total).replace(' FC', '')}
            </div>
            <div className="px-3 py-1.5 rounded text-xs bg-primary/20 text-primary font-medium inline-block">
              All FC combined
            </div>
          </Card>
        </div>

        {/* FNC Balance Card */}
        <Card className="p-6 lg:p-8 bg-secondary/10 border border-secondary/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="w-5 h-5 lg:w-6 lg:h-6 text-secondary" />
                <span className="text-base lg:text-lg font-semibold text-secondary">FNC Balance (Speculative)</span>
              </div>
              <div className="font-mono text-3xl lg:text-5xl font-bold text-secondary">
                {fncBalance.toLocaleString()} FNC
              </div>
              <p className="text-sm lg:text-base text-muted-foreground">
                Earned through performance • Est. ${(fncBalance * 0.024).toFixed(2)} USD
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Button variant="outline" size="sm" disabled className="px-6">
                Enable Wallet
              </Button>
              <Button variant="ghost" size="sm" disabled className="text-muted-foreground px-6">
                Convert FNC → FC
              </Button>
              <p className="text-xs text-muted-foreground text-center">Coming Soon</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 lg:p-8 gaming-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-3">
              <WalletIcon className="h-5 w-5 lg:h-6 lg:w-6" />
              <span className="text-base lg:text-lg font-semibold">Quick Actions</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => setAddFCModalOpen(true)} 
                className="bg-gradient-primary shadow-glow px-6 lg:px-8"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" /> Add FC
              </Button>
              <Button variant="outline" disabled={available <= 0} className="px-6 lg:px-8" size="sm">
                <Banknote className="mr-2 h-4 w-4" /> Cash Out
              </Button>
              <Button variant="secondary" disabled className="px-6 lg:px-8" size="sm">
                <WalletIcon className="mr-2 h-4 w-4" /> Enable FNC Wallet
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </TooltipProvider>
  );
};