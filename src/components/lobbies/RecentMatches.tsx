import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const RecentMatches = () => {
  const matches = [
    { a: "jmazz1022", b: "WingAttireC9!", amount: "$25.00", game: "Madden NFL 25 | PS5-XBX/S-PC", time: "2h" },
    { a: "Sailor Moon", b: "Dammntc", amount: "$12.00", game: "Madden NFL 25 | PS5-XBX/S-PC", time: "3h" },
    { a: "Yung.Shakur", b: "AGAiNST-EM-ODDS", amount: "$10.00", game: "Madden NFL 25 | PS5-XBX/S-PC", time: "5h" },
  ];

  return (
    <Card className="border border-border bg-card/40">
      <div className="p-4">
        <h4 className="text-sm font-semibold mb-3">Recent Matches</h4>
        <div className="space-y-3">
          {matches.map((m, idx) => (
            <Link key={idx} to="/leaderboards" className="flex items-start gap-3 group">
              <div className="size-10 rounded-md bg-muted/70 flex items-center justify-center text-xs">M25</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">
                  <span className="text-primary font-medium hover:underline">{m.a}</span>
                  <span className="text-muted-foreground"> played </span>
                  <span className="text-primary font-medium hover:underline">{m.b}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{m.game}</div>
                <div className="text-xs mt-0.5">for <span className="font-medium">{m.amount}</span> • <span className="text-muted-foreground">{m.time} ago</span></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
};
