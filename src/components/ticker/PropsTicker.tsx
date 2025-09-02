/**
 * PropsTicker - Live skill props marquee ticker
 * Usage: import { PropsTicker } from '@/components/ticker/PropsTicker';
 * Place <PropsTicker /> anywhere (e.g., at top of a page). No props required.
 * Data: fetches from /api/props/live?channel=...&limit=100 (mocked via src/mocks/propsApi.ts)
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveProp, TickerChannel } from '@/lib/types';

import { PropDetailModal } from './PropDetailModal';

const CHANNELS: (TickerChannel | 'All' | 'Tournament Winner')[] = ['All', 'Tournament Winner', 'Madden', 'UFC', 'FIFA', 'NHL', 'NBA', 'UNDISPUTED', 'F1', 'TENNIS', 'MLB', 'Unity'];


export const PropsTicker: React.FC<{ className?: string }> = ({ className }) => {
  const [channel, setChannel] = useState<TickerChannel | 'All' | 'Tournament Winner'>('Madden');
  const [items, setItems] = useState<LiveProp[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const reqRef = useRef<number | null>(null);
  const trackWidthRef = useRef(0);
  const touchStartRef = useRef<number | null>(null);
  const pausedBeforeTouchRef = useRef<boolean>(false);

  const fetchLive = useCallback(async (ch: TickerChannel | 'All' | 'Tournament Winner') => {
    const params = new URLSearchParams();
    if (ch !== 'All') params.set('channel', ch);
    params.set('limit', '100');
    const res = await fetch(`/api/props/live?${params.toString()}`);
    if (!res.ok) return;
    const data = await res.json();
    const list: LiveProp[] = data.items ?? [];
    setItems(list);
  }, []);

  // Initial load + polling
  useEffect(() => {
    fetchLive(channel);
    const id = setInterval(() => fetchLive(channel), 5000);
    return () => clearInterval(id);
  }, [channel, fetchLive]);

  // Prepare looped items for infinite track
  const loopedItems = useMemo(() => {
    const source = items.length ? items : [];
    return [...source, ...source];
  }, [items]);

  // Measure track width whenever items change
  useEffect(() => {
    const trackEl = trackRef.current;
    if (!trackEl) return;
    // let layout settle
    requestAnimationFrame(() => {
      trackWidthRef.current = trackEl.scrollWidth / 2; // width of one cycle
    });
  }, [loopedItems.length]);

  const step = useCallback((ts: number) => {
    if (isPaused || !trackWidthRef.current) {
      lastTsRef.current = ts;
      reqRef.current = requestAnimationFrame(step);
      return;
    }
    if (lastTsRef.current == null) lastTsRef.current = ts;
    const dt = (ts - lastTsRef.current) / 1000; // seconds
    lastTsRef.current = ts;
    const pxPerSec = 60; // base speed
    offsetRef.current += pxPerSec * dt;

    const width = trackWidthRef.current;
    if (offsetRef.current >= width) {
      offsetRef.current -= width; // wrap around seamlessly
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
    }

    reqRef.current = requestAnimationFrame(step);
  }, [isPaused]);

  useEffect(() => {
    reqRef.current = requestAnimationFrame(step);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [step]);

  const onItemClick = (id: string) => {
    setActiveId(id);
    setModalOpen(true);
  };

  const onKeyItem: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.currentTarget.click();
    }
  };

  // Mobile swipe support
  const onTouchStart = (e: React.TouchEvent) => {
    pausedBeforeTouchRef.current = isPaused;
    setIsPaused(true);
    touchStartRef.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current == null) return;
    const x = e.touches[0]?.clientX ?? 0;
    const delta = x - touchStartRef.current;
    touchStartRef.current = x;
    // negative delta moves left when swiping left
    offsetRef.current = offsetRef.current - delta;
    const width = trackWidthRef.current || 0;
    if (width > 0) {
      while (offsetRef.current >= width) offsetRef.current -= width;
      while (offsetRef.current < 0) offsetRef.current += width;
    }
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
    }
  };
  const onTouchEnd = () => {
    touchStartRef.current = null;
    setIsPaused(pausedBeforeTouchRef.current);
  };

  const filteredLabel = channel === 'All' ? 'All Channels' : channel === 'Tournament Winner' ? 'Tournament Winner Betting' : channel;

  return (
    <section aria-label="Skill Props Ticker" className={cn('w-full border-b border-border bg-gradient-primary/5', className)}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2">
        <div className="flex items-center gap-3">
          {/* Left: Channel */}
          <div className="shrink-0 min-w-40">
            <Select value={channel} onValueChange={(v) => setChannel(v as TickerChannel | 'All' | 'Tournament Winner')}>
              <SelectTrigger className="h-8 rounded-xl bg-background/60 border-primary/30">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-card border-border shadow-lg backdrop-blur-sm">
                {CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Marquee Track */}
          <div
            ref={containerRef}
            className="relative flex-1 overflow-hidden rounded-2xl border border-primary/10 bg-background/40"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
          >
            <div className="px-3 py-1.5 border-b border-border/60 bg-background/60 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                SKILL BASED PLAYER STATS SPECIALS
              </span>
              <Badge variant="outline" className="text-orange-400 border-orange-400/20 text-xs">
                Private Server Required
              </Badge>
            </div>
            <div ref={trackRef} className="flex items-stretch gap-2 py-2 will-change-transform">
              {loopedItems.map((p, idx) => (
                <ItemPill key={`${p.id}-${idx}`} p={p} onClick={() => onItemClick(p.id)} onFocus={() => setIsPaused(true)} onBlur={() => setIsPaused(false)} onKeyDown={onKeyItem} />
              ))}
              {loopedItems.length === 0 && (
                <span className="text-muted-foreground text-sm px-4 py-1">Loading {filteredLabel} skill props…</span>
              )}
            </div>
          </div>


        </div>
      </div>

      <PropDetailModal open={modalOpen} onOpenChange={setModalOpen} propId={activeId} />
    </section>
  );
};

