import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const matchHistory = [
  {
    id: 1,
    date: "2025-01-18",
    time: "14:30",
    opponent: "Useronly757",
    opponentAvatar: "/placeholder.svg",
    game: "Madden NFL 25",
    platform: "PS5",
    result: "W",
    score: "21-14",
    wager: "$10.00",
    payout: "$19.00",
    status: "Settled",
    duration: "18 min"
  },
  {
    id: 2,
    date: "2025-01-17",
    time: "20:15",
    opponent: "GeoAletras",
    opponentAvatar: "/placeholder.svg",
    game: "Madden NFL 25",
    platform: "Xbox",
    result: "L",
    score: "7-28",
    wager: "$7.00",
    payout: "$0.00",
    status: "Settled",
    duration: "22 min"
  },
  {
    id: 3,
    date: "2025-01-16",
    time: "16:45",
    opponent: "Qwinch15",
    opponentAvatar: "/placeholder.svg",
    game: "NBA 2K25",
    platform: "PS5",
    result: "W",
    score: "98-87",
    wager: "$5.00",
    payout: "$9.50",
    status: "Settled",
    duration: "35 min"
  },
  {
    id: 4,
    date: "2025-01-15",
    time: "19:20",
    opponent: "SkillMaster",
    opponentAvatar: "/placeholder.svg",
    game: "Madden NFL 25",
    platform: "PC",
    result: "W",
    score: "35-21",
    wager: "$15.00",
    payout: "$28.50",
    status: "Settled",
    duration: "24 min"
  },
  {
    id: 5,
    date: "2025-01-14",
    time: "13:10",
    opponent: "ProGamer99",
    opponentAvatar: "/placeholder.svg",
    game: "NBA 2K25",
    platform: "Xbox",
    result: "L",
    score: "102-89",
    wager: "$12.00",
    payout: "$0.00",
    status: "Settled",
    duration: "41 min"
  }
];

export function MatchHistory() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Match History</h2>
          <p className="text-sm text-muted-foreground">Track your performance and earnings</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-card/40 border-border">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <Input placeholder="Search opponent or game..." />
          </div>
          <Select defaultValue="all-games">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-games">All Games</SelectItem>
              <SelectItem value="madden">Madden NFL 25</SelectItem>
              <SelectItem value="nba2k">NBA 2K25</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-results">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-results">All Results</SelectItem>
              <SelectItem value="wins">Wins Only</SelectItem>
              <SelectItem value="losses">Losses Only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/40 border-border text-center">
          <div className="text-2xl font-bold text-primary">23</div>
          <div className="text-sm text-muted-foreground">Total Matches</div>
        </Card>
        <Card className="p-4 bg-card/40 border-border text-center">
          <div className="text-2xl font-bold text-neon-orange">15</div>
          <div className="text-sm text-muted-foreground">Wins</div>
        </Card>
        <Card className="p-4 bg-card/40 border-border text-center">
          <div className="text-2xl font-bold text-destructive">8</div>
          <div className="text-sm text-muted-foreground">Losses</div>
        </Card>
        <Card className="p-4 bg-card/40 border-border text-center">
          <div className="text-2xl font-bold text-neon-cyan">$347.50</div>
          <div className="text-sm text-muted-foreground">Net Winnings</div>
        </Card>
      </div>

      {/* Match History Table */}
      <Card className="bg-card/40 border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Opponent</TableHead>
                <TableHead>Game</TableHead>
                <TableHead className="text-center">Result</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-right">Wager</TableHead>
                <TableHead className="text-right">Payout</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchHistory.map((match) => (
                <TableRow key={match.id} className="hover:bg-muted/50">
                  <TableCell className="whitespace-nowrap">
                    <div>
                      <div className="font-medium">{new Date(match.date).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">{match.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={match.opponentAvatar} />
                        <AvatarFallback>{match.opponent.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{match.opponent}</div>
                        <div className="text-xs text-muted-foreground">{match.duration}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{match.game}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {match.platform}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={match.result === 'W' ? 'default' : 'destructive'}>
                      {match.result}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {match.score}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {match.wager}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={match.result === 'W' ? 'text-neon-cyan' : 'text-muted-foreground'}>
                      {match.payout}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      {match.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}