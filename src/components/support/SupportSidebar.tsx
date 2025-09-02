import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

export type SupportTopic =
  | "site-tour"
  | "contact-support"
  | "how-it-works"
  | "faqs"
  | "side-challenges"
  | "site-rules"
  | "record-your-games";

interface Props {
  selected: SupportTopic;
  onSelect: (topic: SupportTopic) => void;
}

const supportItems: { label: string; key: SupportTopic }[] = [
  { label: "Site Tour", key: "site-tour" },
  { label: "Contact Support", key: "contact-support" },
  { label: "How It Works", key: "how-it-works" },
  { label: "FAQs", key: "faqs" },
  { label: "Side Challenges", key: "side-challenges" },
  { label: "Site Rules", key: "site-rules" },
  { label: "Record Your Games", key: "record-your-games" },
];

export default function SupportSidebar({ selected, onSelect }: Props) {
  return (
    <nav aria-label="Support sections" className="space-y-4">
      <Card className="p-0 bg-card/40 border-border">
        <Accordion type="single" collapsible defaultValue="support">
          <AccordionItem value="support">
            <AccordionTrigger className="px-4">Support</AccordionTrigger>
            <AccordionContent className="px-2 pt-0">
              <ul className="py-1">
                {supportItems.map((item) => (
                  <li key={item.key} className="px-2">
                    <Button
                      variant={selected === item.key ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => onSelect(item.key)}
                    >
                      {item.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="account">
            <AccordionTrigger className="px-4">Account</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
              • Profile settings<br />• Verification<br />• Security
              <div className="mt-3">
                <Button asChild size="sm">
                  <Link to="/my-profile?tab=account" aria-label="Open account settings in My Profile">
                    Go to Account Settings
                  </Link>
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="misc">
            <AccordionTrigger className="px-4">Misc</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
              • Promotions<br />• Referrals<br />• App updates
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="policies">
            <AccordionTrigger className="px-4">Policies</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
              • Terms of Service<br />• Privacy Policy
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </nav>
  );
}
