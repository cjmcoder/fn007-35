export const OVERLAY_TOPICS = {
  // Event ingestion
  EVENT_INGESTED: 'overlay.event.ingested',
  
  // Score updates
  SCORE_UPDATED: 'overlay.score.updated',
  
  // Match state changes
  STATE_CHANGED: 'overlay.state',
  MATCH_END: 'overlay.match_end',
  
  // Heartbeat and monitoring
  HEARTBEAT: 'overlay.heartbeat',
  
  // Security and violations
  VIOLATION: 'overlay.violation',
  
  // Secret management
  SECRET_GENERATED: 'overlay.secret.generated',
  SECRET_REVOKED: 'overlay.secret.revoked',
} as const;

// Event payload types
export interface OverlayEventIngestedEvent {
  matchId: string;
  type: string;
  eventId: string;
  timestamp: number;
}

export interface OverlayScoreUpdatedEvent {
  matchId: string;
  home: number;
  away: number;
  eventId: string;
  timestamp: number;
}

export interface OverlayStateEvent {
  matchId: string;
  payload: any;
  eventId: string;
  timestamp: number;
}

export interface OverlayMatchEndEvent {
  matchId: string;
  payload: any;
  eventId: string;
  timestamp: number;
}

export interface OverlayHeartbeatEvent {
  matchId: string;
  status: string;
  eventId: string;
  timestamp: number;
}

export interface OverlayViolationEvent {
  matchId?: string;
  type: 'signature_failure' | 'replay_attack' | 'rate_limit' | 'invalid_ip' | 'clock_skew';
  details: any;
  ip?: string;
  timestamp: number;
}

export interface OverlaySecretGeneratedEvent {
  matchId: string;
  keyId: string;
  timestamp: number;
}

export interface OverlaySecretRevokedEvent {
  matchId: string;
  timestamp: number;
}





