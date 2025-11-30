import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PayoutTable } from "./PayoutTable";
import { ParticipantsList } from "./ParticipantsList";
import { ChatPanel } from "./ChatPanel";
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  Shield, 
  Video, 
  Gamepad2,
  Star,
  X
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { GameEvent } from "@/lib/types";
import { useWallet } from "@/store/useWallet";
import { useToast } from "@/hooks/use-toast";

interface EventDetailModalProps {
  event: GameEvent;
  open: boolean;
  onClose: () => void;
  onJoin: (event: GameEvent) => void;
}

export function EventDetailModal({ event, open, onClose, onJoin }: EventDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { wallet } = useWallet();
  const { toast } = useToast();

  const handleJoin = () => {
    if (wallet.fc < event.entryFee) {
      toast({
        title: "Insufficient FC",
        description: `You need ${event.entryFee} FC to join this event. Your balance: ${wallet.fc} FC`,
        variant: "destructive"
      });
      return;
    }

    onJoin(event);
    toast({
      title: "Event Joined!",
      description: `Successfully joined ${event.title}. Entry fee of ${event.entryFee} FC has been locked.`,
    });
  };

  const isJoinable = event.status === 'open' && 
                     event.currentParticipants < event.maxParticipants && 
                     !event.isJoined;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] glass-card">
        <DialogHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold gradient-text mb-2">
                {event.title}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span>{event.game}</span>
                  <Badge variant="outline" className="text-xs">
                    {event.platform}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(event.startTime), 'MMM d, yyyy HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{event.duration}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {event.verified && (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Shield className="w-3 h-3 mr-1" />
                  VERIFIED
                </Badge>
              )}
              {event.status === 'live' && (
                <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                  LIVE
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Card className="p-3 bg-card/50">
              <div className="text-center">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="font-bold text-primary">{event.prizePool.toLocaleString()} FC</div>
                <div className="text-xs text-muted-foreground">Prize Pool</div>
              </div>
            </Card>
            <Card className="p-3 bg-card/50">
              <div className="text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="font-bold">{event.currentParticipants}/{event.maxParticipants}</div>
                <div className="text-xs text-muted-foreground">Participants</div>
              </div>
            </Card>
            <Card className="p-3 bg-card/50">
              <div className="text-center">
                <Star className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="font-bold">{event.entryFee} FC</div>
                <div className="text-xs text-muted-foreground">Entry Fee</div>
              </div>
            </Card>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bracket">Bracket</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="space-y-4">
              <Card className="p-4 bg-card/50">
                <h4 className="font-semibold mb-2">Event Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.description || `Join this exciting ${event.game} tournament featuring ${(event.format || '').toLowerCase()} competition. Test your skills against players from around the world and compete for the ${event.prizePool.toLocaleString()} FC prize pool.`}
                </p>
              </Card>

              <Card className="p-4 bg-card/50">
                <h4 className="font-semibold mb-2">Rules & Format</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      {event.format}
                    </Badge>
                    <span>Tournament format</span>
                  </div>
                  <div>• All matches must be completed within the scheduled time</div>
                  <div>• Fair play and sportsmanship expected</div>
                  <div>• No coaching or external assistance allowed</div>
                  {event.streamRequired && (
                    <div className="flex items-center gap-2 text-orange-400">
                      <Video className="w-4 h-4" />
                      <span>Stream recording required for verification</span>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4 bg-card/50">
                <h4 className="font-semibold mb-2">Anti-Cheat & Security</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>Advanced anti-cheat protection enabled</span>
                  </div>
                  <div>• All gameplay monitored for suspicious activity</div>
                  <div>• Disputes handled by verified moderators</div>
                  <div>• Instant replay system for match verification</div>
                </div>
              </Card>

              <Card className="p-4 bg-card/50">
                <h4 className="font-semibold mb-2">Host Information</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">{event.host || 'FlockNode Tournament'}</div>
                    <div className="text-xs text-muted-foreground">Verified Tournament Organizer</div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="bracket">
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Tournament Bracket</h3>
                <p className="text-muted-foreground">
                  Bracket will be generated once registration closes
                </p>
              </div>
            </TabsContent>

            <TabsContent value="payouts">
              <PayoutTable event={event} />
            </TabsContent>

            <TabsContent value="participants">
              <ParticipantsList event={event} />
            </TabsContent>

            <TabsContent value="chat">
              <ChatPanel eventId={event.id} />
            </TabsContent>
          </ScrollArea>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Your Balance: <span className="font-mono font-bold text-primary">{wallet.fc} FC</span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              
              {isJoinable ? (
                <Button 
                  className="bg-gradient-primary" 
                  onClick={handleJoin}
                  disabled={wallet.fc < event.entryFee}
                >
                  Join Event ({event.entryFee} FC)
                </Button>
              ) : (
                <Button disabled>
                  {event.isJoined ? 'Already Joined' : 
                   event.status === 'full' ? 'Event Full' : 
                   event.status === 'live' ? 'Event Live' : 'Cannot Join'}
                </Button>
              )}
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}