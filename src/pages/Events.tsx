import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TopNav } from "@/components/layout/TopNav";
import { LeftNav } from "@/components/layout/LeftNav";
import { RightSquawkbox } from "@/components/layout/RightSquawkbox";
import { EventFilters } from "@/components/events/EventFilters";
import { EventCard } from "@/components/events/EventCard";
import { SkillStatsGrid } from "@/components/common/SkillStatsGrid";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { EventDetailModal } from "@/components/events/EventDetailModal";
import { MessageSquare, Calendar, List, Search, Trophy, Filter } from "lucide-react";
import { useUI } from "@/store/useUI";
import { cn } from "@/lib/utils";
import { mockEvents } from "@/mocks/eventsApi";
import type { GameEvent } from "@/lib/types";
import challengesData from "@/__mocks__/challenges.json";

export default function Events() {
  const { rightRailOpen, setRightRailOpen } = useUI();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'my-events' | 'past' | 'stats'>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [events] = useState<GameEvent[]>(mockEvents);
  const challenges = challengesData as any[];

  const handleJoinEvent = (event: GameEvent) => {
    console.log("Joining event:", event.id);
    // TODO: Implement join logic
  };

  const handleViewDetails = (event: GameEvent) => {
    setSelectedEvent(event);
  };

  const getFilteredEvents = () => {
    const now = new Date();
    switch (activeTab) {
      case 'upcoming':
        return events.filter(event => new Date(event.startTime) > now && event.status === 'open');
      case 'my-events':
        return events.filter(event => event.isJoined);
      case 'past':
        return events.filter(event => new Date(event.startTime) < now || event.status === 'completed');
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopNav />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold gradient-text">Events</h1>
                <p className="text-muted-foreground mt-1">
                  Join skill-based tournaments and competitions
                </p>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    viewMode === 'list' && "bg-primary/20 text-primary border-primary/30"
                  )}
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className={cn(
                    viewMode === 'calendar' && "bg-primary/20 text-primary border-primary/30"
                  )}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
                <TabsTrigger value="upcoming" className="flex items-center gap-2">
                  Upcoming
                  <Badge variant="secondary" className="text-xs">
                    {events.filter(e => new Date(e.startTime) > new Date() && e.status === 'open').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="my-events" className="flex items-center gap-2">
                  My Events
                  <Badge variant="secondary" className="text-xs">
                    {events.filter(e => e.isJoined).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Skill Stats
                </TabsTrigger>
              </TabsList>

              {/* Filters */}
              <div className="mt-6">
                <EventFilters />
              </div>

              <TabsContent value={activeTab} className="mt-6">
                {viewMode === 'list' ? (
                  <div className="space-y-6">
                    {/* Events Grid */}
                    {filteredEvents.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onJoin={handleJoinEvent}
                            onViewDetails={handleViewDetails}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 glass-card rounded-2xl">
                        <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No events found</h3>
                        <p className="text-muted-foreground mb-4">
                          Try adjusting your filters or check back later for new events.
                        </p>
                        <Button variant="outline">Clear Filters</Button>
                      </div>
                    )}

                    {/* Load More */}
                    {filteredEvents.length > 0 && (
                      <div className="flex justify-center">
                        <Button variant="outline" className="bg-card/50 border-border hover:bg-card/80">
                          Load More Events
                        </Button>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'stats' ? (
                  <div className="space-y-6">
                    <SkillStatsGrid
                      title="Tournament Skill Stats Challenges"
                      items={challenges.slice(0, 9)}
                      type="challenge"
                      className="mb-6"
                    />
                  </div>
                ) : (
                  <EventsCalendar events={filteredEvents} onEventSelect={handleViewDetails} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <RightSquawkbox />
      </div>
      
      {/* Mobile Chat Toggle */}
      <Button
        className="fixed bottom-4 right-4 md:hidden z-30 bg-gradient-primary shadow-glow"
        onClick={() => setRightRailOpen(!rightRailOpen)}
      >
        <MessageSquare className="w-5 h-5" />
      </Button>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onJoin={handleJoinEvent}
        />
      )}
    </div>
  );
}