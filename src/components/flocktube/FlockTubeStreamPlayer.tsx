import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, Settings, Maximize, Users, Wifi, WifiOff } from 'lucide-react';
import Hls from 'hls.js';

interface FlockTubeStreamPlayerProps {
  streamUrl: string;
  hlsUrl?: string;
  dashUrl?: string;
  streamType: 'external' | 'flocktube';
  title: string;
  viewerCount?: number;
  isLive: boolean;
  className?: string;
}

export default function FlockTubeStreamPlayer({
  streamUrl,
  hlsUrl,
  dashUrl,
  streamType,
  title,
  viewerCount = 0,
  isLive,
  className = ''
}: FlockTubeStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamQuality, setStreamQuality] = useState('auto');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Initialize HLS player for FlockTube streams
  useEffect(() => {
    if (streamType === 'flocktube' && hlsUrl && videoRef.current) {
      const video = videoRef.current;
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        
        hlsRef.current = hls;
        
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setConnectionStatus('connected');
          setError(null);
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data);
          setError(`Stream error: ${data.details}`);
          setConnectionStatus('disconnected');
        });
        
        hls.on(Hls.Events.FRAG_LOADED, () => {
          setConnectionStatus('connected');
        });
        
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        video.src = hlsUrl;
        setConnectionStatus('connected');
      } else {
        setError('HLS not supported in this browser');
        setConnectionStatus('disconnected');
      }
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamType, hlsUrl]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Handle quality change
  const handleQualityChange = (quality: string) => {
    if (hlsRef.current && quality !== 'auto') {
      const levels = hlsRef.current.levels;
      const levelIndex = levels.findIndex(level => level.height === parseInt(quality));
      if (levelIndex !== -1) {
        hlsRef.current.currentLevel = levelIndex;
      }
    } else if (hlsRef.current) {
      hlsRef.current.currentLevel = -1; // Auto quality
    }
    setStreamQuality(quality);
  };

  // Get available quality levels
  const getQualityLevels = () => {
    if (hlsRef.current) {
      return hlsRef.current.levels.map(level => ({
        value: level.height.toString(),
        label: `${level.height}p`
      }));
    }
    return [];
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black">
          {/* Video Player */}
          {streamType === 'flocktube' ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="/placeholder-stream.jpg"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onVolumeChange={(e) => {
                const target = e.target as HTMLVideoElement;
                setVolume(target.volume);
                setIsMuted(target.muted);
              }}
              onFullscreenChange={() => setIsFullscreen(!!document.fullscreenElement)}
            />
          ) : (
            <iframe
              src={streamUrl}
              className="w-full h-full"
              allowFullScreen
              title={title}
            />
          )}

          {/* Stream Status Overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge 
              variant={isLive ? "destructive" : "secondary"}
              className="flex items-center gap-1"
            >
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
              {isLive ? 'LIVE' : 'OFFLINE'}
            </Badge>
            
            {streamType === 'flocktube' && (
              <Badge variant="outline" className="flex items-center gap-1">
                {connectionStatus === 'connected' ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                {connectionStatus}
              </Badge>
            )}
          </div>

          {/* Viewer Count */}
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {viewerCount.toLocaleString()}
            </Badge>
          </div>

          {/* Error Message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white">
                <WifiOff className="w-12 h-12 mx-auto mb-2 text-red-500" />
                <p className="text-lg font-semibold">Stream Unavailable</p>
                <p className="text-sm text-gray-300">{error}</p>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          {streamType === 'flocktube' && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                {/* Play/Pause Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Quality Selector */}
                <select
                  value={streamQuality}
                  onChange={(e) => handleQualityChange(e.target.value)}
                  className="bg-black/50 text-white text-sm px-2 py-1 rounded border border-white/30"
                >
                  <option value="auto">Auto</option>
                  {getQualityLevels().map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>

                {/* Fullscreen Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Stream Title */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-semibold text-lg drop-shadow-lg">
              {title}
            </h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}





