// FLOCKNODE Live Squawkbox Component
// Real-time messaging, activity feed, and online stats

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  RefreshCw,
  Users,
  Activity,
  MessageSquare,
  TrendingUp,
  Trophy,
  DollarSign,
  Clock,
  Crown,
  Shield,
  Star
} from 'lucide-react';
import { 
  useSquawkboxMessages, 
  useSquawkboxActivity, 
  useSquawkboxOnline,
  useSquawkboxChannels 
} from '@/services/squawkboxService';
import { cn } from '@/lib/utils';

interface LiveSquawkboxProps {
  className?: string;
  defaultChannel?: string;
}

export const LiveSquawkbox: React.FC<LiveSquawkboxProps> = ({ 
  className,
  defaultChannel = 'general' 
}) => {
  const [currentChannel, setCurrentChannel] = useState(defaultChannel);
  const [messageInput, setMessageInput] = useState('');
  
  const { channels, loading: channelsLoading } = useSquawkboxChannels();
  const { messages, loading: messagesLoading, sendMessage, refresh: refreshMessages } = useSquawkboxMessages(currentChannel);
  const { activities, loading: activitiesLoading, refresh: refreshActivities } = useSquawkboxActivity();
  const { stats, loading: statsLoading, refresh: refreshOnline } = useSquawkboxOnline();

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    const result = await sendMessage(messageInput);
    if (result.success) {
      setMessageInput('');
      // Refresh messages immediately
      setTimeout(() => refreshMessages(), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'vip':
        return <Crown className="w-3 h-3" />;
      case 'pro':
        return <Trophy className="w-3 h-3" />;
      case 'verified':
        return <Star className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match_created':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'match_completed':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'prop_bet':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'tournament_joined':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'match_joined':
        return <Users className="w-4 h-4 text-cyan-500" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold gradient-text flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>SQUAWKBOX</span>
          </CardTitle>
          {stats && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-500">
              <Users className="w-3 h-3 mr-1" />
              {stats.online} online
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          <TabsList className="w-full grid grid-cols-2 px-3 pt-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0 p-3 space-y-3">
            {/* Channel Selector */}
            <Select value={currentChannel} onValueChange={setCurrentChannel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Channel" />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.name}
                    {channel.online && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({channel.online} online)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Messages */}
            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-3">
                {messagesLoading && messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No messages yet. Be the first to chat!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "flex items-start space-x-2 p-2 rounded-lg",
                        msg.type === 'system' && "bg-primary/10 border border-primary/20"
                      )}
                    >
                      <Avatar className="w-8 h-8 border border-border">
                        <AvatarFallback className="bg-gradient-primary text-background text-xs font-bold">
                          {msg.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1 mb-0.5">
                          <span className="text-sm font-medium text-primary">
                            {msg.displayName}
                          </span>
                          
                          {msg.badges && msg.badges.length > 0 && (
                            <div className="flex items-center space-x-1">
                              {msg.badges.map((badge, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="secondary" 
                                  className="text-xs h-5 px-1"
                                >
                                  {getBadgeIcon(badge)}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <Badge variant="outline" className="text-xs h-5">
                            Lvl {msg.level}
                          </Badge>
                          
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-foreground break-words">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  maxLength={500}
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-gradient-primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={refreshMessages}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {messageInput.length}/500
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="flex-1 flex flex-col mt-0 p-3">
            {/* Activity Feed Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Live Activity</h3>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={refreshActivities}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Activity Feed */}
            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-2">
                {activitiesLoading && activities.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Loading activity...
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No recent activity
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start space-x-2 p-2 rounded-lg bg-card/50 hover:bg-card border border-border/50"
                    >
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1 mb-0.5">
                          {activity.user && (
                            <span className="text-sm font-medium text-primary">
                              {activity.user}
                            </span>
                          )}
                          {activity.winner && (
                            <span className="text-sm font-medium text-green-500">
                              {activity.winner}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {activity.message}
                          </span>
                        </div>
                        
                        {activity.game && (
                          <div className="text-xs text-muted-foreground">
                            {activity.game}
                          </div>
                        )}
                        
                        {activity.tournament && (
                          <div className="text-xs text-muted-foreground">
                            {activity.tournament}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 mt-1">
                          {activity.entryFee && (
                            <Badge variant="secondary" className="text-xs">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {activity.entryFee} FC
                            </Badge>
                          )}
                          {activity.earnings && (
                            <Badge className="bg-green-500/20 text-green-500 text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              +{activity.earnings} FC
                            </Badge>
                          )}
                          {activity.amount && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.amount} FC
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LiveSquawkbox;





