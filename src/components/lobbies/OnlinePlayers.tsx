import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const OnlinePlayers = () => {
  const players = [
    { username: "purplehulk2", last: "$900.00" },
    { username: "Baagofmoneyy", last: "$200.00" },
    { username: "Tenzii", last: "$100.00" },
  ];

  return (
    <Card className="border border-border bg-card/40">
      <div className="p-4">
        <h4 className="text-sm font-semibold mb-3">Online Players</h4>
        <div className="divide-y divide-border">
          {players.map((p) => (
            <Link
              key={p.username}
              to="/leaderboards"
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-primary shadow-glow" aria-hidden />
                <Avatar className="size-9">
                  <AvatarImage src="" alt="" />
                  <AvatarFallback>{p.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{p.username}</div>
                  <div className="text-xs text-muted-foreground">Last played Madden NFL for {p.last}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
};
