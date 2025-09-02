import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { CalendarIcon, Trophy, Users, Clock } from "lucide-react";

// Mock events data
const mockEvents = [
  {
    id: 1,
    date: new Date(2025, 0, 20), // January 20, 2025
    title: "Weekly Tournament",
    type: "tournament",
    game: "Madden NFL 25",
    prize: "$500",
    participants: 32,
    time: "7:00 PM EST"
  },
  {
    id: 2,
    date: new Date(2025, 0, 22), // January 22, 2025
    title: "NBA 2K25 Championship",
    type: "championship",
    game: "NBA 2K25",
    prize: "$1,000",
    participants: 64,
    time: "8:00 PM EST"
  },
  {
    id: 3,
    date: new Date(2025, 0, 25), // January 25, 2025
    title: "Friday Night Fights",
    type: "tournament",
    game: "UFC 5",
    prize: "$250",
    participants: 16,
    time: "9:00 PM EST"
  }
];

export function EventsCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get events for selected date
  const eventsForSelectedDate = mockEvents.filter(event => 
    selectedDate && isSameDay(event.date, selectedDate)
  );

  // Get all event dates for highlighting
  const eventDates = mockEvents.map(event => event.date);

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Calendar */}
        <Card className="p-4 bg-card/40 border-border">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="h-5 w-5" />
            <h3 className="font-semibold">Event Calendar</h3>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="pointer-events-auto"
            modifiers={{
              event: eventDates
            }}
            modifiersStyles={{
              event: {
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                borderRadius: '6px'
              }
            }}
          />
          <div className="mt-4 text-xs text-muted-foreground">
            Highlighted dates have scheduled events
          </div>
        </Card>

        {/* Event Details */}
        <Card className="p-4 bg-card/40 border-border">
          <h3 className="font-semibold mb-4">
            {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
          </h3>
          
          {eventsForSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {eventsForSelectedDate.map((event) => (
                <div key={event.id} className="p-3 rounded-lg bg-background/50 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge variant={event.type === 'championship' ? 'default' : 'secondary'}>
                      {event.type === 'championship' ? 'Championship' : 'Tournament'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>{event.game} • Prize: {event.prize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No events scheduled for this date</p>
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="p-4 bg-card/40 border-border">
        <h3 className="font-semibold mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {mockEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{event.title}</h4>
                  <Badge variant={event.type === 'championship' ? 'default' : 'secondary'} className="text-xs">
                    {event.type === 'championship' ? 'Championship' : 'Tournament'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(event.date, "MMM d, yyyy")} • {event.time} • {event.game}
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold text-primary">{event.prize}</div>
                <div className="text-muted-foreground">{event.participants} players</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}