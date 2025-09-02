import { useEffect } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { LeftNav } from "@/components/layout/LeftNav";
import { RightSquawkbox } from "@/components/layout/RightSquawkbox";

const setMetaTag = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export default function Rules() {
  useEffect(() => {
    document.title = "Rules & Fair Play | FLOCKNODE";
    setMetaTag("description", "Official rules, fair play policies, and community guidelines.");
    const href = window.location.origin + "/rules";
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header>
        <TopNav />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Rules & Fair Play</h1>
          
          <section className="rounded-xl border border-border bg-card/40 p-4 space-y-2 text-sm text-muted-foreground">
            <p>1. Cheating, collusion, or exploiting bugs is strictly prohibited.</p>
            <p>2. Match results must be submitted within 15 minutes of completion.</p>
            <p>3. Disputes should be filed with valid proof (clips, screenshots).</p>
            <p>4. Toxic behavior and harassment are not tolerated.</p>
          </section>

          <section className="rounded-xl border border-border bg-card/40 p-6 space-y-6">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              🏆 Tournament Rules & Regulations
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-primary mb-2">1. Entry & Eligibility</h3>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                  <li>• Players must have a verified account in good standing.</li>
                  <li>• Tournament entry requires payment of the designated FC entry fee.</li>
                  <li>• Entries are non-refundable once the tournament begins.</li>
                  <li>• Minimum age and regional restrictions apply (see Terms of Service).</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-2">2. Prize Pool & Platform Fee</h3>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                  <li>• All entry fees are collected into a single prize pool.</li>
                  <li>• A 15% platform fee is deducted from the total pool to support servers, security, referees, and fair-play operations.</li>
                  <li>• The remaining 85% forms the official Prize Pool.</li>
                  <li>• Prize Pool distribution is fixed as follows:</li>
                  <div className="ml-4 mt-2 p-3 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div>🥇 <span className="font-medium">1st Place:</span></div>
                        <div className="text-yellow-400 font-medium">60% of Prize Pool</div>
                      </div>
                      <div className="text-center">
                        <div>🥈 <span className="font-medium">2nd Place:</span></div>
                        <div className="text-gray-400 font-medium">25% of Prize Pool</div>
                      </div>
                      <div className="text-center">
                        <div>🥉 <span className="font-medium">3rd Place:</span></div>
                        <div className="text-orange-400 font-medium">15% of Prize Pool</div>
                      </div>
                    </div>
                  </div>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-2">3. Match Format & Rules</h3>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                  <li>• Match formats (best-of-1, best-of-3, etc.) are stated on each tournament card.</li>
                  <li>• Players are responsible for showing up on time. No-shows result in disqualification and loss of entry fee.</li>
                  <li>• Results must be verified by automated tracking or mutual confirmation. In disputed cases, referees may request screenshots, stream VODs, or stat proofs.</li>
                  <li>• Cheating, collusion, or exploiting loopholes leads to immediate ban and forfeiture of rewards.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-2">4. Tiebreakers & Disputes</h3>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                  <li>• Ties in standings are resolved by:</li>
                  <li className="ml-4">- Head-to-head record</li>
                  <li className="ml-4">- Point differential / score ratio</li>
                  <li className="ml-4">- Admin decision (if unresolved)</li>
                  <li>• Disputes must be filed within 1 hour of match completion.</li>
                  <li>• Referee decisions are final to preserve competitive integrity.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-2">5. Rewards & Withdrawals</h3>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                  <li>• FC rewards are credited automatically after tournament completion.</li>
                  <li>• FC winnings may be used for future entries or withdrawn according to platform policies.</li>
                  <li>• FNC tokens are rewarded separately for performance milestones and are speculative, not guaranteed in value.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-2">6. Conduct & Fair Play</h3>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                  <li>• Players must maintain respectful behavior in matches, chats, and streams.</li>
                  <li>• Harassment, offensive content, or toxic conduct results in disqualification.</li>
                  <li>• Repeat offenses may lead to permanent account suspension.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-2">7. Amendments</h3>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                  <li>• FLOCKNODE reserves the right to adjust tournament formats, fees, or rules for balance and fairness.</li>
                  <li>• Changes will be announced prior to tournament start and will not affect ongoing events.</li>
                </ul>
              </div>
            </div>
          </section>
        </main>
        <aside>
          <RightSquawkbox />
        </aside>
      </div>
    </div>
  );
}
