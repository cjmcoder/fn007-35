import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LiveProp } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export const PropDetailModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propId: string | null;
}> = ({ open, onOpenChange, propId }) => {
  const { toast } = useToast();
  const [data, setData] = useState<LiveProp | null>(null);
  const [loading, setLoading] = useState(false);
  const [riskAmount, setRiskAmount] = useState('');

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
        const res = await fetch(`/api/props/${propId}`);
        if (res.ok) {
          const d = await res.json();
          if (active) setData(d as LiveProp);
        } else {
          // fallback: keep modal but indicate missing
          if (active) setData(null);
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

  const onAccept = () => {
    toast({ title: 'Accepted', description: 'You accepted this skill prop.' });
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
          <Button onClick={onAccept} className="flex-1 bg-green-600 hover:bg-green-700">
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropDetailModal;
