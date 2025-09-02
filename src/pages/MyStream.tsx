import { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { LeftNav } from "@/components/layout/LeftNav";
import { RightSquawkbox } from "@/components/layout/RightSquawkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLink, Copy, Volume2, VolumeX, Twitch, Twitter, Youtube, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
const setMetaTag = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export default function MyStream() {
  useEffect(() => {
    document.title = "My Stream Channel | FLOCKNODE";
    setMetaTag(
      "description",
      "Embed your Twitch stream and chat on FLOCKNODE. Add your channel and preview instantly."
    );

    // Canonical tag
    const href = window.location.origin + "/my-stream";
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
  }, []);

  const [channel, setChannel] = useState("");
  const [muted, setMuted] = useState(true);
  const [remember, setRemember] = useState(true);
  const [animatedEmotes, setAnimatedEmotes] = useState(true);
  const [useDemo, setUseDemo] = useState(true);
  const [demoInput, setDemoInput] = useState("");
  const [demoMessages, setDemoMessages] = useState(
    [
      { id: 1, user: "System", text: "Welcome to the demo chat!", time: "10:02 AM" },
      { id: 2, user: "CasterBot", text: "Match starts soon. GLHF!", time: "10:03 AM" },
      { id: 3, user: "ProGamer", text: "Wager set: $5 — who’s in?", time: "10:04 AM" },
    ] as { id: number; user: string; text: string; time: string }[]
  );
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { toast } = useToast();

  // Load saved channel
  useEffect(() => {
    try {
      const saved = localStorage.getItem("twitchChannel");
      const savedRemember = localStorage.getItem("rememberTwitch");
      const savedEmotes = localStorage.getItem("animatedEmotes");
      if (saved) setChannel(saved);
      if (savedRemember) setRemember(savedRemember === "true");
      if (savedEmotes) setAnimatedEmotes(savedEmotes === "true");
    } catch {}
  }, []);
  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem("rememberTwitch", String(remember));
      if (remember && channel.trim()) {
        localStorage.setItem("twitchChannel", channel.trim());
      }
    } catch {}
  }, [channel, remember]);

  // Persist animated emotes preference
  useEffect(() => {
    try {
      localStorage.setItem("animatedEmotes", String(animatedEmotes));
    } catch {}
  }, [animatedEmotes]);

  // Set loading flags when channel changes
  useEffect(() => {
    if (channel.trim()) {
      setLoadingVideo(true);
      setLoadingChat(true);
    }
  }, [channel]);

  const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const videoSrc = useMemo(() => (
    channel.trim() ? `https://player.twitch.tv/?channel=${encodeURIComponent(channel.trim())}&parent=${parent}&muted=${muted ? "true" : "false"}&autoplay=false` : ""
  ), [channel, parent, muted]);
  const chatSrc = useMemo(() => (
    channel.trim() ? `https://www.twitch.tv/embed/${encodeURIComponent(channel.trim())}/chat?parent=${parent}` : ""
  ), [channel, parent]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header>
        <TopNav />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <LeftNav />

        <main className="flex-1 overflow-y-auto">
          <section className="p-4 lg:p-6 space-y-4">
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">My Stream Channel</h1>
            <p className="text-muted-foreground max-w-2xl">
              Enter your Twitch channel name to preview the embedded player and chat, similar to the
              reference layout.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1 sm:max-w-xs">
                <Label htmlFor="twitch-channel" className="text-xs mb-1 block">Channel</Label>
                <Input
                  id="twitch-channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  placeholder="Enter Twitch channel (e.g., ninja)"
                  className="bg-card/60 border-border"
                  aria-label="Twitch channel"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-gradient-primary shadow-glow"
                  disabled={!channel.trim()}
                  onClick={() => {
                    if (channel.trim()) { setLoadingVideo(true); setLoadingChat(true); }
                  }}
                >
                  Load Player
                </Button>
                {channel.trim() && (
                  <>
                    <a href={`https://twitch.tv/${channel.trim()}`} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="border-border">
                        <ExternalLink className="w-4 h-4 mr-2" /> Open on Twitch
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      className="border-border"
                      onClick={async () => {
                        const embed = `<iframe src=\"https://player.twitch.tv/?channel=${channel.trim()}&parent=${parent}&muted=${muted ? "true" : "false"}\" allowfullscreen width=\"100%\" height=\"100%\"></iframe>`;
                        try {
                          await navigator.clipboard.writeText(embed);
                          toast({ title: "Embed code copied", description: "Paste it into your site builder." });
                        } catch {
                          toast({ title: "Copy failed", description: "Your browser blocked clipboard access." });
                        }
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy embed
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch id="remember" checked={remember} onCheckedChange={setRemember} />
                <Label htmlFor="remember" className="text-sm">Remember channel</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="muted" checked={muted} onCheckedChange={setMuted} />
                <Label htmlFor="muted" className="text-sm flex items-center gap-1">
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  Start muted
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="demo" checked={useDemo} onCheckedChange={setUseDemo} />
                <Label htmlFor="demo" className="text-sm">Show demo stream</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Popular:</span>
                {["ninja", "xqc", "riotgames"].map((c) => (
                  <Button key={c} variant="outline" size="sm" className="h-7 border-border" onClick={() => { setChannel(c); setUseDemo(false); }}>
                    {c}
                  </Button>
                ))}
              </div>
            </div>

            <article className="mt-4 rounded-xl border border-border bg-card/40 backdrop-blur-md shadow-glow">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-muted-foreground">Streams</h2>
                  {channel.trim() ? (
                    <Badge className="bg-primary/20 text-primary border-primary/30">Channel: {channel.trim()}</Badge>
                  ) : (
                    <Badge className="bg-muted/50 text-muted-foreground border-border">No channel set</Badge>
                  )}
                </div>
                {channel.trim() && (
                  <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">Preview</Badge>
                )}
              </div>
              <div className="p-3">
                {!channel.trim() && !useDemo ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Enter a Twitch channel above or enable the demo toggle to preview the player and chat.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 space-y-3">
                      <div className="relative">
                        <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden border border-border bg-black">
                          {useDemo ? (
                            <video
                              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                              className="w-full h-full"
                              muted={muted}
                              controls
                              onLoadedData={() => setLoadingVideo(false)}
                            />
                          ) : (
                            <iframe
                              title={`Twitch Player - ${channel}`}
                              src={videoSrc}
                              allowFullScreen
                              loading="lazy"
                              className="w-full h-full"
                              onLoad={() => setLoadingVideo(false)}
                            />
                          )}
                        </AspectRatio>
                        {loadingVideo && (
                          <div className="absolute inset-0 bg-black/40 grid place-items-center">
                            <Twitch className="w-8 h-8 text-muted-foreground animate-pulse" />
                          </div>
                        )}
                      </div>

                      {/* Meta info under player */}
                      <div className="rounded-lg border border-border bg-card/60 p-3 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="w-10 h-10 border border-border">
                            <AvatarFallback className="text-xs bg-muted">{((useDemo ? "DS" : channel) || "ST").slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate max-w-[200px]">{useDemo ? "Demo Stream" : (channel || "Streamer")}</span>
                              {!loadingVideo && (useDemo || channel.trim()) ? (
                                <Badge className="bg-destructive text-destructive-foreground">LIVE</Badge>
                              ) : (
                                <Badge variant="secondary">OFFLINE</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">Game: Madden • Match: Wager • Best of 3</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`https://twitter.com/${channel || "gaming"}`} target="_blank" rel="noreferrer">
                              <Twitter className="w-4 h-4 mr-1" /> Twitter
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href="#" target="_blank" rel="noreferrer">
                              <Youtube className="w-4 h-4 mr-1" /> YouTube
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href="#" target="_blank" rel="noreferrer">
                              <Instagram className="w-4 h-4 mr-1" /> Instagram
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-1">
                      <div className="rounded-lg overflow-hidden border border-border bg-card/50">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold">Stream Chat</h3>
                            {(useDemo || channel.trim()) && !loadingVideo ? (
                              <Badge className="bg-destructive text-destructive-foreground">LIVE</Badge>
                            ) : null}
                            {loadingChat && <Badge variant="secondary">Connecting...</Badge>}
                            {useDemo && <Badge variant="secondary">DEMO</Badge>}
                          </div>
                        </div>
                        {useDemo ? (
                          <>
                            <div className="p-3 h-80 overflow-y-auto space-y-2">
                              {demoMessages.map((m) => (
                                <div key={m.id} className="text-sm">
                                  <span className="font-medium text-neon-cyan mr-2">{m.user}</span>
                                  <span className="text-muted-foreground text-xs mr-2">{m.time}</span>
                                  <span className="text-foreground">{m.text}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 p-2 border-t border-border bg-card/70">
                              <Input
                                placeholder="Type a message..."
                                value={demoInput}
                                onChange={(e) => setDemoInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && demoInput.trim()) {
                                    setDemoMessages((prev) => [
                                      ...prev,
                                      { id: prev.length + 1, user: "You", text: demoInput.trim(), time: new Date().toLocaleTimeString() },
                                    ]);
                                    setDemoInput("");
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                disabled={!demoInput.trim()}
                                onClick={() => {
                                  if (!demoInput.trim()) return;
                                  setDemoMessages((prev) => [
                                    ...prev,
                                    { id: prev.length + 1, user: "You", text: demoInput.trim(), time: new Date().toLocaleTimeString() },
                                  ]);
                                  setDemoInput("");
                                }}
                                className="bg-gradient-primary"
                              >
                                Send
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="px-3 py-2 border-b border-border bg-primary/10 text-primary flex items-center justify-between">
                              <span className="text-xs">Animated Emotes can be disabled in Settings</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs">{animatedEmotes ? "Show" : "Hide"}</span>
                                <Switch id="animated-emotes" checked={animatedEmotes} onCheckedChange={(v) => setAnimatedEmotes(!!v)} />
                              </div>
                            </div>
                            <div className="relative">
                              <AspectRatio ratio={16 / 20} className="bg-card">
                                <iframe
                                  title={`Twitch Chat - ${channel}`}
                                  src={chatSrc}
                                  loading="lazy"
                                  className="w-full h-full"
                                  onLoad={() => setLoadingChat(false)}
                                />
                              </AspectRatio>
                              {loadingChat && (
                                <div className="absolute inset-0 bg-card/60 grid place-items-center">
                                  <Skeleton className="w-16 h-6 rounded" />
                                </div>
                              )}
                            </div>
                            {/* Chat input bar */}
                            <div className="flex items-center gap-2 p-2 border-t border-border bg-card/70">
                              <Input
                                placeholder={channel ? `Chat as Twitch user in ${channel}` : "Enter a channel to chat"}
                                disabled={!channel}
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (!channel) return;
                                  window.open(`https://www.twitch.tv/popout/${channel}/chat?popout=`, "_blank");
                                }}
                                disabled={!channel}
                                className="bg-gradient-primary"
                              >
                                Open Chat
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>

            {/* Footer bar with links and app badges */}
            <footer className="mt-4 rounded-xl border border-border bg-card/40 p-4">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <nav className="flex flex-wrap items-center gap-3 text-sm">
                  <Link to="/">My Flock</Link>
                  <span className="text-muted-foreground">•</span>
                  <Link to="/my-tournaments">Tournaments</Link>
                  <span className="text-muted-foreground">•</span>
                  <Link to="/rules">Rules</Link>
                  <span className="text-muted-foreground">•</span>
                  <Link to="/support">Support</Link>
                  <span className="text-muted-foreground">•</span>
                  <Link to="/about">About Us</Link>
                </nav>
                <div className="flex items-center gap-3">
                  <img src="/images/appstore-badge.png" alt="Download on the App Store - FLOCKNODE" className="h-10 w-auto" loading="lazy" />
                  <img src="/images/googleplay-badge.png" alt="Get it on Google Play - FLOCKNODE" className="h-10 w-auto" loading="lazy" />
                </div>
              </div>
            </footer>
          </section>
        </main>

        <aside>
          <RightSquawkbox />
        </aside>
      </div>
    </div>
  );
}
