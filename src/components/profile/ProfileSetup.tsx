import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Upload, Save, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usersApi } from "@/lib/api-client";

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: Partial<UserProfile>;
}

interface UserProfile {
  username: string;
  email: string;
  bio: string;
  region: string;
  preferredGame: string;
  gamingPlatforms: string[];
  avatarUrl?: string;
  socialLinks: {
    twitch?: string;
    youtube?: string;
    discord?: string;
    twitter?: string;
  };
  gamingIds: {
    psn?: string;
    xbox?: string;
    steam?: string;
    epic?: string;
  };
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    showStats: boolean;
  };
}

const REGIONS = [
  "North America",
  "South America", 
  "Europe",
  "Asia",
  "Oceania",
  "Africa"
];

const GAMES = [
  "Madden NFL 25",
  "NBA 2K25",
  "FIFA 25",
  "Call of Duty: Modern Warfare III",
  "Rocket League",
  "Valorant",
  "Counter-Strike 2",
  "Fortnite",
  "Apex Legends",
  "League of Legends"
];

const PLATFORMS = [
  "PlayStation 5",
  "PlayStation 4", 
  "Xbox Series X/S",
  "Xbox One",
  "PC (Steam)",
  "PC (Epic Games)",
  "Nintendo Switch",
  "Mobile"
];

export const ProfileSetup = ({ onComplete, initialProfile }: ProfileSetupProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    username: initialProfile?.username || "",
    email: initialProfile?.email || "",
    bio: initialProfile?.bio || "",
    region: initialProfile?.region || "North America",
    preferredGame: initialProfile?.preferredGame || "",
    gamingPlatforms: initialProfile?.gamingPlatforms || [],
    avatarUrl: initialProfile?.avatarUrl || "",
    socialLinks: initialProfile?.socialLinks || {},
    gamingIds: initialProfile?.gamingIds || {},
    preferences: {
      notifications: true,
      publicProfile: true,
      showStats: true,
      ...initialProfile?.preferences
    }
  });

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await usersApi.updateProfile(profile);
      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });
      onComplete(profile);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile.avatarUrl} />
            <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={profile.username}
              onChange={(e) => updateProfile({ username: e.target.value })}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile({ email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => updateProfile({ bio: e.target.value })}
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <Select value={profile.region} onValueChange={(value) => updateProfile({ region: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredGame">Preferred Game *</Label>
            <Select value={profile.preferredGame} onValueChange={(value) => updateProfile({ preferredGame: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select game" />
              </SelectTrigger>
              <SelectContent>
                {GAMES.map((game) => (
                  <SelectItem key={game} value={game}>
                    {game}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Gaming Platforms & IDs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Gaming Platforms</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PLATFORMS.map((platform) => (
              <Button
                key={platform}
                variant={profile.gamingPlatforms.includes(platform) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const platforms = profile.gamingPlatforms.includes(platform)
                    ? profile.gamingPlatforms.filter(p => p !== platform)
                    : [...profile.gamingPlatforms, platform];
                  updateProfile({ gamingPlatforms: platforms });
                }}
                className="text-xs"
              >
                {platform}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="psn">PlayStation ID</Label>
            <Input
              id="psn"
              value={profile.gamingIds.psn || ""}
              onChange={(e) => updateProfile({ 
                gamingIds: { ...profile.gamingIds, psn: e.target.value }
              })}
              placeholder="PSN Username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="xbox">Xbox Gamertag</Label>
            <Input
              id="xbox"
              value={profile.gamingIds.xbox || ""}
              onChange={(e) => updateProfile({ 
                gamingIds: { ...profile.gamingIds, xbox: e.target.value }
              })}
              placeholder="Xbox Gamertag"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="steam">Steam ID</Label>
            <Input
              id="steam"
              value={profile.gamingIds.steam || ""}
              onChange={(e) => updateProfile({ 
                gamingIds: { ...profile.gamingIds, steam: e.target.value }
              })}
              placeholder="Steam Username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="epic">Epic Games ID</Label>
            <Input
              id="epic"
              value={profile.gamingIds.epic || ""}
              onChange={(e) => updateProfile({ 
                gamingIds: { ...profile.gamingIds, epic: e.target.value }
              })}
              placeholder="Epic Games Username"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Social Links & Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="twitch">Twitch</Label>
            <Input
              id="twitch"
              value={profile.socialLinks.twitch || ""}
              onChange={(e) => updateProfile({ 
                socialLinks: { ...profile.socialLinks, twitch: e.target.value }
              })}
              placeholder="twitch.tv/username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              value={profile.socialLinks.youtube || ""}
              onChange={(e) => updateProfile({ 
                socialLinks: { ...profile.socialLinks, youtube: e.target.value }
              })}
              placeholder="youtube.com/@username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discord">Discord</Label>
            <Input
              id="discord"
              value={profile.socialLinks.discord || ""}
              onChange={(e) => updateProfile({ 
                socialLinks: { ...profile.socialLinks, discord: e.target.value }
              })}
              placeholder="username#1234"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter/X</Label>
            <Input
              id="twitter"
              value={profile.socialLinks.twitter || ""}
              onChange={(e) => updateProfile({ 
                socialLinks: { ...profile.socialLinks, twitter: e.target.value }
              })}
              placeholder="@username"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Privacy & Preferences</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Public Profile</div>
                <div className="text-sm text-muted-foreground">Allow others to view your profile</div>
              </div>
              <Button
                variant={profile.preferences.publicProfile ? "default" : "outline"}
                size="sm"
                onClick={() => updateProfile({
                  preferences: { ...profile.preferences, publicProfile: !profile.preferences.publicProfile }
                })}
              >
                {profile.preferences.publicProfile ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Show Stats</div>
                <div className="text-sm text-muted-foreground">Display your match statistics publicly</div>
              </div>
              <Button
                variant={profile.preferences.showStats ? "default" : "outline"}
                size="sm"
                onClick={() => updateProfile({
                  preferences: { ...profile.preferences, showStats: !profile.preferences.showStats }
                })}
              >
                {profile.preferences.showStats ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notifications</div>
                <div className="text-sm text-muted-foreground">Receive match and platform notifications</div>
              </div>
              <Button
                variant={profile.preferences.notifications ? "default" : "outline"}
                size="sm"
                onClick={() => updateProfile({
                  preferences: { ...profile.preferences, notifications: !profile.preferences.notifications }
                })}
              >
                {profile.preferences.notifications ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return profile.username && profile.email && profile.region && profile.preferredGame;
      case 2:
        return true; // Optional step
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-text mb-2">Complete Your Profile</h1>
        <p className="text-muted-foreground">Set up your gaming profile to start competing</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step <= currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              disabled={!isStepValid(currentStep)}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={loading || !isStepValid(1)}
              className="bg-gradient-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};























