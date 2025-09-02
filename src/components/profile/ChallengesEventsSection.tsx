import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  Clock, 
  AlertCircle, 
  Target,
  Calendar,
  Users,
  Trophy
} from "lucide-react";

const openChallenges = [
  {
    id: 1,
    opponent: "GamerPro_2024",
    game: "Madden NFL 25",
    wager: 50,
    timeLeft: "2h 15m",
    status: "pending"
  },
  {
    id: 2,
    opponent: "SkillMaster99", 
    game: "NBA 2K25",
    wager: 25,
    timeLeft: "45m",
    status: "accepted"
  }
];

const pendingConfirmations = [
  {
    id: 1,
    opponent: "EliteGamer_X",
    game: "UFC 5",
    wager: 75,
    result: "W",
    timeLeft: "6h"
  }
];

const sideProps = [
  {
    id: 1,
    prop: "First Touchdown",
    game: "Madden NFL 25",
    odds: "+150",
    stake: 20
  },
  {
    id: 2, 
    prop: "Most Rebounds",
    game: "NBA 2K25",
    odds: "-110",
    stake: 15
  }
];

const upcomingEvents = [
  {
    id: 1,
    name: "Weekly Madden Championship",
    game: "Madden NFL 25",
    type: "Tournament",
    startTime: "Tomorrow 8PM",
    entryFee: 100,
    prizePool: 2500,
    participants: "32/64"
  },
  {
    id: 2,
    name: "FridayNight NBA Showdown",
    game: "NBA 2K25", 
    type: "Community Match",
    startTime: "Friday 9PM",
    entryFee: 25,
    prizePool: 500,
    participants: "12/16"
  }
];

export const ChallengesEventsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Open Challenges */}
      <Card className="gaming-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gamepad2 className="w-4 h-4 text-primary" />
            Active Challenges ({openChallenges.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {openChallenges.map((challenge) => (
            <div key={challenge.id} className="p-3 rounded-lg bg-card/30 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm">{challenge.opponent}</div>
                <Badge variant={challenge.status === 'accepted' ? 'default' : 'secondary'}>
                  {challenge.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-2">{challenge.game}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono">{challenge.wager} FC</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {challenge.timeLeft}
                </span>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full">
            View All Challenges
          </Button>
        </CardContent>
      </Card>

      {/* Pending Confirmations */}
      <Card className="gaming-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            Pending Results ({pendingConfirmations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingConfirmations.map((match) => (
            <div key={match.id} className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm">{match.opponent}</div>
                <Badge variant={match.result === 'W' ? 'default' : 'destructive'}>
                  {match.result}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-2">{match.game}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono">{match.wager} FC</span>
                <span className="text-xs text-yellow-600">
                  Expires in {match.timeLeft}
                </span>
              </div>
            </div>
          ))}
          
          {/* Side Props */}
          <div className="pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Side Props Active</span>
            </div>
            {sideProps.map((prop) => (
              <div key={prop.id} className="p-2 rounded bg-purple-500/5 border border-purple-500/20 mb-2">
                <div className="text-xs font-medium">{prop.prop}</div>
                <div className="text-xs text-muted-foreground">{prop.game}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs">{prop.odds}</span>
                  <span className="text-xs font-mono">{prop.stake} FC</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="gaming-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4 text-blue-500" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="font-medium text-sm mb-1">{event.name}</div>
              <div className="text-xs text-muted-foreground mb-2">{event.game}</div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Start Time</span>
                  <span>{event.startTime}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Entry Fee</span>
                  <span className="font-mono">{event.entryFee} FC</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Prize Pool</span>
                  <span className="font-mono text-primary">{event.prizePool} FC</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Players
                  </span>
                  <span>{event.participants}</span>
                </div>
              </div>
              
              <Button size="sm" className="w-full mt-2" variant="outline">
                View Details
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};