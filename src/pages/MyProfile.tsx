import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeftNav } from "@/components/layout/LeftNav";
import { TopNav } from "@/components/layout/TopNav";
import { RightSquawkbox } from "@/components/layout/RightSquawkbox";
import Seo from "@/components/Seo";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { EnhancedWalletPanel } from "@/components/profile/EnhancedWalletPanel";
import { EnhancedProfile } from "@/components/profile/EnhancedProfile";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { MatchPerformanceStats } from "@/components/profile/MatchPerformanceStats";
import { ChallengesEventsSection } from "@/components/profile/ChallengesEventsSection";
import { SupportQuickLinks } from "@/components/profile/SupportQuickLinks";
import { QuickActions } from "@/components/profile/QuickActions";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { EventsCalendar } from "@/components/profile/EventsCalendar";
import { FindMatches } from "@/components/profile/FindMatches";
import { MatchHistory } from "@/components/profile/MatchHistory";
import { ProfilePayments } from "@/components/profile/ProfilePayments";
import { MailInbox } from "@/components/profile/MailInbox";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const records = [
  { date: "08/10/25", opponent: "Useronly757", game: "Madden NFL 25 | PS5-XBX/S-PC", result: "W", wager: "$10.00", payout: "$19.00", status: "Settled" },
  { date: "08/09/25", opponent: "GeoAletras", game: "Madden NFL 25 | PS5-XBX/S-PC", result: "L", wager: "$7.00", payout: "$0.00", status: "Settled" },
  { date: "08/08/25", opponent: "Qwinch15", game: "NBA 2K25 | PS5-XBX/S", result: "W", wager: "$5.00", payout: "$9.50", status: "Settled" },
];

