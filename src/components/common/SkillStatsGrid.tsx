import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkillStatsCard } from '@/components/common/SkillStatsCard';
import { TrendingUp, Target } from 'lucide-react';
import { LiveProp, Challenge } from '@/lib/types';

interface SkillStatsGridProps {
  title?: string;
  items: (LiveProp | Challenge)[];
  type: 'prop' | 'challenge' | 'mixed';
  className?: string;
}

export const SkillStatsGrid: React.FC<SkillStatsGridProps> = ({ 
  title = "Skill-Based Player Stats Specials", 
  items, 
  type,
  className = ''
}) => {
  if (!items.length) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No skill stats challenges available</p>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <Badge variant="outline" className="text-orange-400 border-orange-400/20">
          Live Stats Tracking
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const itemType = type === 'mixed' 
            ? ('channel' in item ? 'prop' : 'challenge')
            : type;
            
          return (
            <SkillStatsCard
              key={item.id}
              data={item}
              type={itemType}
            />
          );
        })}
      </div>
    </div>
  );
};