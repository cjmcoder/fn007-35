import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Send, X } from "lucide-react";
import { useSquawkbox } from "@/store/useSquawkbox";
import { useUI } from "@/store/useUI";
import { cn } from "@/lib/utils";

interface SquawkboxComponentProps {
  variant?: "sidebar" | "embedded";
  className?: string;
  height?: string;
}

export const SquawkboxComponent = ({ 
  variant = "sidebar", 
  className = "",
  height = "600px"
}: SquawkboxComponentProps) => {
  const { 
    currentChannel, 
    message, 
    channels, 
    setCurrentChannel, 
    setMessage, 
    sendMessage, 
    getFilteredMessages 
  } = useSquawkbox();
  
  const { rightRailOpen, setRightRailOpen } = useUI();
  const filteredMessages = getFilteredMessages();

  const handleSendMessage = () => {
    sendMessage();
  };

  if (variant === "embedded") {
    return (
      <Card className={cn("gaming-card flex flex-col", className)} style={{ height }}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold gradient-text">SQUAWKBOX</h3>
          </div>
          
          <Select value={currentChannel} onValueChange={setCurrentChannel}>
            <SelectTrigger className="w-full bg-primary/20 border-primary/30 text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {channels.map((channel) => (
                <SelectItem key={channel} value={channel}>
                  {channel.toUpperCase()} CHANNEL
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-card/20">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className="flex items-start space-x-3">
              <Avatar className="w-8 h-8 border border-border">
                <AvatarFallback className="bg-gradient-primary text-background text-xs font-bold">
                  {msg.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-neon-cyan">{msg.user.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {msg.user.rating}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                
                <p className="text-sm text-foreground break-words">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-card/50 border-t border-border">
          <div className="flex items-center space-x-2 mb-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
            <Button 
              size="sm" 
              className="bg-gradient-primary"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            The Squawkbox is here to help gamers set up skill-based matches. 
            Misuse may result in warnings or account suspension.
          </p>
        </div>
      </Card>
    );
  }

  // Sidebar variant (for RightSquawkbox)
  return (
    <>
      {/* Mobile Overlay */}
      {rightRailOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setRightRailOpen(false)}
        />
      )}
      
      {/* Squawkbox */}
      <aside className={cn(
        "fixed md:static inset-y-0 right-0 z-50 w-80 bg-card/30 backdrop-blur-md border-l border-border flex flex-col transition-transform duration-300",
        rightRailOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
        className
      )}>
        {/* Header */}
        <div className="bg-card/50 p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold gradient-text text-lg">SQUAWKBOX</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setRightRailOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <Select value={currentChannel} onValueChange={setCurrentChannel}>
            <SelectTrigger className="w-full bg-primary/20 border-primary/30 text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {channels.map((channel) => (
                <SelectItem key={channel} value={channel}>
                  {channel.toUpperCase()} CHANNEL
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-card/20">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className="flex items-start space-x-3">
              {/* Avatar */}
              <Avatar className="w-8 h-8 border border-border">
                <AvatarFallback className="bg-gradient-primary text-background text-xs font-bold">
                  {msg.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-neon-cyan">{msg.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                
                <p className="text-sm text-foreground break-words">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-card/50 border-t border-border">
          <div className="flex items-center space-x-2 mb-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
            <Button 
              size="sm" 
              className="bg-gradient-primary"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            The Squawkbox is here to help gamers set up skill-based matches. 
            Misuse may result in warnings or account suspension.
          </p>
        </div>
      </aside>
    </>
  );
};