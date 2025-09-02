import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Palette, Globe, Gamepad2, Sparkles } from 'lucide-react';

export function PreferencesSettings() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'en',
    showUnityGames: true,
    showConsoleGames: true,
    showPropsFeeds: true,
    autoPlayVideos: false,
    experimentalFeatures: false,
    compactMode: false,
    showAnimations: true
  });

  const handleSave = () => {
    toast({
      title: "Preferences saved",
      description: "Your app preferences have been updated.",
    });
  };

  const updatePreference = (key: string, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">App Preferences</h2>
        <p className="text-muted-foreground">Customize your FLOCKNODE experience</p>
      </div>

      {/* Appearance */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Appearance</span>
          </CardTitle>
          <CardDescription>Customize the look and feel of the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <Select 
              value={preferences.theme} 
              onValueChange={(value) => updatePreference('theme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark (Recommended)</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              Dark theme is optimized for gaming and reduces eye strain
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Compact Mode</div>
              <div className="text-sm text-muted-foreground">Show more content in less space</div>
            </div>
            <Switch 
              checked={preferences.compactMode} 
              onCheckedChange={(value) => updatePreference('compactMode', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Show Animations</div>
              <div className="text-sm text-muted-foreground">Enable smooth transitions and effects</div>
            </div>
            <Switch 
              checked={preferences.showAnimations} 
              onCheckedChange={(value) => updatePreference('showAnimations', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Language & Region</span>
          </CardTitle>
          <CardDescription>Set your preferred language and regional settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Select 
              value={preferences.language} 
              onValueChange={(value) => updatePreference('language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español (Coming Soon)</SelectItem>
                <SelectItem value="fr">Français (Coming Soon)</SelectItem>
                <SelectItem value="de">Deutsch (Coming Soon)</SelectItem>
                <SelectItem value="pt">Português (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Game Feed Filters */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gamepad2 className="h-5 w-5" />
            <span>Game Feed Preferences</span>
          </CardTitle>
          <CardDescription>Choose what types of games and content to show</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Unity Games</div>
              <div className="text-sm text-muted-foreground">Show Arena Warriors and other Unity-based games</div>
            </div>
            <Switch 
              checked={preferences.showUnityGames} 
              onCheckedChange={(value) => updatePreference('showUnityGames', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Console Games</div>
              <div className="text-sm text-muted-foreground">Show Madden, FIFA, and other console titles</div>
            </div>
            <Switch 
              checked={preferences.showConsoleGames} 
              onCheckedChange={(value) => updatePreference('showConsoleGames', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Skill Props Feeds</div>
              <div className="text-sm text-muted-foreground">Display live skill props and betting opportunities</div>
            </div>
            <Switch 
              checked={preferences.showPropsFeeds} 
              onCheckedChange={(value) => updatePreference('showPropsFeeds', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Auto-play Videos</div>
              <div className="text-sm text-muted-foreground">Automatically play video highlights and streams</div>
            </div>
            <Switch 
              checked={preferences.autoPlayVideos} 
              onCheckedChange={(value) => updatePreference('autoPlayVideos', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Experimental Features */}
      <Card className="gaming-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Experimental Features</span>
          </CardTitle>
          <CardDescription>Get early access to new features (may be unstable)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Beta Features</div>
              <div className="text-sm text-muted-foreground">
                Enable experimental features and early previews
              </div>
            </div>
            <Switch 
              checked={preferences.experimentalFeatures} 
              onCheckedChange={(value) => updatePreference('experimentalFeatures', value)}
            />
          </div>

          {preferences.experimentalFeatures && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="text-sm text-primary font-medium mb-1">Beta Features Enabled</div>
              <div className="text-xs text-muted-foreground">
                You'll see new features before they're released to everyone. Some features may not work perfectly.
                You can disable this at any time.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Notice */}
      <Card className="gaming-card">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Performance Tips:</strong> Disabling animations and enabling compact mode can improve performance on slower devices.
            </p>
            <p>
              Changes to theme and language will take effect immediately. Other preferences may require a page refresh.
            </p>
          </div>
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