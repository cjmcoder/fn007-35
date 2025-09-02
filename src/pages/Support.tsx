import { useEffect, useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { LeftNav } from "@/components/layout/LeftNav";
import { RightSquawkbox } from "@/components/layout/RightSquawkbox";
import SupportSidebar, { type SupportTopic } from "@/components/support/SupportSidebar";
import SupportContent from "@/components/support/SupportContent";
import { supportFaq } from "@/data/supportFaq";

const setMetaTag = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export default function Support() {
  const [selected, setSelected] = useState<SupportTopic>("record-your-games");

  useEffect(() => {
    document.title = "Support Center | FLOCKNODE";
    setMetaTag(
      "description",
      "Support center: FAQs, contact, rules, site tour, how it works."
    );

    // Canonical link
    const href = window.location.origin + "/support";
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);

    // Structured data (FAQ) - build from supportFaq
    const faqScriptId = "faq-schema";
    const existing = document.getElementById(faqScriptId);
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = faqScriptId;

    const mainEntity = supportFaq.sections.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1"), // strip simple markdown
        },
      }))
    );

    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity,
    });
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header>
        <TopNav />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Support</h1>
          <p className="text-muted-foreground max-w-2xl">Welcome to the FLOCKNODE Support Center. Choose a topic on the left.</p>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            <div className="lg:col-span-4">
              <SupportSidebar selected={selected} onSelect={setSelected} />
            </div>
            <div className="lg:col-span-8">
              <SupportContent topic={selected} />
            </div>
          </div>
        </main>
        <aside>
          <RightSquawkbox />
        </aside>
      </div>
    </div>
  );
}
