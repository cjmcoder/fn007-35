import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AccountSettings: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Row 1: KYC + Premium */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Verify Account (KYC) */}
        <Card className="bg-card/40 border-border">
          <CardHeader className="pb-3">
            <CardTitle>Verify Account (KYC)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Current status</div>
                <div className="mt-1">
                  <Badge variant="secondary">Not verified</Badge>
                </div>
              </div>
              <Button>Start / Resume</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Verification helps keep the community safe and may be required before
              withdrawals.
            </p>
          </CardContent>
        </Card>

        {/* Go Premium */}
        <Card className="bg-card/40 border-border">
          <CardHeader className="pb-3">
            <CardTitle>Go Premium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Plan</div>
                <div className="mt-1 font-medium">Free</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="mt-1 font-medium">$3.99 / bi-weekly</div>
              </div>
            </div>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Priority support</li>
              <li>Exclusive tournaments</li>
              <li>Reduced platform fees</li>
            </ul>
            <div className="flex gap-2">
              <Button className="flex-1">Upgrade to Premium</Button>
              <Button variant="outline" className="flex-1" disabled>
                Cancel Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Preferred Game + Watched Games */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Preferred Game */}
        <Card className="bg-card/40 border-border">
          <CardHeader className="pb-3">
            <CardTitle>Preferred Game</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="preferred-game">Select your primary game</Label>
              <Select>
                <SelectTrigger id="preferred-game">
                  <SelectValue placeholder="Choose a game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="madden25">Madden NFL 25</SelectItem>
                  <SelectItem value="nba2k25">NBA 2K25</SelectItem>
                  <SelectItem value="fc25">EA FC 25</SelectItem>
                  <SelectItem value="cod">Call of Duty</SelectItem>
                  <SelectItem value="fortnite">Fortnite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button>Save</Button>
            </div>
          </CardContent>
        </Card>

        {/* Watched Games */}
        <Card className="bg-card/40 border-border">
          <CardHeader className="pb-3">
            <CardTitle>Watched Games</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add games you like to follow. This helps personalize your feed.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Madden NFL 25",
                "NBA 2K25",
                "EA FC 25",
                "CoD",
                "Fortnite",
                "Apex Legends",
                "Rocket League",
              ].map((g) => (
                <Button key={g} variant="secondary" size="sm">
                  {g}
                </Button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button>Save</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Edit Profile */}
      <Card className="bg-card/40 border-border">
        <CardHeader className="pb-3">
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 border border-border">
              <AvatarImage alt="Profile avatar preview" src="/placeholder.svg" />
              <AvatarFallback>GG</AvatarFallback>
            </Avatar>
            <div className="grid gap-2">
              <Label htmlFor="avatar">Avatar</Label>
              <Input id="avatar" type="file" accept="image/*" />
              <p className="text-xs text-muted-foreground">PNG/JPG up to 2MB.</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell others about your playstyle, favorite teams, etc." />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="psn">PSN</Label>
              <Input id="psn" placeholder="Your PSN ID" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gamer-tag">Gamer TAG PC/XBOX/PS</Label>
              <Input id="gamer-tag" placeholder="Your PC/Xbox/PS Gamertag" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="twitch">Twitch stream ID</Label>
              <Input id="twitch" placeholder="Your Twitch stream ID" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button>Save Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Row 4: Account + Password + Username */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Edit Account */}
        <Card className="bg-card/40 border-border">
          <CardHeader className="pb-3">
            <CardTitle>Edit Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@email.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="(555) 000-0000" />
            </div>
            <div className="text-xs text-muted-foreground">Last login: Aug 12, 2025 14:22</div>
            <div className="flex justify-end">
              <Button>Save Account</Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Password */}
        <Card className="bg-card/40 border-border">
          <CardHeader className="pb-3">
            <CardTitle>Edit Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <div className="flex justify-end">
              <Button>Update Password</Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Username */}
        <Card className="bg-card/40 border-border">
          <CardHeader className="pb-3">
            <CardTitle>Change Username</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="username">New username</Label>
              <Input id="username" placeholder="Your new unique username" />
              <p className="text-xs text-muted-foreground">
                Must be unique. Changes are rate-limited.
              </p>
            </div>
            <div className="flex justify-end">
              <Button>Change Username</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Message Settings */}
      <Card className="bg-card/40 border-border">
        <CardHeader className="pb-3">
          <CardTitle>Message Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="font-medium">Direct Messages</div>
                <div className="text-sm text-muted-foreground">Allow players to DM you</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="font-medium">Match Alerts</div>
                <div className="text-sm text-muted-foreground">Reminders and results updates</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="font-medium">Promotional Emails</div>
                <div className="text-sm text-muted-foreground">Offers and product updates</div>
              </div>
              <Switch />
            </div>
            <div className="rounded-md border border-border p-3 space-y-2">
              <div className="font-medium">Do Not Disturb</div>
              <div className="text-sm text-muted-foreground">Silence notifications during these hours</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="dnd-start">Start</Label>
                  <Input id="dnd-start" type="time" defaultValue="22:00" />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="dnd-end">End</Label>
                  <Input id="dnd-end" type="time" defaultValue="07:00" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
