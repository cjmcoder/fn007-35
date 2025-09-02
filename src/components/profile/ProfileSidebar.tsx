import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export const ProfileSidebar = () => {
  return (
    <div className="space-y-4">

      <Card className="p-0 bg-card/40 border-border">
        <Accordion type="single" collapsible>
          <AccordionItem value="support">
            <AccordionTrigger className="px-4">Support</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
              • FAQs<br/>• Contact support<br/>• Report an issue
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="account">
            <AccordionTrigger className="px-4">Account</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
              • Profile settings<br/>• Verification<br/>• Security
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="misc">
            <AccordionTrigger className="px-4">Misc</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
              • Promotions<br/>• Referrals<br/>• App updates
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="policies">
            <AccordionTrigger className="px-4">Policies</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
              • Terms of Service<br/>• Privacy Policy
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
};

export default ProfileSidebar;
