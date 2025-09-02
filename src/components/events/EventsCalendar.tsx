import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay } from "date-fns";
import { CalendarIcon, Trophy, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GameEvent } from "@/lib/types";

interface EventsCalendarProps {
  events: GameEvent[];
  onEventSelect: (event: GameEvent) => void;
}

export function EventsCalendar({ events, onEventSelect }: EventsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get events for selected date
  const eventsForSelectedDate = events.filter(event => 
    selectedDate && isSameDay(new Date(event.startTime), selectedDate)
  );

  // Get all event dates for highlighting
  const eventDates = events.map(event => new Date(event.startTime));

  // Get event count by date for the calendar
  const getEventCountForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.startTime), date)).length;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      
      {/* Calendar */}
      <Card className="lg:col-span-2 glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">Events Calendar</h3>
        </div>
        
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="pointer-events-auto w-full"
          modifiers={{
            event: eventDates
          }}
          modifiersStyles={{
            event: {
              backgroundColor: 'hsl(var(--primary) / 0.2)',
              color: 'hsl(var(--primary))',
              fontWeight: 'bold',
              border: '1px solid hsl(var(--primary) / 0.4)',
              borderRadius: '6px'
            }
          }}
          components={{
            DayContent: ({ date }) => {
              const eventCount = getEventCountForDate(date);
              return (
                <div className="relative w-full h-full flex items-center justify-center">
                  <span>{date.getDate()}</span>
                  {eventCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-primary/80 text-primary-foreground"
                    >
                      {eventCount}
                    </Badge>
                  )}
                </div>
              );
            }
          }}
        />
        
        <div className="mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary/20 border border-primary/40" />
            <span>Days with events</span>
          </div>
        </div>
      </Card>

      {/* Event Details Sidebar */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">
          {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
        </h3>
        
        <ScrollArea className="h-[400px]">
          {eventsForSelectedDate.length > 0 ? (
            <div className="space-y-4">
              {eventsForSelectedDate.map((event) => (
                <div 
                  key={event.id} 
                  className="p-4 rounded-lg bg-background/50 border border-border hover:bg-background/70 transition-colors cursor-pointer"
                  onClick={() => onEventSelect(event)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm leading-tight">{event.title}</h4>
                    <Badge 
                      variant={event.status === 'live' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {event.status === 'live' ? 'LIVE' : event.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-3 w-3" />
                      <span>{event.game} • Prize: {event.prizePool.toLocaleString()} FC</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(event.startTime), 'HH:mm')} • {event.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                      {event.format}
                    </Badge>
                    <span className="text-xs font-mono font-semibold">
                      {event.entryFee} FC entry
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No events scheduled for this date</p>
            </div>
          )}
        </ScrollArea>

        {/* Quick Actions */}
        {eventsForSelectedDate.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button 
              size="sm" 
              className="w-full bg-gradient-primary"
              onClick={() => eventsForSelectedDate[0] && onEventSelect(eventsForSelectedDate[0])}
            >
              View All Events This Day
            </Button>
          </div>
        )}
      </Card>

    </div>
  );
}