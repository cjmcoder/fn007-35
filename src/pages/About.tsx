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

export default function About() {
  useEffect(() => {
    document.title = "About Us | FLOCKNODE";
    setMetaTag("description", "Learn about FLOCKNODE's mission and team.");
    const href = window.location.origin + "/about";
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">About Us</h1>
          <section className="rounded-xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">
            <p>FLOCKNODE is an elite competitive gaming hub where players connect, challenge, and win. We focus on fair play, modern design, and a smooth competitive experience.</p>
          </section>
        </main>
        <aside>
          <RightSquawkbox />
        </aside>
      </div>
    </div>
  );
}
