import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface Item {
  title: string;
  snippet: string;
  unread?: number;
}

const Row = ({ item }: { item: Item }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-b-0 border-border/70">
    <div className="min-w-0">
      <div className="text-sm font-medium truncate">{item.title}</div>
      <div className="text-xs text-muted-foreground truncate">{item.snippet}</div>
    </div>
    <div className="flex items-center gap-2 pl-3 shrink-0">
      {item.unread ? (
        <span className="inline-flex items-center justify-center rounded-full h-6 w-6 bg-primary text-primary-foreground text-xs font-semibold">
          {item.unread}
        </span>
      ) : null}
      <ChevronRight className="size-4 text-muted-foreground" />
    </div>
  </div>
);

export const ProfileMessages = () => {
  const messages: Item[] = [
    { title: "SCHOOLEM 007", snippet: "has canceled their challenge", unread: 15 },
    { title: "tyeagles366", snippet: "wanna play 5 or 6 min quarters 10-25$", unread: 4 },
    { title: "Fast N Scary", snippet: "Wanna play yet or u still a huge p u s s y?", unread: 14 },
    { title: "TeeTimeAt9", snippet: "sent you a challenge", unread: 4 },
    { title: "Sailor Moon", snippet: "College Football or NBA 2K for $10 or $20?", unread: 2 },
  ];


  const challenges: Item[] = [
    { title: "DiogoMota10", snippet: "has canceled their challenge", unread: 3 },
    { title: "Pangos", snippet: "You …", unread: 1 },
  ];

  const totalMessagesUnread = messages.reduce((sum, msg) => sum + (msg.unread || 0), 0);
  const totalChallengesUnread = challenges.reduce((sum, challenge) => sum + (challenge.unread || 0), 0);

  return (
    <Card className="bg-card/40 border-border">
      <Tabs defaultValue="messages" className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages" className="relative">
              Messages
              {totalMessagesUnread > 0 && (
                <Badge className="ml-2 bg-green-500 hover:bg-green-600 text-white border-0 h-5 min-w-5 px-1.5">
                  {totalMessagesUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="challenges" className="relative">
              Challenges
              {totalChallengesUnread > 0 && (
                <Badge className="ml-2 bg-green-500 hover:bg-green-600 text-white border-0 h-5 min-w-5 px-1.5">
                  {totalChallengesUnread}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="messages" className="mt-2">
          <div className="px-4 pb-4">
            {messages.map((item, i) => (
              <Row key={i} item={item} />
            ))}
          </div>
        </TabsContent>


        <TabsContent value="challenges" className="mt-2">
          <div className="px-4 pb-4">
            {challenges.map((item, i) => (
              <Row key={i} item={item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ProfileMessages;
