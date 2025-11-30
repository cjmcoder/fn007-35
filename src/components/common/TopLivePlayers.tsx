
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Crown, Trophy, DollarSign, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface LivePlayer {
  id: string;
  username: string;
  rank: number;
  avatarUrl: string;
  wins: number;
  earnings: string;
  winRate: number;
  currentGame: string;
  status: "live" | "online" | "away";
}

const topLivePlayers: LivePlayer[] = [
  {
    id: "player-1",
    username: "ProGamer_X",
    rank: 1,
    avatarUrl: "/placeholder.svg",
    wins: 2847,
    earnings: "145,750 FC",
    winRate: 89.3,
    currentGame: "Arena Warriors",
    status: "live"
  },
  {
    id: "player-2", 
    username: "SkillMaster",
    rank: 2,
    avatarUrl: "/placeholder.svg",
    wins: 2156,
    earnings: "98,420 FC",
    winRate: 85.7,
    currentGame: "Speed Trials",
    status: "live"
  },
  {
    id: "player-3",
    username: "ChampionElite",
    rank: 3,
    avatarUrl: "/placeholder.svg",
    wins: 1943,
    earnings: "87,360 FC",
    winRate: 82.1,
    currentGame: "Puzzle Masters",
    status: "online"
  },
  {
    id: "player-4",
    username: "VictorySeeker",
    rank: 4,
    avatarUrl: "/placeholder.svg",
    wins: 1789,
    earnings: "73,280 FC",
    winRate: 79.4,
    currentGame: "Strategy Legends",
    status: "live"
  },
  {
    id: "player-5",
    username: "GameDominator",
    rank: 5,
    avatarUrl: "/placeholder.svg",
    wins: 1654,
    earnings: "68,910 FC",
    winRate: 76.8,
    currentGame: "Reflex Rush",
    status: "online"
  }
];

