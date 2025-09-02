import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatFC } from "@/lib/fncMath";
import { 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Target, 
  Zap,
  Calendar,
  CreditCard,
  Gamepad2,
  Award
} from "lucide-react";

const transactionData = [
  { 
    time: "Aug 12, 14:32", 
    type: "Match Win", 
    amount: 190, 
    color: "text-primary",
    icon: <Trophy className="w-4 h-4" />,
    tag: "credit",
    note: "vs. UserOnly757 - Madden NFL 25"
  },
  { 
    time: "Aug 12, 12:21", 
    type: "Match Entry", 
    amount: -100, 
    color: "text-destructive",
    icon: <Gamepad2 className="w-4 h-4" />,
    tag: "debit",
    note: "Madden 1v1 Wager"
  },
  { 
    time: "Aug 11, 19:04", 
    type: "FC Added", 
    amount: 1000, 
    color: "text-primary",
    icon: <CreditCard className="w-4 h-4" />,
    tag: "credit",
    note: "Credit Card Purchase"
  },
  { 
    time: "Aug 11, 15:22", 
    type: "Tournament Entry", 
    amount: -250, 
    color: "text-blue-500",
    icon: <Calendar className="w-4 h-4" />,
    tag: "tournament",
    note: "Weekly Madden Championship"
  },
  { 
    time: "Aug 10, 09:32", 
    type: "FNC Reward", 
    amount: 150, 
    color: "text-secondary",
    icon: <Award className="w-4 h-4" />,
    tag: "reward",
    note: "Performance Bonus - 3 Game Streak"
  }
];

const performanceData = [
  {
    time: "Aug 12, 14:35",
    type: "Win Streak",
    value: "5 Games",
    icon: <Zap className="w-4 h-4 text-yellow-500" />,
    color: "text-yellow-500",
    note: "Personal best streak!"
  },
  {
    time: "Aug 12, 14:32", 
    type: "Leaderboard Climb",
    value: "+3 Positions",
    icon: <TrendingUp className="w-4 h-4 text-primary" />,
    color: "text-primary",
    note: "Now #12 in Weekly Rankings"
  },
  {
    time: "Aug 11, 20:15",
    type: "Prop Completion", 
    value: "Perfect Game",
    icon: <Target className="w-4 h-4 text-purple-500" />,
    color: "text-purple-500",
    note: "0 Turnovers in Madden match"
  },
  {
    time: "Aug 11, 15:45",
    type: "Tournament Position",
    value: "3rd Place",
    icon: <Trophy className="w-4 h-4 text-orange-500" />,
    color: "text-orange-500", 
    note: "Weekly Madden Championship"
  },
  {
    time: "Aug 10, 12:20",
    type: "Skill Rating",
    value: "+45 ELO",
    icon: <TrendingUp className="w-4 h-4 text-primary" />,
    color: "text-primary",
    note: "Madden NFL 25 rating improved"
  }
];

const getTagColor = (tag: string) => {
  switch (tag) {
    case "credit": return "bg-primary/20 text-primary";
    case "debit": return "bg-destructive/20 text-destructive";
    case "reward": return "bg-secondary/20 text-secondary";
    case "tournament": return "bg-blue-500/20 text-blue-500";
    default: return "bg-muted";
  }
};

export const ActivityFeed = () => {
  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="mt-4">
            <div className="space-y-3">
              {transactionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{item.type}</span>
                        <Badge variant="secondary" className={getTagColor(item.tag)}>
                          {item.tag}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.time} • {item.note}
                      </div>
                    </div>
                  </div>
                  <div className={`font-mono text-sm font-semibold ${item.color}`}>
                    {item.amount > 0 ? "+" : ""}{formatFC(Math.abs(item.amount))} FC
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-4">
            <div className="space-y-3">
              {performanceData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm mb-1">{item.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.time} • {item.note}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${item.color}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};