import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';

export function NotificationSettings() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: {
      matchInvites: true,
      tournaments: true,
      rewards: true,
      newsletter: false,
      promotions: false
    },
    push: {
      liveEvents: true,
      balanceUpdates: true,
      challenges: true,
      results: true
    },
    inApp: {
      mentions: true,
      leaderboards: true,
      messages: true,
      systemAlerts: true
    },
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    }
  });

  const handleSave = () => {
    toast({
      title: "Preferences saved",
      description: "Your notification settings have been updated.",
    });
  };

  const updateNotification = (category: keyof typeof notifications, key: string, value: boolean | string) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
        <p className="text-muted-foreground">Control how and when you receive notifications</p>
      </div>

      {/* Email Notifications */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Email Notifications</span>
          </CardTitle>
          <CardDescription>Choose what updates you want to receive via email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Match Invites</div>
              <div className="text-sm text-muted-foreground">Get notified when someone challenges you</div>
            </div>
            <Switch 
              checked={notifications.email.matchInvites} 
              onCheckedChange={(value) => updateNotification('email', 'matchInvites', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Tournament Updates</div>
              <div className="text-sm text-muted-foreground">Tournament starts, bracket updates, results</div>
            </div>
            <Switch 
              checked={notifications.email.tournaments} 
              onCheckedChange={(value) => updateNotification('email', 'tournaments', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Rewards & Earnings</div>
              <div className="text-sm text-muted-foreground">FC balance updates and prize notifications</div>
            </div>
            <Switch 
              checked={notifications.email.rewards} 
              onCheckedChange={(value) => updateNotification('email', 'rewards', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Newsletter</div>
              <div className="text-sm text-muted-foreground">Weekly roundup of platform highlights</div>
            </div>
            <Switch 
              checked={notifications.email.newsletter} 
              onCheckedChange={(value) => updateNotification('email', 'newsletter', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Promotional Emails</div>
              <div className="text-sm text-muted-foreground">Special offers and new feature announcements</div>
            </div>
            <Switch 
              checked={notifications.email.promotions} 
              onCheckedChange={(value) => updateNotification('email', 'promotions', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Push Notifications</span>
          </CardTitle>
          <CardDescription>Real-time notifications on your device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Live Event Alerts</div>
              <div className="text-sm text-muted-foreground">When tournaments you're interested in start</div>
            </div>
            <Switch 
              checked={notifications.push.liveEvents} 
              onCheckedChange={(value) => updateNotification('push', 'liveEvents', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">FC Balance Updates</div>
              <div className="text-sm text-muted-foreground">When your balance changes</div>
            </div>
            <Switch 
              checked={notifications.push.balanceUpdates} 
              onCheckedChange={(value) => updateNotification('push', 'balanceUpdates', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Challenge Notifications</div>
              <div className="text-sm text-muted-foreground">New challenges and match requests</div>
            </div>
            <Switch 
              checked={notifications.push.challenges} 
              onCheckedChange={(value) => updateNotification('push', 'challenges', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Results & Outcomes</div>
              <div className="text-sm text-muted-foreground">Match results and tournament standings</div>
            </div>
            <Switch 
              checked={notifications.push.results} 
              onCheckedChange={(value) => updateNotification('push', 'results', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>In-App Notifications</span>
          </CardTitle>
          <CardDescription>Notifications within the FLOCKNODE app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Squawkbox Mentions</div>
              <div className="text-sm text-muted-foreground">When someone mentions you in chat</div>
            </div>
            <Switch 
              checked={notifications.inApp.mentions} 
              onCheckedChange={(value) => updateNotification('inApp', 'mentions', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Leaderboard Updates</div>
              <div className="text-sm text-muted-foreground">When your ranking changes</div>
            </div>
            <Switch 
              checked={notifications.inApp.leaderboards} 
              onCheckedChange={(value) => updateNotification('inApp', 'leaderboards', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Direct Messages</div>
              <div className="text-sm text-muted-foreground">Private messages from other players</div>
            </div>
            <Switch 
              checked={notifications.inApp.messages} 
              onCheckedChange={(value) => updateNotification('inApp', 'messages', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">System Alerts</div>
              <div className="text-sm text-muted-foreground">Important platform updates and maintenance</div>
            </div>
            <Switch 
              checked={notifications.inApp.systemAlerts} 
              onCheckedChange={(value) => updateNotification('inApp', 'systemAlerts', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Do Not Disturb */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Do Not Disturb</span>
          </CardTitle>
          <CardDescription>Set quiet hours for notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Enable Do Not Disturb</div>
              <div className="text-sm text-muted-foreground">Mute notifications during specified hours</div>
            </div>
            <Switch 
              checked={notifications.doNotDisturb.enabled} 
              onCheckedChange={(value) => updateNotification('doNotDisturb', 'enabled', value)}
            />
          </div>
          
          {notifications.doNotDisturb.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Select 
                  value={notifications.doNotDisturb.startTime} 
                  onValueChange={(value) => updateNotification('doNotDisturb', 'startTime', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Select 
                  value={notifications.doNotDisturb.endTime} 
                  onValueChange={(value) => updateNotification('doNotDisturb', 'endTime', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}