import type { GameEvent } from "@/lib/types";

// Mock events data
export const mockEvents: GameEvent[] = [
  {
    id: "event-1",
    title: "Madden Weekend Showdown",
    game: "Madden NFL 25",
    platform: "PS5",
    format: "Bracket",
    entryFee: 50,
    prizePool: 5000,
    maxParticipants: 128,
    currentParticipants: 97,
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: "3 hours",
    status: "open",
    verified: true,
    streamRequired: true,
    isJoined: false,
    description: "Join the ultimate Madden NFL 25 tournament featuring the best players from around the world."
  },
  {
    id: "event-2",
    title: "Arena Warriors Championship",
    game: "Arena Warriors",
    platform: "PC",
    format: "Swiss",
    entryFee: 100,
    prizePool: 10000,
    maxParticipants: 64,
    currentParticipants: 32,
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: "4 hours",
    status: "open",
    verified: true,
    streamRequired: false,
    isJoined: true,
    description: "Battle in the Arena Warriors championship with the largest prize pool of the season."
  },
  {
    id: "event-3",
    title: "Speed Trials Lightning Round",
    game: "Speed Trials",
    platform: "Mobile",
    format: "Leaderboard",
    entryFee: 25,
    prizePool: 2500,
    maxParticipants: 200,
    currentParticipants: 156,
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: "2 hours",
    status: "open",
    verified: false,
    streamRequired: false,
    isJoined: false,
    description: "Fast-paced racing competition with instant results and quick payouts."
  },
  {
    id: "event-4",
    title: "UFC 5 Friday Night Fights",
    game: "UFC 5",
    platform: "Xbox",
    format: "1v1",
    entryFee: 75,
    prizePool: 7500,
    maxParticipants: 100,
    currentParticipants: 100,
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: "5 hours",
    status: "full",
    verified: true,
    streamRequired: true,
    isJoined: false,
    description: "Elite UFC 5 competition featuring knockout rounds and professional commentary."
  },
  {
    id: "event-5",
    title: "FIFA 24 World Cup",
    game: "FIFA 24",
    platform: "PS5",
    format: "Bracket",
    entryFee: 200,
    prizePool: 20000,
    maxParticipants: 128,
    currentParticipants: 45,
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: "6 hours",
    status: "open",
    verified: true,
    streamRequired: true,
    isJoined: false,
    description: "The biggest FIFA tournament of the year with professional casting and analysis."
  },
  {
    id: "event-6",
    title: "NBA 2K25 Playoff Series",
    game: "NBA 2K25",
    platform: "PC",
    format: "Swiss",
    entryFee: 80,
    prizePool: 8000,
    maxParticipants: 100,
    currentParticipants: 67,
    startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    duration: "4 hours",
    status: "open",
    verified: true,
    streamRequired: false,
    isJoined: true,
    description: "Basketball simulation tournament with realistic gameplay and competitive ruleset."
  },
  {
    id: "event-7",
    title: "NHL 24 Ice Breaker",
    game: "NHL 24",
    platform: "Xbox",
    format: "1v1",
    entryFee: 40,
    prizePool: 4000,
    maxParticipants: 100,
    currentParticipants: 23,
    startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    duration: "3 hours",
    status: "open",
    verified: false,
    streamRequired: false,
    isJoined: false,
    description: "Hockey tournament featuring fast-paced matches and skilled competition."
  },
  {
    id: "event-8",
    title: "Madden Midnight Madness",
    game: "Madden NFL 25",
    platform: "PS5",
    format: "Bracket",
    entryFee: 30,
    prizePool: 3000,
    maxParticipants: 100,
    currentParticipants: 89,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Started 2 hours ago
    duration: "4 hours",
    status: "live",
    verified: true,
    streamRequired: true,
    isJoined: false,
    description: "Late night Madden tournament for night owls and competitive players."
  },
  {
    id: "event-9",
    title: "Arena Warriors Beginner Cup",
    game: "Arena Warriors",
    platform: "PC",
    format: "Swiss",
    entryFee: 20,
    prizePool: 2000,
    maxParticipants: 100,
    currentParticipants: 85,
    startTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    duration: "3 hours",
    status: "open",
    verified: false,
    streamRequired: false,
    isJoined: false,
    description: "Perfect tournament for new Arena Warriors players to get competitive experience."
  },
  {
    id: "event-10",
    title: "Speed Trials Weekly Challenge",
    game: "Speed Trials",
    platform: "Mobile",
    format: "Leaderboard",
    entryFee: 15,
    prizePool: 1500,
    maxParticipants: 300,
    currentParticipants: 234,
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: "1 hour",
    status: "open",
    verified: false,
    streamRequired: false,
    isJoined: false,
    description: "Weekly leaderboard challenge with quick races and instant scoring."
  },
  {
    id: "event-11",
    title: "Cross-Platform Championship",
    game: "Arena Warriors",
    platform: "All",
    format: "Bracket",
    entryFee: 150,
    prizePool: 15000,
    maxParticipants: 100,
    currentParticipants: 42,
    startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    duration: "5 hours",
    status: "open",
    verified: true,
    streamRequired: true,
    isJoined: false,
    description: "Epic cross-platform tournament bringing together the best players from all systems."
  },
  {
    id: "event-12",
    title: "Ultimate Fighter Challenge",
    game: "UFC 5",
    platform: "PS5",
    format: "1v1",
    entryFee: 60,
    prizePool: 6000,
    maxParticipants: 100,
    currentParticipants: 78,
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    duration: "4 hours",
    status: "completed",
    verified: true,
    streamRequired: true,
    isJoined: false,
    description: "Completed UFC tournament featuring intense fights and skilled competitors."
  }
];

// Mock API functions
export const eventsApi = {
  getEvents: async (filters?: any): Promise<GameEvent[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredEvents = [...mockEvents];
    
    if (filters) {
      if (filters.game && filters.game !== 'All') {
        filteredEvents = filteredEvents.filter(event => event.game === filters.game);
      }
      if (filters.platform && filters.platform !== 'All') {
        filteredEvents = filteredEvents.filter(event => event.platform === filters.platform);
      }
      if (filters.status) {
        filteredEvents = filteredEvents.filter(event => filters.status.includes(event.status));
      }
      // Add more filter logic as needed
    }
    
    return filteredEvents;
  },

  getEvent: async (id: string): Promise<GameEvent | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockEvents.find(event => event.id === id) || null;
  },

  joinEvent: async (eventId: string): Promise<{ success: boolean; updatedBalance: number }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Simulate joining the event
    event.currentParticipants += 1;
    event.isJoined = true;
    
    return {
      success: true,
      updatedBalance: 1250 - event.entryFee // Mock updated balance
    };
  }
};