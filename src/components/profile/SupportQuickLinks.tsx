import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Shield, 
  Trophy, 
  AlertTriangle,
  ExternalLink
} from "lucide-react";

const supportLinks = [
  {
    title: "Rules & Regulations",
    description: "Platform rules and match guidelines",
    icon: <FileText className="w-4 h-4" />,
    href: "/support"
  },
  {
    title: "Tournament Payouts",
    description: "How tournament prizes are distributed",
    icon: <Trophy className="w-4 h-4" />,
    href: "/support"
  },
  {
    title: "Leaderboard Terms", 
    description: "Weekly ranking requirements and rewards",
    icon: <Shield className="w-4 h-4" />,
    href: "/support"
  },
  {
    title: "Fraud Prevention",
    description: "Security measures and fair play guidelines", 
    icon: <AlertTriangle className="w-4 h-4" />,
    href: "/support"
  }
];

export const SupportQuickLinks = () => {
  return (
    <Card className="gaming-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Support & Guidelines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {supportLinks.map((link, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="h-auto p-3 justify-start text-left"
              asChild
            >
              <a href={link.href}>
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {link.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm mb-1">{link.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {link.description}
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};