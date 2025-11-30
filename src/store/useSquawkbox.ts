import { create } from 'zustand';
// Removed mock data import - fetch from real API instead

export interface SquawkboxMessage {
  id: string;
  channel: string;
  user: {
    id: string;
    name: string;
    rating: number;
  };
  text: string;
  createdAt: string;
}

interface SquawkboxStore {
  currentChannel: string;
  message: string;
  messages: SquawkboxMessage[];
  channels: string[];
  setCurrentChannel: (channel: string) => void;
  setMessage: (message: string) => void;
  sendMessage: () => void;
  addMessage: (message: SquawkboxMessage) => void;
  getFilteredMessages: () => SquawkboxMessage[];
}

export const useSquawkbox = create<SquawkboxStore>((set, get) => ({
  currentChannel: "Madden",
  message: "",
  messages: [], // TODO: Fetch from real API endpoint /api/squawkbox/messages
  channels: [
    "Madden", "UFC", "FIFA", "NHL", "NBA", "MLB", "UNDISPUTED", "F1", "TENNIS", "CustomUnity", 
    "Fighters", "Shooters", "Golf", "Rocket League", 
    "Mobile", "VR", "Retro"
  ],
  
  setCurrentChannel: (channel: string) => set({ currentChannel: channel }),
  
  setMessage: (message: string) => set({ message }),
  
  sendMessage: () => {
    const state = get();
    if (state.message.trim()) {
      const newMessage: SquawkboxMessage = {
        id: `msg-${Date.now()}`,
        channel: state.currentChannel,
        user: {
          id: "current-user",
          name: "You",
          rating: 8.5
        },
        text: state.message,
        createdAt: new Date().toISOString()
      };
      
      set({ 
        messages: [...state.messages, newMessage],
        message: ""
      });
    }
  },
  
  addMessage: (message: SquawkboxMessage) => {
    const state = get();
    set({ messages: [...state.messages, message] });
  },
  
  getFilteredMessages: () => {
    const state = get();
    return state.messages.filter(msg => msg.channel === state.currentChannel);
  }
}));