export const TopLivePlayers = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  // Auto-rotation
  useEffect(() => {
    if (isDragging) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topLivePlayers.length);
    }, 5000); // Rotate every 5 seconds
    
    return () => clearInterval(interval);
  }, [isDragging]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % topLivePlayers.length);
  };
 
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + topLivePlayers.length) % topLivePlayers.length);
  };

  // Arrow-controlled animated navigation
  const goNext = () => {
    if (isDragging) return;
    setTransitionEnabled(true);
    setDragDistance(-120);
    setTimeout(() => {
      nextSlide();
      setTransitionEnabled(false);
      setDragDistance(0);
      requestAnimationFrame(() => setTransitionEnabled(true));
    }, 200);
  };

  const goPrev = () => {
    if (isDragging) return;
    setTransitionEnabled(true);
    setDragDistance(120);
    setTimeout(() => {
      prevSlide();
      setTransitionEnabled(false);
      setDragDistance(0);
      requestAnimationFrame(() => setTransitionEnabled(true));
    }, 200);
  };
  // Enhanced mouse and touch handlers with better sensitivity
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setTransitionEnabled(false);
    setStartX(clientX);
    setDragDistance(0);
    setVelocity(0);
    setLastMoveTime(Date.now());
    setLastMoveX(clientX);
    document.body.style.userSelect = 'none'; // Prevent text selection
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    
    const distance = clientX - startX;
    const now = Date.now();
    const timeDelta = now - lastMoveTime;
    
    if (timeDelta > 0) {
      const newVelocity = (clientX - lastMoveX) / timeDelta;
      setVelocity(newVelocity);
    }
    
    setDragDistance(distance);
    setLastMoveTime(now);
    setLastMoveX(clientX);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const threshold = 40; // Reduced threshold for easier sliding
    const velocityThreshold = 0.3; // Lower velocity threshold
    
    // Check if we should slide based on distance or velocity
    const shouldSlide = Math.abs(dragDistance) > threshold || Math.abs(velocity) > velocityThreshold;
    
    setIsDragging(false);

    if (shouldSlide) {
      // Determine direction using distance + velocity for momentum feel
      const directionValue = dragDistance + velocity * 150;
      const sign = directionValue > 0 ? 1 : -1;

      // Commit animation: slide a bit further in the drag direction
      setTransitionEnabled(true);
      setDragDistance(sign * 120);

      // After the commit animation, update index and snap back without transition
      setTimeout(() => {
        if (sign > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
        // Jump back to neutral without animation
        setTransitionEnabled(false);
        setDragDistance(0);
        // Re-enable transitions on next frame
        requestAnimationFrame(() => setTransitionEnabled(true));
      }, 200);
    } else {
      // Just snap back if below threshold
      setTransitionEnabled(true);
      setDragDistance(0);
    }

    // Defer resetting other drag state so the new slide "sticks" visually
    requestAnimationFrame(() => {
      setVelocity(0);
      document.body.style.userSelect = '';
    });
  };

  // Mouse events with global event listeners for better tracking
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
    
    // Add global mouse event listeners
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };
    
    const handleGlobalMouseUp = () => {
      handleEnd();
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // This is now handled by global listeners
  };

  const handleMouseUp = () => {
    // This is now handled by global listeners
  };

  const handleMouseLeave = () => {
    // Keep dragging even when leaving the element if mouse is down
  };

  // Touch events with improved handling
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    goPrev();
  } else if (e.key === 'ArrowRight') {
    goNext();
  }
  };

  const getVisiblePlayers = () => {
    const players = [];
    // Show 2 items before current, current item, and 2 items after
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + topLivePlayers.length) % topLivePlayers.length;
      players.push({ 
        ...topLivePlayers[index], 
        displayRank: topLivePlayers[index].rank,
        position: i, // -2, -1, 0, 1, 2 where 0 is center
        scale: i === 0 ? 1.2 : Math.abs(i) === 1 ? 0.9 : 0.7,
        opacity: i === 0 ? 1 : Math.abs(i) === 1 ? 0.7 : 0.4,
        zIndex: i === 0 ? 30 : Math.abs(i) === 1 ? 20 : 10
      });
    }
    return players;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'LIVE';
      case 'online': return 'ONLINE';
      case 'away': return 'AWAY';
      default: return 'OFFLINE';
    }
  };

  return (
    <div className="relative mb-8 group">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold gradient-text">Top 5 Live Players</h2>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/flocktube')}
            className="text-primary hover:bg-primary/10"
          >
            <Monitor className="w-4 h-4 mr-2" />
            View All Live
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goPrev}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goNext}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div 
        className="relative overflow-hidden rounded-2xl focus:outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div 
          className="flex items-center justify-center min-w-0 cursor-grab active:cursor-grabbing select-none touch-pan-y py-8"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateX(${dragDistance}px)`,
            transition: transitionEnabled ? 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {getVisiblePlayers().map((player, index) => {
            const position = player.position;
            const isCurrent = position === 0;
            
            return (
              <div
                key={`${player.id}-${currentIndex}`}
                className={`relative flex-shrink-0 transition-all duration-700 ease-out mx-4 ${
                  isCurrent ? 'w-80 lg:w-96 h-48 lg:h-60' : 'w-48 lg:w-60 h-32 lg:h-40'
                }`}
                style={{
                  transform: `scale(${player.scale}) ${isCurrent ? 'translateY(-15px)' : `translateX(${position * 20}px)`}`,
                  opacity: player.opacity,
                  zIndex: player.zIndex,
                  filter: isCurrent ? 'drop-shadow(0 25px 35px rgba(0, 0, 0, 0.5))' : 'none'
                }}
              >
                {/* Prominence Glow for Current Item */}
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-green/30 to-neon-cyan/30 rounded-xl blur-2xl -z-10 animate-pulse" />
                )}
                
                {/* Rank Number */}
                <div className="absolute top-4 left-4 z-20">
                  <div className="relative">
                    <span className="text-6xl font-black text-white/20 select-none">
                      {player.displayRank}
                    </span>
                    <span className="absolute inset-0 text-6xl font-black gradient-text select-none">
                      {player.displayRank}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(player.status)} animate-pulse`} />
                    <span className="text-xs font-semibold text-white bg-black/50 px-2 py-1 rounded">
                      {getStatusText(player.status)}
                    </span>
                  </div>
                </div>

                {/* Player Card */}
                <div 
                  className="relative w-full h-full gaming-card overflow-hidden rounded-xl cursor-pointer group/card"
                  onClick={() => {
                    if (player.status === 'live') {
                      navigate(`/flocktube?player=${encodeURIComponent(player.username)}`);
                    }
                  }}
                >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover/card:scale-110"
                    style={{ backgroundImage: `url(${player.avatarUrl})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-4 text-white z-10">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <h3 className="font-bold text-lg leading-tight">{player.username}</h3>
                      </div>
                      
                      {isCurrent && (
                        <p className="text-sm text-white/80 leading-tight">Playing {player.currentGame}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-3 h-3" />
                          <span>{player.wins.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{player.earnings}</span>
                        </div>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs bg-neon-green/20 text-neon-green border-neon-green/30">
                        {player.winRate}% Win Rate
                      </Badge>
                    </div>
                  </div>

                  {/* Challenge Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-black/20">
                    {player.status === 'live' ? (
                      <Button 
                        size="sm" 
                        className="bg-destructive/90 backdrop-blur-sm hover:bg-destructive text-white border-destructive/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/flocktube?player=${encodeURIComponent(player.username)}`);
                        }}
                      >
                        <Monitor className="w-4 h-4 mr-2" />
                        Watch Live
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast({
                            title: `Challenge ${player.username}`,
                            description: `Send challenge to rank #${player.rank} player`,
                          });
                        }}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Challenge Player
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {topLivePlayers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-neon-cyan' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
