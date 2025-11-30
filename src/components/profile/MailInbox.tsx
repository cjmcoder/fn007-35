import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, 
  Trash2, 
  Archive, 
  Star, 
  Send, 
  Plus,
  Search,
  ChevronRight,
  AlertTriangle,
  Trophy,
  Eye,
  Settings,
  Users
} from "lucide-react";

interface Message {
  id: string;
  sender: string;
  avatar?: string;
  subject: string;
  content: string;
  timestamp: string;
  isNew: boolean;
  isStarred?: boolean;
  type: 'message' | 'challenge' | 'alert' | 'system';
  category?: string;
}

export function MailInbox() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real messages from backend
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with real endpoint when available
        // const response = await fetch('/api/messages');
        // if (!response.ok) throw new Error('Failed to fetch messages');
        // const data = await response.json();
        // setMessages(data.messages || []);
        setMessages([]); // Empty until backend endpoint is ready
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const filterMessages = (type?: string) => {
    let filtered = messages;
    
    if (type && type !== "inbox") {
      filtered = messages.filter(msg => {
        switch(type) {
          case "challenges":
            return msg.type === "challenge";
          case "alerts":
            return msg.type === "alert" || msg.type === "system";
          case "new":
            return msg.isNew;
          case "starred":
            return msg.isStarred;
          default:
            return true;
        }
      });
    }
    
    if (searchQuery) {
      filtered = filtered.filter(msg => 
        (msg.sender || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.content || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getUnreadCount = (type?: string) => {
    return filterMessages(type).filter(msg => msg.isNew).length;
  };

  const MessageItem = ({ message }: { message: Message }) => (
    <div 
      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 border-b border-border/30 transition-colors ${
        selectedMessage?.id === message.id ? 'bg-accent/70' : ''
      } ${message.isNew ? 'bg-primary/5' : ''}`}
      onClick={() => setSelectedMessage(message)}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={message.avatar} />
        <AvatarFallback className="text-xs bg-primary/20">
          {message.sender.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm truncate ${message.isNew ? 'font-semibold' : 'font-medium'}`}>
            {message.sender}
          </span>
          {message.isNew && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
              NEW
            </Badge>
          )}
          {message.type === "challenge" && (
            <Trophy className="h-3 w-3 text-amber-500" />
          )}
          {message.type === "alert" && (
            <AlertTriangle className="h-3 w-3 text-red-500" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{message.content}</p>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
        <span>{message.timestamp}</span>
        <ChevronRight className="h-3 w-3" />
      </div>
    </div>
  );

  const MessageDetail = ({ message }: { message: Message }) => (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={message.avatar} />
              <AvatarFallback className="bg-primary/20">
                {message.sender.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{message.sender}</h3>
              <p className="text-sm text-muted-foreground">{message.timestamp}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <h2 className="text-lg font-semibold">{message.subject}</h2>
      </div>
      
      <div className="flex-1 p-4">
        <div className="prose prose-sm max-w-none">
          <p>{message.content}</p>
        </div>
      </div>
      
      <div className="p-4 border-t border-border/30">
        <div className="flex gap-2">
          <Button className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            Reply
          </Button>
          {message.type === "challenge" && (
            <>
              <Button variant="outline">Accept</Button>
              <Button variant="outline">Decline</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="gaming-card h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Mail Inbox
          </CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 h-full">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 border-r border-border/30 flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-border/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-2 mx-3 mt-3">
                <TabsTrigger value="inbox" className="text-xs">
                  <Mail className="h-3 w-3 mr-1" />
                  Inbox
                  {getUnreadCount("inbox") > 0 && (
                    <Badge className="ml-2 bg-primary text-primary-foreground h-5 min-w-5 px-1.5 text-xs">
                      {getUnreadCount("inbox")}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="challenges" className="text-xs">
                  <Trophy className="h-3 w-3 mr-1" />
                  Challenges
                  {getUnreadCount("challenges") > 0 && (
                    <Badge className="ml-2 bg-amber-500 text-white h-5 min-w-5 px-1.5 text-xs">
                      {getUnreadCount("challenges")}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              {/* Additional Categories */}
              <div className="px-3 py-2 border-b border-border/30">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start text-xs h-8 ${activeTab === "new" ? "bg-accent" : ""}`}
                    onClick={() => setActiveTab("new")}
                  >
                    <AlertTriangle className="h-3 w-3 mr-2" />
                    New Messages
                    {getUnreadCount("new") > 0 && (
                      <Badge className="ml-auto bg-green-500 text-white h-4 min-w-4 px-1 text-xs">
                        {getUnreadCount("new")}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start text-xs h-8 ${activeTab === "alerts" ? "bg-accent" : ""}`}
                    onClick={() => setActiveTab("alerts")}
                  >
                    <Settings className="h-3 w-3 mr-2" />
                    System Alerts
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start text-xs h-8 ${activeTab === "starred" ? "bg-accent" : ""}`}
                    onClick={() => setActiveTab("starred")}
                  >
                    <Star className="h-3 w-3 mr-2" />
                    Starred
                  </Button>
                </div>
              </div>
              
              {/* Messages List */}
              <TabsContent value={activeTab} className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div>
                    {filterMessages(activeTab).map((message) => (
                      <MessageItem key={message.id} message={message} />
                    ))}
                    {filterMessages(activeTab).length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No messages found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Message Detail */}
          <div className="flex-1 flex flex-col">
            {selectedMessage ? (
              <MessageDetail message={selectedMessage} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Select a message</p>
                  <p className="text-sm">Choose a message from the list to view its contents</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}