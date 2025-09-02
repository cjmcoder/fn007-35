import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

import { ChevronRight } from "lucide-react";

export const SuggestedPlayers = () => {
  const players = [
    { username: "Dammntc", record: "0-2" },
    { username: "BigRalph109th", record: "0-6" },
    { username: "WingAttireC9!", record: "0-4" },
    { username: "Kell1of1", record: "4-5" },
    { username: "Kpeezy212", record: "0-3" },
  ];

  return (
    <Card className="border border-border bg-card/40">
      <div className="p-4">
        <h4 className="text-sm font-semibold mb-3">Suggested Players</h4>
        <div className="divide-y divide-border">
          {players.map((p) => (
            <Link
              key={p.username}
              to="/leaderboards"
              className="flex items-center justify-between py-3 hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src="" alt={`${p.username} avatar`} />
                  <AvatarFallback>{p.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{p.username}</div>
                  <div className="text-xs text-muted-foreground">Record: {p.record}</div>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
};
