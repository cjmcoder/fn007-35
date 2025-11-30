import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LiveProp } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/store/useWallet';
import { useAuth } from '@/store/useAuth';
import { propsApi } from '@/lib/api';
import { PropIntegrationService } from '@/services/propIntegrationService';

export const PropDetailModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propId: string | null;
}> = ({ open, onOpenChange, propId }) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { wallet, updateBalance } = useWallet();
  const [data, setData] = useState<LiveProp | null>(null);
  const [loading, setLoading] = useState(false);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [riskAmount, setRiskAmount] = useState('');
  const [selectedSide, setSelectedSide] = useState<'OVER' | 'UNDER' | null>(null);

  // Initialize risk amount when data loads
  useEffect(() => {
    if (data) {
      setRiskAmount(data.entryFC.toString());
    }
  }, [data]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!open || !propId) return;
      setLoading(true);
      try {
        // Try real API first, fallback to mock
        try {
          const prop = await propsApi.getProp(propId);
          if (active) setData(prop);
        } catch (error) {
          // Fallback to mock data for development
          const res = await fetch(`/api/props/${propId}`);
          if (res.ok) {
            const d = await res.json();
            if (active) setData(d as LiveProp);
          } else {
            if (active) setData(null);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [open, propId]);

  const copy = async (text?: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'Copied to clipboard.' });
  };

  const share = async () => {
    if (!data) return;
    const url = `${window.location.origin}/props/${data.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: data.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', description: 'Share link copied to clipboard.' });
    }
  };

  const handleRiskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setRiskAmount(value);
    }
  };

  const handleStakeProp = async () => {
    if (!isAuthenticated) {
      toast({ 
        title: 'Login Required', 
        description: 'Please log in to place prop bets.',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedSide) {
      toast({ 
        title: 'Select Side', 
        description: 'Please choose OVER or UNDER.',
        variant: 'destructive'
      });
      return;
    }

    const stakeAmount = parseFloat(riskAmount);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      toast({ 
        title: 'Invalid Amount', 
        description: 'Please enter a valid stake amount.',
        variant: 'destructive'
      });
      return;
    }

    if (wallet.fc < stakeAmount) {
      toast({ 
        title: 'Insufficient Funds', 
        description: `You need ${stakeAmount} FC but only have ${wallet.fc} FC available.`,
        variant: 'destructive'
      });
      return;
    }

    setStakeLoading(true);
    try {
      // Place stake with full integration
      await PropIntegrationService.stakePropWithIntegration(
        data!.id, 
        selectedSide, 
        stakeAmount,
        user!.id
      );
      
      // Update wallet balance
      const newBalance = wallet.fc - stakeAmount;
      updateBalance({ fc: newBalance, lockedFC: wallet.lockedFC + stakeAmount });
      
      toast({ 
        title: 'Stake Placed!', 
        description: `${stakeAmount} FC staked on ${selectedSide} ${data!.title}. Good luck!`,
        variant: 'default'
      });
      
      // Close modal
      onOpenChange(false);
    } catch (error: any) {
      toast({ 
        title: 'Stake Failed', 
        description: error.message || 'Failed to place stake. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setStakeLoading(false);
    }
  };

  const onView = () => {
    toast({ title: 'Opened', description: 'Viewing challenge details.' });
  };

  // Calculate dynamic payouts
  const risk = parseFloat(riskAmount) || 0;
  const multiplier = data ? Number(data.payoutFC) / data.entryFC : 1;
  const potentialWin = risk * multiplier;
  const profit = potentialWin - risk;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{data?.title || 'Loading...'}</DialogTitle>
          <DialogDescription>
            {loading ? 'Loading…' : data ? `${data.channel} • ${data.platform} • ${data.game}` : 'Not found'}
          </DialogDescription>
        </DialogHeader>

        {data && (
          <div className="space-y-4">
            {/* Skill Stats Header */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-400 border-orange-400/20 text-xs">
                SKILL BASED PLAYER STATS SPECIALS
              </Badge>
              <Badge variant="outline" className="text-orange-400 border-orange-400/20 text-xs">
                Private Server Required
              </Badge>
            </div>

            {/* Prop Details */}
            <div className="space-y-3">
              <div className="text-lg font-semibold">{data.title}</div>
              <div className="text-sm text-muted-foreground">
                {data.player.name} • Rating {data.player.rating}
              </div>
              
              {/* Platform Badges */}
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" className="text-xs">
                  Over/Under
                </Button>
                <Badge variant="outline" className="text-xs">{data.game}</Badge>
                <Badge variant="outline" className="text-xs">{data.platform}</Badge>
              </div>
            </div>

            {/* Side Selection */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Choose Your Side:</div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedSide === 'OVER' ? 'default' : 'outline'}
                  className={`h-12 ${selectedSide === 'OVER' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => setSelectedSide('OVER')}
                >
                  <div className="text-center">
                    <div className="font-bold">OVER {data.line}</div>
                    <div className="text-xs opacity-75">+{Math.round((multiplier - 1) * 100)}</div>
                  </div>
                </Button>
                <Button
                  variant={selectedSide === 'UNDER' ? 'default' : 'outline'}
                  className={`h-12 ${selectedSide === 'UNDER' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  onClick={() => setSelectedSide('UNDER')}
                >
                  <div className="text-center">
                    <div className="font-bold">UNDER {data.line}</div>
                    <div className="text-xs opacity-75">+{Math.round((multiplier - 1) * 100)}</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Interactive Betting Section */}
            <div className="rounded-md border bg-background/50 p-4">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Risk</div>
                  <div className="border rounded-md p-2">
                    <Input
                      type="text"
                      value={riskAmount}
                      onChange={handleRiskChange}
                      className="text-center text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      placeholder="30"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">FC</div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Odds</div>
                  <div className="text-2xl font-bold text-green-400">
                    +{Math.round((multiplier - 1) * 100)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">American</div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Win</div>
                  <div className="text-2xl font-bold text-green-400">
                    {potentialWin.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">FC</div>
                </div>
              </div>
            </div>

            {/* Wallet Balance Display */}
            <div className="rounded-md bg-slate-800 p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Available Balance:</span>
                <span className="text-lg font-bold text-white">{wallet.fc.toFixed(1)} FC</span>
              </div>
              {wallet.lockedFC > 0 && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-slate-300">Locked:</span>
                  <span className="text-sm text-yellow-400">{wallet.lockedFC.toFixed(1)} FC</span>
                </div>
              )}
            </div>

            {/* Payout Calculation */}
            <div className="rounded-md bg-slate-700 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Stake:</span>
                <span className="text-white font-semibold">{risk.toFixed(1)} FC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Possible Winnings:</span>
                <span className="text-green-400 font-semibold">{potentialWin.toFixed(1)} FC</span>
              </div>
              <div className="pt-2 border-t border-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Net Profit:</span>
                  <span className="text-green-400 font-bold text-lg">+{profit.toFixed(1)} FC</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="secondary" onClick={share} className="flex-1">
            Share
          </Button>
          <Button variant="outline" onClick={onView} className="flex-1">
            View Challenge
          </Button>
          <Button 
            onClick={handleStakeProp} 
            disabled={stakeLoading || !selectedSide || !isAuthenticated}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {stakeLoading ? 'Placing Stake...' : 'Place Stake'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropDetailModal;
