import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Seo } from "@/components/Seo";
import { 
  Trophy, 
  Clock,
  Wallet,
  TrendingUp,
  Calendar,
  Target,
  CheckCircle2,
  ExternalLink,
  History as HistoryIcon,
  Home,
  Link2,
  Shield,
  Info
} from "lucide-react";
import { calculateTournamentPrizePool, calculateTournamentPayouts, formatFC } from "@/lib/fncMath";

const mockLeaderboardData = [
  { rank: 1, player: "ProGamer2024", score: 2847, verified: 95, fc: 150 },
  { rank: 2, player: "SkillMaster", score: 2631, verified: 88, fc: 100 },
  { rank: 3, player: "TopTier_X", score: 2419, verified: 92, fc: 100 },
  { rank: 4, player: "ElitePlayer", score: 2387, verified: 85, fc: 50 },
  { rank: 5, player: "ChampionAce", score: 2204, verified: 90, fc: 50 },
  { rank: 11, player: "RisingForce", score: 1987, verified: 78, fc: 25 },
  { rank: 15, player: "LastChance", score: 1823, verified: 82, fc: 25 }
];

const mockTournaments = [
  {
    id: 1,
    name: "Weekly Pro League",
    game: "Fortnite",
    entryFee: 25,
    startTime: "2024-01-15 18:00",
    participants: 64,
    maxParticipants: 128
  },
  {
    id: 2,
    name: "Elite Championship", 
    game: "Apex Legends",
    entryFee: 50,
    startTime: "2024-01-16 20:00",
    participants: 32,
    maxParticipants: 64
  }
];

const mockEarningActions = [
  {
    id: 1,
    action: "Verified Match Played",
    reward: "10 FNC",
    status: "completed",
    timestamp: "2024-01-10 14:30",
    description: "Complete a match with verification enabled"
  },
  {
    id: 2,
    action: "Match Victory",
    reward: "25 FNC",
    status: "completed",
    timestamp: "2024-01-10 14:30",
    description: "Win a verified match"
  },
  {
    id: 3,
    action: "Stream with Match ID",
    reward: "15 FNC",
    status: "pending",
    timestamp: "2024-01-10 15:45",
    description: "Stream your gameplay with match ID visible"
  },
  {
    id: 4,
    action: "Clean Conduct (7 days)",
    reward: "50 FNC",
    status: "available",
    timestamp: null,
    description: "Maintain clean conduct for 7 days with no disputes"
  }
];

const mockHistory = [
  {
    id: 1,
    type: "FC Reward",
    amount: "150 FC",
    source: "Weekly Leaderboard - 1st Place",
    timestamp: "2024-01-08 09:00"
  },
  {
    id: 2,
    type: "FNC Reward",
    amount: "25 FNC",
    source: "Match Victory",
    timestamp: "2024-01-07 16:30"
  },
  {
    id: 3,
    type: "FNC Reward", 
    amount: "10 FNC",
    source: "Verified Match Played",
    timestamp: "2024-01-07 16:15"
  }
];

