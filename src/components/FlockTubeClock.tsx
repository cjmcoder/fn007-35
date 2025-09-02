import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FlockTubeClockProps {
  showCountdown?: boolean;
  targetDate?: Date;
}

export const FlockTubeClock = ({ showCountdown = true, targetDate }: FlockTubeClockProps) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Default target date - next week (7 days from now for leaderboard reset)
  const defaultTarget = new Date();
  defaultTarget.setDate(defaultTarget.getDate() + 7);
  const target = targetDate || defaultTarget;

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      if (showCountdown) {
        const timeDiff = target.getTime() - now.getTime();
        
        if (timeDiff > 0) {
          setTimeRemaining({
            days: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((timeDiff % (1000 * 60)) / 1000)
          });
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [target, showCountdown]);

  if (!showCountdown) return null;

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <span className="text-muted-foreground font-medium">Reset in</span>
      <div className="inline-flex items-center gap-1">
        <div className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-semibold text-xs">
          {timeRemaining.days}d
        </div>
        <div className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-semibold text-xs">
          {timeRemaining.hours.toString().padStart(2, '0')}h
        </div>
        <div className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-semibold text-xs">
          {timeRemaining.minutes.toString().padStart(2, '0')}m
        </div>
        <div className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-semibold text-xs animate-pulse">
          {timeRemaining.seconds.toString().padStart(2, '0')}s
        </div>
      </div>
    </div>
  );
};