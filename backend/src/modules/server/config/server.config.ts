// Server configuration constants
export const READY_DEADLINE_SEC = 300;      // Server must reach READY within 5 min
export const POLL_INTERVAL_MS = 4000;

// Kafka topics
export const TOPIC_SERVER_RESERVED = 'server.reserved';
export const TOPIC_SERVER_READY = 'server.ready';
export const TOPIC_SERVER_FAILED = 'server.failed';
export const TOPIC_SERVER_RELEASED = 'server.released';

// Game presets mapping gameSlug → Pterodactyl configuration
export interface GamePreset {
  eggId: number;
  dockerImage: string;
  startup: string;
  environment: Record<string, string>;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
  };
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  port_range?: [number, number]; // optional if you pre-allocate on the node
}

export const GAME_PRESETS: Record<string, GamePreset> = {
  'assetto-corsa-competizione': {
    eggId: 123,
    dockerImage: 'ghcr.io/flocknode/acc:latest',
    startup: './acc-server --config server_cfg.ini',
    environment: {
      SERVER_NAME: 'FLOCKNODE-ACC-#{MATCH_ID}',
      MATCH_ID: '#{MATCH_ID}',
      MAX_PLAYERS: '2',
      PASSWORD: '#{MATCH_ID}',
    },
    limits: { 
      memory: 4096, 
      swap: 0, 
      disk: 10240, 
      io: 500, 
      cpu: 200 
    },
    feature_limits: { 
      databases: 0, 
      allocations: 1, 
      backups: 1 
    },
  },
  'pes6': {
    eggId: 124,
    dockerImage: 'ghcr.io/flocknode/pes6:latest',
    startup: './pes6-server --config server.ini',
    environment: {
      SERVER_NAME: 'FLOCKNODE-PES6-#{MATCH_ID}',
      MATCH_ID: '#{MATCH_ID}',
      MAX_PLAYERS: '2',
      PASSWORD: '#{MATCH_ID}',
    },
    limits: { 
      memory: 2048, 
      swap: 0, 
      disk: 5120, 
      io: 300, 
      cpu: 150 
    },
    feature_limits: { 
      databases: 0, 
      allocations: 1, 
      backups: 1 
    },
  },
  'fifa-24': {
    eggId: 125,
    dockerImage: 'ghcr.io/flocknode/fifa24:latest',
    startup: './fifa24-server --config server.json',
    environment: {
      SERVER_NAME: 'FLOCKNODE-FIFA24-#{MATCH_ID}',
      MATCH_ID: '#{MATCH_ID}',
      MAX_PLAYERS: '2',
      PASSWORD: '#{MATCH_ID}',
    },
    limits: { 
      memory: 3072, 
      swap: 0, 
      disk: 8192, 
      io: 400, 
      cpu: 175 
    },
    feature_limits: { 
      databases: 0, 
      allocations: 1, 
      backups: 1 
    },
  },
  // Add more games here as needed
};

// Region → Pterodactyl location/node mapping
export const REGION_TO_LOCATION: Record<string, number> = {
  'us-east': 1,
  'us-central': 2,
  'us-west': 3,
  'eu-west': 4,
  'eu-central': 5,
  'asia-pacific': 6,
};

// Server states
export enum ServerState {
  REQUESTED = 'REQUESTED',
  PROVISIONING = 'PROVISIONING',
  READY = 'READY',
  FAILED = 'FAILED',
  RELEASING = 'RELEASING',
  RELEASED = 'RELEASED',
}

// Environment variable validation
export const validateServerConfig = () => {
  const required = [
    'PTERO_APP_URL',
    'PTERO_APP_API_KEY',
    'ADMIN_HOOK_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};





