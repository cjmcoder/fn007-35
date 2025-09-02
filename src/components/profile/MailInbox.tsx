import { useState } from "react";
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

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "SCHOOLEM 007",
    avatar: "/lovable-uploads/83a64713-521e-49d1-a475-4b264de18cf4.png",
    subject: "Challenge Cancelled",
    content: "SCHOOLEM 007 has cancelled their challenge",
    timestamp: "9/01 10:22 pm",
    isNew: true,
    type: "challenge"
  },
  {
    id: "2", 
    sender: "SCHOOLEM 007",
    avatar: "/lovable-uploads/83a64713-521e-49d1-a475-4b264de18cf4.png",
    subject: "New Challenge",
    content: "SCHOOLEM 007 sent you a challenge",
    timestamp: "9/01 10:22 pm",
    isNew: true,
    type: "challenge"
  },
  {
    id: "3",
    sender: "Pangos",
    avatar: "/lovable-uploads/89d6cce3-74a3-4deb-aed9-65a543785aa1.png",
    subject: "Message",
    content: "Pangos sent you a message.",
    timestamp: "8/18 11:40 am",
    isNew: true,
    type: "message"
  },
  {
    id: "4",
    sender: "tyeagles366",
    avatar: "/lovable-uploads/934bd6df-9bca-4fb1-8eed-c03afc3fa032.png",
    subject: "Game Request",
    content: "wanna play 5 or 6 min quarters 10-25$",
    timestamp: "8/18 11:30 am",
    isNew: true,
    type: "message"
  },
  {
    id: "5",
    sender: "System",
    subject: "Welcome Bonus",
    content: "Your welcome bonus has been credited to your account",
    timestamp: "8/16 1:30 pm",
    isNew: false,
    type: "system"
  }
];

export function MailInbox() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");

  const filterMessages = (type?: string) => {
    let filtered = mockMessages;
    
    if (type && type !== "inbox") {
      filtered = mockMessages.filter(msg => {
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
        msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
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