import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { SupportTopic } from "./SupportSidebar";
import { supportFaq } from "@/data/supportFaq";


interface Props { topic: SupportTopic }

const mdInline = (s: string) =>
  s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

export default function SupportContent({ topic }: Props) {
  switch (topic) {
    case "record-your-games":
      return (
        <Card className="bg-card/40 border-border">
          <CardHeader>
            <CardTitle className="text-xl">Recording Games</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              If you stream your games through a site like Twitch, always remember to archive your videos!
            </p>
            <div className="space-y-3">
              <SupportLink href="https://support.xbox.com/en-US/help/friends-social-activity/share-social/upload-capture">
                Click Here for details on how to record your Xbox footage.
              </SupportLink>
              <Separator />
              <SupportLink href="https://www.playstation.com/en-us/support/games/share-play-record-ps4/">
                Click Here for details on how to record your PlayStation 4 footage.
              </SupportLink>
              <Separator />
              <SupportLink href="https://www.playstation.com/en-us/support/games/capture-share-ps5/">
                Click Here for details on how to record your PlayStation 5 footage.
              </SupportLink>
            </div>
          </CardContent>
        </Card>
      );
    case "site-tour":
      return (
        <InfoCard title="Site Tour">
          <ul className="list-disc pl-5 space-y-2">
            <li>Find a Match: Browse lobbies and challenge players.</li>
            <li>Wallet: Deposit, withdraw, and track winnings.</li>
            <li>Leaderboards: See top players and trending games.</li>
            <li>Support: Access FAQs, rules, and contact options.</li>
          </ul>
        </InfoCard>
      );
    case "contact-support":
      return (
        <InfoCard title="Contact Support">
          <p>
            Need help? Email
            {" "}
            <a className="text-primary underline" href="mailto:support@flocknode.gg">
              support@flocknode.gg
            </a>
            {" "}
            or open a ticket from your account settings.
          </p>
        </InfoCard>
      );
    case "how-it-works":
      return (
        <InfoCard title="How It Works">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Create your account and verify your details.</li>
            <li>Fund your wallet and set your game/platform.</li>
            <li>Find or create a challenge, then play your match.</li>
            <li>Submit results; disputes are handled by our team.</li>
            <li>Payouts: Winnings arrive instantly in your wallet.</li>
          </ol>
        </InfoCard>
      );
    case "faqs":
      return (
        <Card className="bg-card/40 border-border">
          <CardHeader>
            <CardTitle className="text-xl">FAQs</CardTitle>
            <p className="text-xs text-muted-foreground">Last updated {supportFaq.lastUpdated}</p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {supportFaq.sections.map((section) => (
                <AccordionItem key={section.slug} value={section.slug}>
                  <AccordionTrigger className="text-foreground">{section.title}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {section.items.map((item) => (
                        <div key={item.qId} className="space-y-1">
                          <p className="font-medium text-foreground">{item.q}</p>
                          <p dangerouslySetInnerHTML={{ __html: mdInline(item.a) }} />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Separator />
            <p dangerouslySetInnerHTML={{ __html: mdInline(supportFaq.disclaimer) }} />
          </CardContent>
        </Card>
      );
    case "site-rules":
      return (
        <InfoCard title="Site Rules">
          <p>Read our fair play and community guidelines for all matches.</p>
          <p>
            View the complete rules here:{" "}
            <a className="text-primary underline" href="/rules">FLOCKNODE Rules</a>
          </p>
        </InfoCard>
      );
    case "side-challenges":
      return (
        <Card className="bg-card/40 border-border">
          <CardHeader>
            <CardTitle className="text-xl">Side Challenges & Private Server Requirements</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">What are Side Challenges?</h3>
                <p>Side Challenges are optional peer-to-peer prop bets that can only be created on <strong>Private Server matches</strong>. They allow players to bet on specific in-game statistics and performance metrics.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Private Server Requirement</h3>
                <p>Side Challenges are <strong>limited to Private Server matches only</strong>. If a match is not marked as a Private Server match, you cannot create or join any Side Challenge.</p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-destructive font-mono text-xs">"Side Challenges are limited to Private Server matches."</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Minimum Stakes</h3>
                <p>The minimum stake per player for any Side Challenge is <strong>25 FC</strong>. Entries below this threshold will be rejected.</p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-destructive font-mono text-xs">"Entry must be at least 25 FC per player."</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Private Server Usage Fees</h3>
                <p>There is a <strong>2 FC per player</strong> non-refundable Private Server usage fee charged when matches transition to LIVE status.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Fee is charged separately from entry escrow</li>
                  <li>Charged when match goes OPEN→LOCKED→LIVE</li>
                  <li>Refunded if match canceled before LIVE</li>
                  <li>Non-refundable once match is LIVE</li>
                  <li>Appears as transaction type "PRIVATE_SERVER_FEE"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    default:
      return null;
  }
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="bg-card/40 border-border">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        {children}
      </CardContent>
    </Card>
  );
}

function SupportLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline"
    >
      {children}
    </a>
  );
}

function Separator() {
  return <div className="border-t border-border/70" />;
}
