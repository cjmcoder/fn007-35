import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, Target, Trophy, Star, Video } from 'lucide-react';
import { LiveProp, Challenge } from '@/lib/types';
import { SkillStatsModal } from '@/components/modals/SkillStatsModal';
import { PropDetailModal } from '@/components/ticker/PropDetailModal';

interface SkillStatsCardProps {
  data: LiveProp | Challenge;
  type: 'prop' | 'challenge';
  className?: string;
}

export const SkillStatsCard: React.FC<SkillStatsCardProps> = ({ data, type, className = '' }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const getStatTypeDisplay = () => {
    if (type === 'prop' && 'statType' in data) {
      return data.statType;
    }
    return 'Player Performance';
  };

  const getEntryAmount = () => {
    return 'entryFC' in data ? data.entryFC : 0;
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "PS5":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Xbox":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "PC":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-muted/50 text-muted-foreground";
    }
  };

  const getGameIcon = (game: string) => {
    // Return appropriate icon based on game type
    switch (game.toLowerCase()) {
      case 'madden':
      case 'nfl':
        return '🏈';
      case 'fifa':
        return '⚽';
      case 'nba':
        return '🏀';
      case 'nhl':
        return '🏒';
      case 'ufc':
      case 'undisputed':
        return '🥊';
      case 'f1':
        return '🏎️';
      case 'tennis':
        return '🎾';
      case 'mlb':
        return '⚾';
      default:
        return '🎮';
    }
  };

  return (
    <>
      <Card 
        className={`p-4 cursor-pointer hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/80 ${className}`}
        onClick={() => setModalOpen(true)}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="text-lg">{getGameIcon(data.game)}</div>
            <div>
              <div className="font-semibold text-sm text-foreground">
                {type === 'prop' && 'title' in data ? data.title : `${data.game} Challenge`}
              </div>
              <div className="text-xs text-muted-foreground">
                {getStatTypeDisplay()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-medium">Stats</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className={getPlatformColor(data.platform)} variant="outline">
            {data.platform}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {data.game}
          </Badge>
          {type === 'prop' && 'channel' in data && (
            <Badge variant="outline" className="text-xs">
              {data.channel}
            </Badge>
          )}
          {('streamRequired' in data && data.streamRequired) && (
            <Tooltip>
              <TooltipTrigger>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                  <Video className="w-3 h-3 mr-1" />
                  Stream
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Stream verification required</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Entry Fee</div>
            <div className="font-bold text-sm text-primary">
              {getEntryAmount()} FC
            </div>
          </div>

          {type === 'prop' && 'line' in data && (
            <div className="space-y-1 text-center">
              <div className="text-xs text-muted-foreground">Line</div>
              <div className="font-bold text-sm text-accent">
                {data.line}
              </div>
            </div>
          )}

          <div className="space-y-1 text-right">
            <div className="text-xs text-muted-foreground">
              {type === 'prop' ? 'Potential Win' : 'Max Payout'}
            </div>
            <div className="font-bold text-sm text-green-400">
              {'payoutFC' in data ? data.payoutFC : getEntryAmount() * 1.9} FC
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary-foreground hover:bg-primary/20 transition-all duration-200 w-full"
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
          >
            <Target className="w-4 h-4 mr-2" />
            View Skill Stats Details
          </Button>
        </div>
      </Card>

      {type === 'prop' ? (
        <PropDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          propId={data.id}
        />
      ) : (
        <SkillStatsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          data={data}
          type={type}
        />
      )}
    </>
  );
};