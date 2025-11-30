import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Check, 
  Video, 
  Settings, 
  Wifi, 
  Monitor, 
  Smartphone,
  ExternalLink,
  Download,
  Info
} from 'lucide-react';

interface FlockTubeStreamingSetupProps {
  matchId: string;
  streamKey: string;
  rtmpUrl: string;
  hlsUrl: string;
  dashUrl: string;
  side: 'p1' | 'p2';
  onStreamStarted?: () => void;
}

interface StreamingSoftware {
  name: string;
  icon: string;
  setupUrl: string;
  description: string;
}

const STREAMING_SOFTWARE: StreamingSoftware[] = [
  {
    name: 'OBS Studio',
    icon: '🎥',
    setupUrl: 'https://obsproject.com/',
    description: 'Free, open-source streaming software'
  },
  {
    name: 'Streamlabs OBS',
    icon: '📺',
    setupUrl: 'https://streamlabs.com/',
    description: 'OBS with built-in widgets and alerts'
  },
  {
    name: 'XSplit',
    icon: '🎬',
    setupUrl: 'https://www.xsplit.com/',
    description: 'Professional streaming software'
  }
];

export default function FlockTubeStreamingSetup({
  matchId,
  streamKey,
  rtmpUrl,
  hlsUrl,
  dashUrl,
  side,
  onStreamStarted
}: FlockTubeStreamingSetupProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<'offline' | 'connecting' | 'live'>('offline');
  const [selectedSoftware, setSelectedSoftware] = useState<string>('obs');

  // Check stream status periodically
  useEffect(() => {
    const checkStreamStatus = async () => {
      try {
        const response = await fetch(`/api/flocktube/streams/${matchId}/status`);
        const data = await response.json();
        setStreamStatus(data.status || 'offline');
        
        if (data.status === 'live' && onStreamStarted) {
          onStreamStarted();
        }
      } catch (error) {
        console.error('Error checking stream status:', error);
      }
    };

    const interval = setInterval(checkStreamStatus, 5000);
    return () => clearInterval(interval);
  }, [matchId, onStreamStarted]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStreamStatusColor = () => {
    switch (streamStatus) {
      case 'live':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStreamStatusText = () => {
    switch (streamStatus) {
      case 'live':
        return 'LIVE';
      case 'connecting':
        return 'CONNECTING';
      default:
        return 'OFFLINE';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stream Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Stream Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStreamStatusColor()} ${streamStatus === 'live' ? 'animate-pulse' : ''}`} />
              <span className="font-semibold">{getStreamStatusText()}</span>
            </div>
            <Badge variant="outline">
              {side.toUpperCase()} Player
            </Badge>
            <Badge variant="secondary">
              Match #{matchId}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Streaming Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Streaming Credentials
          </CardTitle>
          <CardDescription>
            Use these credentials to configure your streaming software
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* RTMP URL */}
          <div className="space-y-2">
            <Label htmlFor="rtmp-url">RTMP URL</Label>
            <div className="flex gap-2">
              <Input
                id="rtmp-url"
                value={rtmpUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(rtmpUrl, 'rtmp')}
              >
                {copiedField === 'rtmp' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Stream Key */}
          <div className="space-y-2">
            <Label htmlFor="stream-key">Stream Key</Label>
            <div className="flex gap-2">
              <Input
                id="stream-key"
                value={streamKey}
                readOnly
                className="font-mono text-sm"
                type="password"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(streamKey, 'key')}
              >
                {copiedField === 'key' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Stream URLs */}
          <div className="space-y-2">
            <Label>Stream URLs</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex gap-2">
                <Input
                  value={hlsUrl}
                  readOnly
                  className="font-mono text-xs"
                  placeholder="HLS URL"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(hlsUrl, 'hls')}
                >
                  {copiedField === 'hls' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={dashUrl}
                  readOnly
                  className="font-mono text-xs"
                  placeholder="DASH URL"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(dashUrl, 'dash')}
                >
                  {copiedField === 'dash' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSoftware} onValueChange={setSelectedSoftware}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="obs">OBS Studio</TabsTrigger>
              <TabsTrigger value="streamlabs">Streamlabs</TabsTrigger>
              <TabsTrigger value="xsplit">XSplit</TabsTrigger>
            </TabsList>
            
            <TabsContent value="obs" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">OBS Studio Setup</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Open OBS Studio</li>
                  <li>Go to <strong>Settings → Stream</strong></li>
                  <li>Set <strong>Service</strong> to "Custom"</li>
                  <li>Paste the <strong>RTMP URL</strong> in the Server field</li>
                  <li>Paste the <strong>Stream Key</strong> in the Stream Key field</li>
                  <li>Click <strong>OK</strong> to save settings</li>
                  <li>Click <strong>Start Streaming</strong> when ready</li>
                </ol>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://obsproject.com/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Download OBS Studio
                  </a>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="streamlabs" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Streamlabs OBS Setup</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Open Streamlabs OBS</li>
                  <li>Go to <strong>Settings → Stream</strong></li>
                  <li>Set <strong>Service</strong> to "Custom"</li>
                  <li>Paste the <strong>RTMP URL</strong> in the Server field</li>
                  <li>Paste the <strong>Stream Key</strong> in the Stream Key field</li>
                  <li>Click <strong>Done</strong> to save settings</li>
                  <li>Click <strong>Go Live</strong> when ready</li>
                </ol>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://streamlabs.com/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Download Streamlabs
                  </a>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="xsplit" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">XSplit Setup</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Open XSplit</li>
                  <li>Go to <strong>Broadcast → Custom RTMP</strong></li>
                  <li>Paste the <strong>RTMP URL</strong> in the Server field</li>
                  <li>Paste the <strong>Stream Key</strong> in the Stream Key field</li>
                  <li>Click <strong>OK</strong> to save settings</li>
                  <li>Click <strong>Start Broadcast</strong> when ready</li>
                </ol>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.xsplit.com/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Download XSplit
                  </a>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tips and Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Tips & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertDescription>
                <strong>Stream Quality:</strong> Use 1080p at 60fps for best results. 
                Minimum recommended: 720p at 30fps.
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertDescription>
                <strong>Bitrate:</strong> Set bitrate to 3000-6000 kbps for 1080p, 
                1500-3000 kbps for 720p.
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertDescription>
                <strong>Audio:</strong> Use 128kbps AAC audio codec for optimal quality.
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertDescription>
                <strong>Network:</strong> Ensure stable internet connection with upload 
                speed of at least 5 Mbps.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Streaming */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Streaming
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              For mobile streaming, you can use apps like Larix Broadcaster or 
              Streamlabs Mobile with the same RTMP credentials.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://apps.apple.com/app/larix-broadcaster/id1042474385" target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Larix (iOS)
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://play.google.com/store/apps/details?id=com.wmspanel.larix_broadcaster" target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Larix (Android)
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





