import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface EntryDisclaimerModalProps {
  onAgree: () => void;
}

export default function EntryDisclaimerModal({ onAgree }: EntryDisclaimerModalProps) {
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState(false);

  const handleAgree = () => {
    if (checked) {
      setOpen(false);
      onAgree();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg rounded-2xl shadow-lg p-6 bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-foreground">
            ⚠️ Age Requirement & Stake Disclaimer
          </DialogTitle>
        </DialogHeader>

        <Card className="border border-border p-4 max-h-80 overflow-y-auto bg-card/50">
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              By creating an account and entering FLOCKNODE, you confirm and agree to the following:
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Minimum Age Requirement</h4>
                <p>You must be <strong>18 years of age or older</strong> (or the legal age of majority in your jurisdiction, if higher) to access and participate in FLOCKNODE contests.</p>
                <p>By registering, you represent and warrant that you meet this minimum age requirement.</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">Skill-Based Competition Only</h4>
                <p>All matches, wagers, and contests on FLOCKNODE are skill-based competitions.</p>
                <p>Outcomes are determined by the players&apos; skill, decision-making, and performance — not chance.</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">Stake & Risk Disclosure</h4>
                <p>By entering a contest, you understand and accept that:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Stakes (FC or other entry fees) are non-refundable once a match begins.</li>
                  <li>You may lose your stake if you do not win or if you violate platform rules.</li>
                  <li>FLOCKNODE is not responsible for losses due to poor performance, disconnections, or user misconduct.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">Compliance & Responsibility</h4>
                <p>You are solely responsible for ensuring that your use of FLOCKNODE is legal in your jurisdiction.</p>
                <p>FLOCKNODE reserves the right to request age verification and may suspend or terminate accounts that violate these terms.</p>
              </div>
            </div>

            <div className="border-t border-border pt-3 mt-4">
              <p className="text-xs text-muted-foreground">
                By clicking &quot;I Agree&quot;, you acknowledge that you have read, understood, and accepted the Age Requirement & Stake Disclaimer above.
              </p>
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="flex flex-col gap-4 mt-4">
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <Checkbox 
              checked={checked} 
              onCheckedChange={(v) => setChecked(!!v)}
              className="border-border" 
            />
            <span className="text-foreground">
              I have read and agree to the Age Requirement & Stake Disclaimer.
            </span>
          </label>
          <Button 
            onClick={handleAgree} 
            disabled={!checked} 
            className="w-full font-semibold"
            size="lg"
          >
            I Agree & Enter FLOCKNODE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}