export const SERVER_TOPICS = {
  // Server lifecycle events
  SERVER_RESERVED: 'server.reserved',
  SERVER_READY: 'server.ready',
  SERVER_FAILED: 'server.failed',
  SERVER_RELEASED: 'server.released',
  
  // Server monitoring events
  SERVER_HEALTH_CHECK: 'server.health_check',
  SERVER_ADMIN_HOOK: 'server.admin_hook',
  SERVER_STATUS_UPDATE: 'server.status_update',
} as const;

// Event payload types
export interface ServerReservedEvent {
  matchId: string;
  panelServerId: number;
  region: string;
  gameSlug: string;
  timestamp: string;
}

export interface ServerReadyEvent {
  matchId: string;
  panelServerId: number;
  timestamp: string;
}

export interface ServerFailedEvent {
  matchId: string;
  reason: string;
  timestamp: string;
}

export interface ServerReleasedEvent {
  matchId: string;
  panelServerId: number;
  timestamp: string;
}

export interface ServerHealthCheckEvent {
  matchId: string;
  status: string;
  players?: number;
  uptime?: number;
  timestamp: string;
}

export interface ServerAdminHookEvent {
  matchId: string;
  status: string;
  message?: string;
  version?: string;
  timestamp: string;
}

export interface ServerStatusUpdateEvent {
  matchId: string;
  panelServerId: number;
  state: string;
  isInstalled: boolean;
  isStarted: boolean;
  timestamp: string;
}