export default function Rewards() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showRewardsPolicy, setShowRewardsPolicy] = useState(false);
  
  // Mock countdown timer for weekly reset
  const [timeToReset, setTimeToReset] = useState("3d 14h 27m");

  return (
    <div className="min-h-screen bg-background">
      <Seo 
        title="Rewards System"
        description="Earn FC through competitive play and FNC through performance achievements"
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Rewards</h1>
                <p className="text-muted-foreground">
                  Earn FC through competitive achievement and FNC through performance
                </p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
              <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
              <TabsTrigger value="fnc-rewards">FNC Rewards</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* FC Rewards Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      FC Rewards (Competitive Only)
                    </CardTitle>
                    <CardDescription>
                      Earn FC only by finishing Top 15 on the weekly leaderboard or Top 3 in tournaments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setActiveTab('leaderboards')}
                        className="flex-1"
                      >
                        View Leaderboards
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab('tournaments')}
                        className="flex-1"
                      >
                        Upcoming Tournaments
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* FNC Rewards Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      FNC Rewards (Performance)
                    </CardTitle>
                    <CardDescription>
                      All other performance and engagement is rewarded in FNC crypto. FNC is speculative and may be bridged to a wallet later.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setShowWalletModal(true)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Enable Wallet
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('fnc-rewards')}
                        className="flex-1"
                      >
                        View Earning Actions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Leaderboards Tab */}
            <TabsContent value="leaderboards" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Weekly Leaderboard
                      </CardTitle>
                      <CardDescription>FC Payouts for Top 15 Players</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Resets in</div>
                      <div className="font-mono text-lg">{timeToReset}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Payout Banner */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg border border-amber-500/20">
                    <h3 className="font-semibold text-amber-400 mb-2">FC Payout Structure</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-amber-400">1st</div>
                        <div>150 FC</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-amber-400">2nd-3rd</div>
                        <div>100 FC</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-amber-400">4th-10th</div>
                        <div>50 FC</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-amber-400">11th-15th</div>
                        <div>25 FC</div>
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead>Skill Score</TableHead>
                        <TableHead>Verified %</TableHead>
                        <TableHead>FC Payout</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLeaderboardData.map((entry) => (
                        <TableRow key={entry.rank}>
                          <TableCell className="font-medium">#{entry.rank}</TableCell>
                          <TableCell>{entry.player}</TableCell>
                          <TableCell>{entry.score.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{entry.verified}%</span>
                              {entry.verified >= 90 && (
                                <Badge variant="secondary" className="bg-green-500/10 text-green-400">
                                  High
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                              {entry.fc} FC
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tournaments Tab */}
            <TabsContent value="tournaments" className="space-y-6">
              {/* Platform Fee Info Banner */}
              <Card className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-orange-400" />
                  <h3 className="font-semibold text-orange-400">Tournament Fee Structure</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  A 15% platform fee is deducted from total entries before prize distribution.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm text-center">
                  <div>
                    <div className="font-bold text-purple-400">1st Place</div>
                    <div>60% of Final Prize Pool</div>
                  </div>
                  <div>
                    <div className="font-bold text-purple-400">2nd Place</div>
                    <div>25% of Final Prize Pool</div>
                  </div>
                  <div>
                    <div className="font-bold text-purple-400">3rd Place</div>
                    <div>15% of Final Prize Pool</div>
                  </div>
                </div>
              </Card>

              {/* Tournament Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                {mockTournaments.map((tournament) => {
                  const prizeData = calculateTournamentPrizePool(tournament.entryFee, tournament.participants);
                  const payouts = calculateTournamentPayouts(prizeData.prizePoolAfterFee);
                  
                  return (
                    <Card key={tournament.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{tournament.name}</CardTitle>
                            <CardDescription>{tournament.game}</CardDescription>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                              15% Platform Fee Applied
                            </Badge>
                            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                              FC Payout for Top 3 Only
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Entry Fee:</div>
                            <div className="font-medium">{formatFC(tournament.entryFee)} FC</div>
                            <div className="text-xs text-orange-400 mt-1">
                              ⚡ A 15% platform fee is taken from the prize pool before payouts.
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Total Collected:</span>
                              <div className="font-medium">{formatFC(prizeData.totalCollected)} FC</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Prize Pool After Fee:</span>
                              <div className="font-medium text-amber-400">{formatFC(prizeData.prizePoolAfterFee)} FC</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Start Time:</span>
                              <div className="font-medium">{tournament.startTime}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Players:</span>
                              <div className="font-medium">{tournament.participants}/{tournament.maxParticipants}</div>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <div className="text-sm font-medium text-purple-400 mb-2">Prize Distribution:</div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <div className="font-medium">1st</div>
                                <div>{formatFC(payouts.first)} FC</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">2nd</div>
                                <div>{formatFC(payouts.second)} FC</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">3rd</div>
                                <div>{formatFC(payouts.third)} FC</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button className="w-full">Register</Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Tournament Rules & Regulations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    🏆 Tournament Rules & Regulations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-primary mb-2">1. Entry & Eligibility</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                        <li>• Players must have a verified account in good standing.</li>
                        <li>• Tournament entry requires payment of the designated FC entry fee.</li>
                        <li>• Entries are non-refundable once the tournament begins.</li>
                        <li>• Minimum age and regional restrictions apply (see <button className="text-primary hover:underline">Terms of Service</button>).</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-primary mb-2">2. Prize Pool & Platform Fee</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                        <li>• All entry fees are collected into a single prize pool.</li>
                        <li>• A 15% platform fee is deducted from the total pool to support servers, security, referees, and fair-play operations.</li>
                        <li>• The remaining 85% forms the official Prize Pool.</li>
                        <li>• Prize Pool distribution is fixed as follows:</li>
                        <div className="ml-4 mt-2 p-3 bg-muted/30 rounded-lg">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div>🥇 <span className="font-medium">1st Place:</span></div>
                              <div className="text-amber-400 font-medium">60% of Prize Pool</div>
                            </div>
                            <div className="text-center">
                              <div>🥈 <span className="font-medium">2nd Place:</span></div>
                              <div className="text-slate-400 font-medium">25% of Prize Pool</div>
                            </div>
                            <div className="text-center">
                              <div>🥉 <span className="font-medium">3rd Place:</span></div>
                              <div className="text-orange-400 font-medium">15% of Prize Pool</div>
                            </div>
                          </div>
                        </div>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-primary mb-2">3. Match Format & Rules</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                        <li>• Match formats (best-of-1, best-of-3, etc.) are stated on each tournament card.</li>
                        <li>• Players are responsible for showing up on time. No-shows result in disqualification and loss of entry fee.</li>
                        <li>• Results must be verified by automated tracking or mutual confirmation. In disputed cases, referees may request screenshots, stream VODs, or stat proofs.</li>
                        <li>• Cheating, collusion, or exploiting loopholes leads to immediate ban and forfeiture of rewards.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-primary mb-2">4. Tiebreakers & Disputes</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                        <li>• Ties in standings are resolved by:</li>
                        <li className="ml-4">- Head-to-head record</li>
                        <li className="ml-4">- Point differential / score ratio</li>
                        <li className="ml-4">- Admin decision (if unresolved)</li>
                        <li>• Disputes must be filed within 1 hour of match completion.</li>
                        <li>• Referee decisions are final to preserve competitive integrity.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-primary mb-2">5. Rewards & Withdrawals</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                        <li>• FC rewards are credited automatically after tournament completion.</li>
                        <li>• FC winnings may be used for future entries or withdrawn according to platform policies.</li>
                        <li>• FNC tokens are rewarded separately for performance milestones and are speculative, not guaranteed in value.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-primary mb-2">6. Conduct & Fair Play</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                        <li>• Players must maintain respectful behavior in matches, chats, and streams.</li>
                        <li>• Harassment, offensive content, or toxic conduct results in disqualification.</li>
                        <li>• Repeat offenses may lead to permanent account suspension.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-primary mb-2">7. Amendments</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                        <li>• FLOCKNODE reserves the right to adjust tournament formats, fees, or rules for balance and fairness.</li>
                        <li>• Changes will be announced prior to tournament start and will not affect ongoing events.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FNC Rewards Tab */}
            <TabsContent value="fnc-rewards" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Earning Actions
                  </CardTitle>
                  <CardDescription>
                    Complete these actions to earn FNC rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockEarningActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                              {action.status === 'completed' && <CheckCircle2 className="h-4 w-4" />}
                              {action.status === 'pending' && <Clock className="h-4 w-4" />}
                              {action.status === 'available' && <Target className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="font-medium">{action.action}</div>
                              <div className="text-sm text-muted-foreground">{action.description}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant={action.status === 'completed' ? 'default' : 'secondary'}
                            className={action.status === 'completed' ? 'bg-green-500/10 text-green-400' : ''}
                          >
                            {action.reward}
                          </Badge>
                          {action.timestamp && (
                            <div className="text-sm text-muted-foreground">
                              {action.timestamp}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button onClick={() => setShowWalletModal(true)} size="lg">
                  <Wallet className="h-4 w-4 mr-2" />
                  Enable Wallet
                </Button>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HistoryIcon className="h-5 w-5" />
                    Rewards History
                  </CardTitle>
                  <CardDescription>
                    All FC and FNC rewards are automatically issued
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                          <div className="font-medium">{entry.source}</div>
                          <div className="text-sm text-muted-foreground">{entry.timestamp}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={entry.type === 'FC Reward' 
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                              : 'bg-green-500/10 text-green-400 border-green-500/20'
                            }
                          >
                            {entry.amount}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {entry.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer Disclaimer */}
          <Card className="p-4 bg-muted/50 border-amber-500/20">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                FC = platform credits for competitive payouts. FNC = speculative crypto reward, no guaranteed value.
              </p>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setShowRewardsPolicy(true)}
                className="text-primary"
              >
                Full Rewards Policy
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Wallet Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Enable Crypto Wallet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-amber-500">Important Notice</span>
              </div>
              <p className="text-sm text-muted-foreground">
                FNC is speculative cryptocurrency with no guaranteed value and is not USD redeemable.
              </p>
            </div>
            
            <div className="grid gap-3">
              <Button className="justify-start" variant="outline">
                <Link2 className="h-4 w-4 mr-2" />
                Link MetaMask Wallet
              </Button>
              <Button className="justify-start" variant="outline">
                <Wallet className="h-4 w-4 mr-2" />
                Create Embedded Wallet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rewards Policy Modal */}
      <Dialog open={showRewardsPolicy} onOpenChange={setShowRewardsPolicy}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Full Rewards Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">FC (Flock Credits)</h3>
              <p className="text-muted-foreground">
                Platform credits earned through competitive achievement only. Used for tournament entries and competitive payouts. 
                Limited weekly distribution based on performance rankings.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">FNC (Flock Network Coin)</h3>
              <p className="text-muted-foreground">
                Speculative cryptocurrency reward for performance and engagement activities. 
                No guaranteed value, not redeemable for USD. May be bridged to external wallets in the future.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Automatic Distribution</h3>
              <p className="text-muted-foreground">
                All rewards are automatically distributed upon completion of qualifying activities. 
                No manual claiming required.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}