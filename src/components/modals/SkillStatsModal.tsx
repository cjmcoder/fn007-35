import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Star, Video, Target, Clock, MapPin, Copy, Share2, TrendingUp, Zap } from 'lucide-react';
import { LiveProp, Challenge } from '@/lib/types';
import { formatFC, calculateFee } from '@/lib/fncMath';

interface SkillStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: LiveProp | Challenge | null;
  type: 'prop' | 'challenge';
}

export const SkillStatsModal: React.FC<SkillStatsModalProps> = ({ 
  open, 
  onOpenChange, 
  data, 
  type 
}) => {
  const { toast } = useToast();
  const [riskAmount, setRiskAmount] = useState('');

  // Initialize risk amount when data loads
  React.useEffect(() => {
    if (data && 'entryFC' in data) {
      setRiskAmount(data.entryFC.toString());
    }
  }, [data]);

  const handleRiskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setRiskAmount(value);
    }
  };

  const onAccept = () => {
    toast({ 
      title: 'Challenge Accepted!', 
      description: `You've joined this ${type === 'prop' ? 'skill prop' : 'challenge'}.` 
    });
    onOpenChange(false);
  };

  const onShare = async () => {
    if (!data) return;
    const url = `${window.location.origin}/${type}s/${data.id}`;
    
    if (navigator.share) {
      try { 
        await navigator.share({ 
          title: data && 'title' in data ? data.title : data ? `${data.game} Challenge` : 'Challenge',
          url 
        }); 
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', description: 'Share link copied to clipboard.' });
    }
  };

  const copyMatchId = async (matchId?: string) => {
    if (!matchId) return;
    await navigator.clipboard.writeText(matchId);
    toast({ title: 'Copied', description: 'Match ID copied to clipboard.' });
  };

  if (!data) return null;

  // Calculate dynamic payouts for props
  const risk = parseFloat(riskAmount) || 0;
  let multiplier = 1;
  let potentialWin = risk;
  let profit = 0;
  let fee = 0;

  if (data && type === 'prop' && 'payoutFC' in data) {
    multiplier = Number(data.payoutFC) / data.entryFC;
    potentialWin = risk * multiplier;
    profit = potentialWin - risk;
  } else if (data && type === 'challenge' && 'payoutFC' in data) {
    fee = calculateFee(data.entryFC);
    potentialWin = data.payoutFC - fee;
    profit = potentialWin - risk;
  }

  const getTierConfig = (tier?: string) => {
    switch (tier) {
      case 'tier1':
        return {
          name: 'Tier 1 - Basic Quick Match',
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          description: 'Standard community matches under 25 FC entry.'
        };
      case 'tier2':
        return {
          name: 'Tier 2 - Private Server Match',
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          description: 'Private server required. 25+ FC entry, added fairness & monitoring.'
        };
      case 'vip':
        return {
          name: 'VIP Server - High Stakes Arena',
          color: 'bg-gradient-to-r from-red-500/20 to-purple-500/20 text-red-400 border-red-500/30',
          description: 'Exclusive high-stakes arena. Invite-only or rank-based.'
        };
      default:
        return {
          name: 'Skill-Based Challenge',
          color: 'bg-primary/20 text-primary border-primary/30',
          description: 'Competitive skill-based match.'
        };
    }
  };

  const tierConfig = getTierConfig('tier' in data ? data.tier : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text">
            {type === 'prop' ? 'Skill-Based Player Stats Special' : 'Challenge Details'}
          </DialogTitle>
          <DialogDescription>
            {data && 'title' in data ? data.title : data ? `${data.game} • ${data.platform}` : 'Loading...'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Card with Game Info */}
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={tierConfig.color}>
                    <Star className="w-3 h-3 mr-1" />
                    {tierConfig.name}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {data.game}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {data.platform}
                  </Badge>
                  {'channel' in data && (
                    <Badge variant="secondary" className="text-xs">
                      {data.channel}
                    </Badge>
                  )}
                </div>
                {type === 'prop' && 'statType' in data && (
                  <div className="text-sm text-muted-foreground">
                    <Target className="w-4 h-4 inline mr-1" />
                    Tracking: <span className="font-medium">{data.statType}</span>
                  </div>
                )}
              </div>
              
              {'creator' in data && (
                <div className="text-right">
                  <div className="text-sm font-medium">{data.creator.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Rating: {data.creator.rating.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Skill Stats Details */}
          {'title' in data && (
            <Card className="p-4 border-accent/30 bg-accent/5">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <h3 className="font-semibold text-accent mb-2">Player Stats Challenge</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.title}
                  </p>
                  {type === 'prop' && 'line' in data && (
                    <div className="mt-3 p-2 bg-background/50 rounded border">
                      <div className="text-xs text-muted-foreground">Betting Line</div>
                      <div className="font-bold text-lg text-accent">{data.line}</div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Interactive Betting Interface */}
          <Card className="p-4 bg-muted/30">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              {type === 'prop' ? 'Live Betting Interface' : 'Entry & Payout'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-2">Risk Amount</div>
                <Input
                  type="text"
                  value={riskAmount}
                  onChange={handleRiskChange}
                  className="text-center text-lg font-bold border-primary/30 focus:border-primary"
                  placeholder="0"
                />
                <div className="text-xs text-muted-foreground mt-1">FC</div>
              </div>
              
              {type === 'prop' && (
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-2">Odds</div>
                  <div className="h-11 flex items-center justify-center">
                    <div className="text-lg font-bold text-green-600">
                      +{Math.round((multiplier - 1) * 100)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">American</div>
                </div>
              )}

              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-2">Potential Win</div>
                <div className="h-11 flex items-center justify-center">
                  <div className="text-lg font-bold text-green-600">
                    {potentialWin.toFixed(1)} FC
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Payout</div>
              </div>
            </div>

            {/* Payout Breakdown */}
            <div className="bg-slate-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Your Stake:</span>
                <span className="text-white font-semibold">{risk.toFixed(1)} FC</span>
              </div>
              {type === 'challenge' && fee > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Platform Fee:</span>
                  <span className="text-red-400 font-semibold">-{formatFC(fee)} FC</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Possible Winnings:</span>
                <span className="text-green-400 font-semibold">{potentialWin.toFixed(1)} FC</span>
              </div>
              <div className="pt-2 border-t border-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Net Profit:</span>
                  <span className="text-green-400 font-bold text-lg">+{profit.toFixed(1)} FC</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Stream & Verification Requirements */}
          {(('streamRequired' in data && data.streamRequired) || ('tier' in data && (data.tier === 'tier2' || data.tier === 'vip'))) && (
            <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <Video className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    Stream Verification Required
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                    This match requires live streaming with the Match ID prominently displayed in your stream title.
                  </p>
                  {'matchId' in data && data.matchId && (
                    <div className="flex items-center gap-2 p-2 bg-orange-100 dark:bg-orange-900/50 rounded">
                      <span className="text-xs font-mono text-orange-800 dark:text-orange-200">
                        Match ID: {data.matchId}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyMatchId(data.matchId)}
                        className="h-6 px-2 text-orange-700 hover:text-orange-900"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Additional Info */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {'createdAt' in data && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Posted {new Date(data.createdAt).toLocaleTimeString()}</span>
              </div>
            )}
            {'region' in data && data.region && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{data.region}</span>
              </div>
            )}
            {type === 'prop' && 'startsInSec' in data && data.startsInSec && (
              <div className="flex items-center gap-1 text-green-600">
                <Clock className="w-3 h-3" />
                <span>Starts in {Math.round(data.startsInSec / 60)}m</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onShare} className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button 
            onClick={onAccept}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            {type === 'prop' ? 'Place Bet' : 'Accept Challenge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};