const ItemPill: React.FC<{
  p: LiveProp;
  onClick: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>;
}> = React.memo(({ p, onClick, onFocus, onBlur, onKeyDown }) => {
  const [riskAmount, setRiskAmount] = useState(p.entryFC.toString());
  
  const handleRiskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setRiskAmount(value);
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const risk = parseFloat(riskAmount) || 0;
  const multiplier = Number(p.payoutFC) / p.entryFC;
  const potentialWin = risk * multiplier;
  const profit = potentialWin - risk;

  return (
    <div
      className={cn(
        'group inline-flex flex-col w-[480px] sm:w-[520px] md:w-[560px] p-0 rounded-lg border',
        'border-border bg-card text-card-foreground shadow-sm',
        'hover:shadow-md hover:border-border/80 transition-all duration-200'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-xs font-medium">
            {p.channel}
          </Badge>
          <span className="text-xs text-muted-foreground">{p.platform}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{p.game}</span>
        </div>
        {p.streamRequired && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center text-orange-500">
                <Camera className="w-3.5 h-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Stream required for verification
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      
      {/* Content - Horizontal Layout */}
      <div className="flex items-center gap-3 p-3">
        {/* Left: Title */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-left line-clamp-2">{p.title}</div>
        </div>
        
        {/* Center: Betting Input */}
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground text-center">Risk</div>
            <Input
              type="text"
              value={riskAmount}
              onChange={handleRiskChange}
              onClick={handleInputClick}
              className="w-16 h-8 text-center text-sm font-bold"
              placeholder="0"
            />
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Odds</div>
            <div className="text-sm font-bold text-green-600">+{Math.round((multiplier - 1) * 100)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Win</div>
            <div className="text-sm font-bold text-green-600">{potentialWin.toFixed(1)} FC</div>
          </div>
        </div>

        {/* Right: Projected Payout */}
        <div className="rounded-md bg-slate-700 p-2 min-w-[140px]">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300">Total Stake:</span>
            <span className="text-white font-semibold">{risk.toFixed(1)} FC</span>
          </div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300">Possible Winnings:</span>
            <span className="text-green-400 font-semibold">{potentialWin.toFixed(1)} FC</span>
          </div>
          <div className="pt-1 border-t border-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-xs">Net Profit:</span>
              <span className="text-green-400 font-bold text-xs">+{profit.toFixed(1)} FC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clickable overlay for modal */}
      <button
        className="absolute inset-0 w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        onClick={onClick}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-label={`View details for ${p.title}`}
      />
    </div>
  );
});

ItemPill.displayName = 'ItemPill';

export default PropsTicker;
