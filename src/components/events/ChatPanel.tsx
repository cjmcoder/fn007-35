import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Hash } from "lucide-react";
import { format } from "date-fns";

interface ChatPanelProps {
  eventId: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  isHost?: boolean;
  isModerator?: boolean;
}

// Mock chat messages
const mockMessages: ChatMessage[] = [
  {
    id: "1",
    userId: "host-1",
    username: "TourneyHost",
    message: "Welcome everyone! Tournament starts in 30 minutes. Good luck!",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    isHost: true
  },
  {
    id: "2",
    userId: "user-1",
    username: "ProGamer2024",
    message: "Excited for this tournament! Been practicing all week",
    timestamp: new Date(Date.now() - 1500000).toISOString()
  },
  {
    id: "3",
    userId: "mod-1",
    username: "ModeratorX",
    message: "Remember: fair play rules apply. Any suspicious activity will be investigated.",
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    isModerator: true
  },
  {
    id: "4",
    userId: "user-2",
    username: "SkillMaster",
    message: "What's the bracket format? Single or double elimination?",
    timestamp: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: "5",
    userId: "host-1",
    username: "TourneyHost",
    message: "Single elimination bracket. Check the bracket tab for more details.",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    isHost: true
  },
  {
    id: "6",
    userId: "user-3",
    username: "GameWizard",
    message: "Stream links required for all matches?",
    timestamp: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: "7",
    userId: "mod-1",
    username: "ModeratorX",
    message: "Yes, all matches must be streamed or recorded for verification.",
    timestamp: new Date(Date.now() - 180000).toISOString(),
    isModerator: true
  }
];

export function ChatPanel({ eventId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: "current-user",
      username: "You",
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserBadge = (message: ChatMessage) => {
    if (message.isHost) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">HOST</Badge>;
    }
    if (message.isModerator) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">MOD</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      
      {/* Chat Header */}
      <Card className="p-4 bg-card/50">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">Event Chat</h4>
          <Badge variant="secondary" className="ml-auto">
            {messages.filter(m => m.timestamp > new Date(Date.now() - 3600000).toISOString()).length} recent
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Stay respectful and follow community guidelines
        </p>
      </Card>

      {/* Chat Messages */}
      <Card className="bg-card/50">
        <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.username}`} />
                  <AvatarFallback>{message.username.slice(0, 2)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.username}</span>
                    {getUserBadge(message)}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.timestamp), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed break-words">
                    {message.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-primary"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </Card>

      {/* Chat Rules */}
      <Card className="p-4 bg-card/50">
        <h5 className="font-medium mb-2 text-sm">Chat Guidelines</h5>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>• Keep discussions related to the tournament</div>
          <div>• No spam, harassment, or offensive language</div>
          <div>• Respect all participants and staff</div>
          <div>• Follow FlockNode community standards</div>
        </div>
      </Card>

    </div>
  );
}