export default function MyProfile() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const initialTab = tab === 'matches' ? 'matches' : 
                     tab === 'rewards' ? 'rewards' : 
                     tab === 'events' ? 'events' : 
                     tab === 'streams' ? 'streams' :
                     tab === 'mail' ? 'mail' :
                     tab === 'payments' ? 'payments' :
                     tab === 'account' ? 'account' :
                     tab === 'security' ? 'security' :
                     tab === 'notifications' ? 'notifications' :
                     tab === 'privacy' ? 'privacy' :
                     tab === 'preferences' ? 'preferences' : 'overview';
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Seo 
        title="My Profile – Player Profile"
        description="View your profile, match history, messages, and disputes."
        canonicalUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        <LeftNav />

        <main className="flex-1 overflow-y-auto pb-24">
          {/* Profile Header */}
          <header className="p-4 lg:p-6 pb-0">
            <ProfileHeader />
          </header>

          {/* Enhanced Wallet Panel */}
          <div className="py-8 lg:py-10">
            <EnhancedWalletPanel />
          </div>

          {/* Main Content Tabs */}
          <section className="px-4 lg:px-6 pb-6">
            <Tabs defaultValue={initialTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 lg:grid-cols-8 h-auto">
                <TabsTrigger value="overview" className="text-xs lg:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="matches" className="text-xs lg:text-sm">Matches</TabsTrigger>
                <TabsTrigger value="rewards" className="text-xs lg:text-sm">Rewards</TabsTrigger>
                <TabsTrigger value="events" className="text-xs lg:text-sm lg:block hidden">Events</TabsTrigger>
                <TabsTrigger value="streams" className="text-xs lg:text-sm lg:block hidden">Streams</TabsTrigger>
                <TabsTrigger value="mail" className="text-xs lg:text-sm lg:block hidden">Mail</TabsTrigger>
                <TabsTrigger value="payments" className="text-xs lg:text-sm lg:block hidden">Payments</TabsTrigger>
                <TabsTrigger value="account" className="text-xs lg:text-sm lg:block hidden">Account</TabsTrigger>
              </TabsList>

              {/* Mobile-only secondary tabs */}
              <div className="lg:hidden mt-2 space-y-2">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
                  <TabsTrigger value="streams" className="text-xs">Streams</TabsTrigger>
                  <TabsTrigger value="mail" className="text-xs">Mail</TabsTrigger>
                  <TabsTrigger value="payments" className="text-xs">Payments</TabsTrigger>
                </TabsList>
                <TabsList className="w-full grid grid-cols-1">
                  <TabsTrigger value="account" className="text-xs">Account</TabsTrigger>
                </TabsList>
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
                  <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
                  <TabsTrigger value="privacy" className="text-xs">Privacy</TabsTrigger>
                  <TabsTrigger value="preferences" className="text-xs">Preferences</TabsTrigger>
                </TabsList>
              </div>

              {/* Desktop-only settings tabs */}
              <div className="hidden lg:block mt-2">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="security" className="text-xs lg:text-sm">Security</TabsTrigger>
                  <TabsTrigger value="notifications" className="text-xs lg:text-sm">Notifications</TabsTrigger>
                  <TabsTrigger value="privacy" className="text-xs lg:text-sm">Privacy</TabsTrigger>
                  <TabsTrigger value="preferences" className="text-xs lg:text-sm">Preferences</TabsTrigger>
                </TabsList>
              </div>

              {/* Overview Tab - Main Dashboard */}
              <TabsContent value="overview" className="mt-4 lg:mt-6 space-y-4 lg:space-y-6">
                {/* Enhanced Profile Component */}
                <EnhancedProfile />
              </TabsContent>

              {/* Matches Tab */}
              <TabsContent value="matches" className="mt-4 lg:mt-6">
                <FindMatches />
              </TabsContent>

              {/* Rewards Tab */}
              <TabsContent value="rewards" className="mt-4 lg:mt-6 space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <Card className="gaming-card">
                    <CardHeader>
                      <CardTitle className="text-sm lg:text-base">FC Earnings Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs lg:text-sm text-muted-foreground">Match Winnings</span>
                          <span className="font-mono font-semibold text-sm lg:text-base">3,450 FC</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs lg:text-sm text-muted-foreground">Tournament Prizes</span>
                          <span className="font-mono font-semibold text-sm lg:text-base">1,400 FC</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs lg:text-sm text-muted-foreground">Leaderboard Rewards</span>
                          <span className="font-mono font-semibold text-sm lg:text-base">275 FC</span>
                        </div>
                        <hr className="border-border" />
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-sm lg:text-base">Total Earned</span>
                          <span className="font-mono text-primary text-sm lg:text-base">5,125 FC</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="gaming-card">
                    <CardHeader>
                      <CardTitle className="text-sm lg:text-base">FNC Performance Rewards</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs lg:text-sm text-muted-foreground">Win Streaks</span>
                          <span className="font-mono font-semibold text-secondary text-sm lg:text-base">8,750 FNC</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs lg:text-sm text-muted-foreground">Perfect Games</span>
                          <span className="font-mono font-semibold text-secondary text-sm lg:text-base">2,500 FNC</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs lg:text-sm text-muted-foreground">Side Props</span>
                          <span className="font-mono font-semibold text-secondary text-sm lg:text-base">1,200 FNC</span>
                        </div>
                        <hr className="border-border" />
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-sm lg:text-base">Total Earned</span>
                          <span className="font-mono text-secondary text-sm lg:text-base">12,450 FNC</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <ActivityFeed />
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="mt-4 lg:mt-6">
                <EventsCalendar />
              </TabsContent>

              {/* Streams Tab */}
              <TabsContent value="streams" className="mt-4 lg:mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <Card className="gaming-card">
                    <CardHeader>
                      <CardTitle className="text-sm lg:text-base">Linked Streaming Accounts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-purple-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">T</span>
                          </div>
                          <div>
                            <div className="font-medium text-sm lg:text-base">Twitch</div>
                            <div className="text-xs lg:text-sm text-muted-foreground">Connected</div>
                          </div>
                        </div>
                        <div className="text-xs lg:text-sm text-primary">Live</div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-red-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">Y</span>
                          </div>
                          <div>
                            <div className="font-medium text-sm lg:text-base">YouTube</div>
                            <div className="text-xs lg:text-sm text-muted-foreground">Not Connected</div>
                          </div>
                        </div>
                        <div className="text-xs lg:text-sm text-muted-foreground">Connect</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="gaming-card">
                    <CardHeader>
                      <CardTitle className="text-sm lg:text-base">Match Stream History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center text-muted-foreground py-6 lg:py-8">
                        <div className="text-xs lg:text-sm">No stream history yet</div>
                        <div className="text-xs mt-1">Connect your streaming accounts to track match streams</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Mail Tab */}
              <TabsContent value="mail" className="mt-4 lg:mt-6">
                <MailInbox />
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="mt-4 lg:mt-6">
                <ProfilePayments />
              </TabsContent>

              {/* Account Tab */}
              <TabsContent value="account" className="mt-4 lg:mt-6">
                <AccountSettings />
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-4 lg:mt-6">
                <SecuritySettings />
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="mt-4 lg:mt-6">
                <NotificationSettings />
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy" className="mt-4 lg:mt-6">
                <PrivacySettings />
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="mt-4 lg:mt-6">
                <PreferencesSettings />
              </TabsContent>
            </Tabs>
          </section>

          {/* Quick Actions Floating Button */}
          <QuickActions />
        </main>

        <RightSquawkbox />
      </div>
    </div>
  );
}
