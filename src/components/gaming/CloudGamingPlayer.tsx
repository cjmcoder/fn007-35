import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, Pause, Settings, Wifi, WifiOff, Gamepad2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CloudGamingSession {
  id: string;
  game: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  latency: number;
  resolution: string;
  bitrate: number;
  playerCount: number;
}

interface CloudGamingPlayerProps {
  sessionId: string;
  game: string;
  onSessionEnd: () => void;
}

export const CloudGamingPlayer: React.FC<CloudGamingPlayerProps> = ({
  sessionId,
  game,
  onSessionEnd
}) => {
  const [session, setSession] = useState<CloudGamingSession>({
    id: sessionId,
    game,
    status: 'connecting',
    latency: 0,
    resolution: '1080p60',
    bitrate: 20,
    playerCount: 1
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate connection process
    const connectToSession = async () => {
      try {
        // Initialize WebRTC connection
        await initializeWebRTC();
        
        // Load Moonlight Web client
        await loadMoonlightClient();
        
        setSession(prev => ({ ...prev, status: 'connected' }));
        
        toast({
          title: "Connected to Cloud Gaming Session",
          description: `Playing ${game} on FLOCKNODE Cloud Gaming`,
        });
      } catch (error) {
        console.error('Connection failed:', error);
        setSession(prev => ({ ...prev, status: 'error' }));
        
        toast({
          title: "Connection Failed",
          description: "Unable to connect to cloud gaming session. Please try again.",
          variant: "destructive"
        });
      }
    };

    connectToSession();

    // Simulate latency monitoring
    const latencyInterval = setInterval(() => {
      setSession(prev => ({
        ...prev,
        latency: Math.floor(Math.random() * 40) + 20 // 20-60ms
      }));
    }, 1000);

    return () => clearInterval(latencyInterval);
  }, [sessionId, game]);

  const initializeWebRTC = async () => {
    // WebRTC signaling and connection setup
    // This would integrate with our signaling server
    return new Promise((resolve) => {
      setTimeout(resolve, 2000); // Simulate connection time
    });
  };

  const loadMoonlightClient = async () => {
    // Load Moonlight Web client into iframe
    // This would be the actual Moonlight Web implementation
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDisconnect = () => {
    setSession(prev => ({ ...prev, status: 'disconnected' }));
    onSessionEnd();
    
    toast({
      title: "Session Ended",
      description: "Cloud gaming session has been terminated.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
            <span className="text-sm font-medium">{getStatusText(session.status)}</span>
          </div>
          
          {session.status === 'connected' && (
            <>
              <div className="flex items-center space-x-1">
                {session.latency < 60 ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
                <span className="text-sm">{session.latency}ms</span>
              </div>
              
              <Badge variant="secondary" className="text-xs">
                {session.resolution}
              </Badge>
              
              <Badge variant="secondary" className="text-xs">
                {session.bitrate} Mbps
              </Badge>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-gray-800"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            className="text-white hover:bg-gray-800"
          >
            <Gamepad2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
            disabled={session.status === 'connecting'}
          >
            End Session
          </Button>
        </div>
      </div>

      {/* Game Container */}
      <div 
        ref={gameContainerRef}
        className="relative w-full h-full min-h-[600px] bg-gradient-to-br from-gray-900 to-black flex items-center justify-center"
      >
        {session.status === 'connecting' && (
          <div className="text-center text-white">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Connecting to {game}</h3>
            <p className="text-gray-400">Setting up cloud gaming session...</p>
          </div>
        )}

        {session.status === 'connected' && (
          <div className="w-full h-full">
            {/* Moonlight Web Client would be embedded here */}
            <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-semibold mb-2">{game}</h3>
                <p className="text-gray-400 mb-4">Cloud Gaming Session Active</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
                  <span>Latency: {session.latency}ms</span>
                  <span>Resolution: {session.resolution}</span>
                  <span>Bitrate: {session.bitrate} Mbps</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {session.status === 'error' && (
          <div className="text-center text-white">
            <WifiOff className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold mb-2">Connection Failed</h3>
            <p className="text-gray-400 mb-4">Unable to connect to cloud gaming session</p>
            <Button onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </div>
        )}
      </div>

      {/* Controller Support Notice */}
      {session.status === 'connected' && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-4 h-4" />
            <span className="text-sm">Controller support enabled via Gamepad API</span>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg w-64">
          <h4 className="font-semibold mb-3">Stream Settings</h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-300">Resolution</label>
              <select className="w-full mt-1 bg-gray-800 text-white rounded px-2 py-1">
                <option value="1080p60">1080p60</option>
                <option value="720p60">720p60</option>
                <option value="1080p30">1080p30</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-300">Bitrate (Mbps)</label>
              <input 
                type="range" 
                min="10" 
                max="50" 
                value={session.bitrate}
                className="w-full mt-1"
              />
              <span className="text-xs text-gray-400">{session.bitrate} Mbps</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


