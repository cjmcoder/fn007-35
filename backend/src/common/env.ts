export const ENV = {
  SEEK_TTL_SECONDS: parseInt(process.env.SEEK_TTL_SECONDS ?? '90', 10),
  CHALLENGE_EXPIRY_MINUTES: parseInt(process.env.CHALLENGE_EXPIRY_MINUTES ?? '30', 10),
  ACCEPT_CONFIRM_SECONDS: parseInt(process.env.ACCEPT_CONFIRM_SECONDS ?? '90', 10),
  READY_STARTBY_MINUTES: parseInt(process.env.READY_STARTBY_MINUTES ?? '10', 10),
  VERIFY_WINDOW_MINUTES: parseInt(process.env.VERIFY_WINDOW_MINUTES ?? '5', 10),
  LIVE_STREAM_DROP_GRACE_SECONDS: parseInt(process.env.LIVE_STREAM_DROP_GRACE_SECONDS ?? '120', 10),
  MATCH_BOARD_ENABLED: (process.env.MATCH_BOARD_ENABLED ?? 'true') === 'true',
  QUICKMATCH_ENABLED: (process.env.QUICKMATCH_ENABLED ?? 'true') === 'true',
  FLOCKTUBE_API_URL: process.env.FLOCKTUBE_API_URL ?? '',
  FLOCKTUBE_API_KEY: process.env.FLOCKTUBE_API_KEY ?? '',
};

