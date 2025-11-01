export type ModeStr = 'CONSOLE_VERIFIED_STREAM'|'CLOUD_STREAM';

export function stakeBucket(stakeCents: number) {
  if (stakeCents <= 500) return 'S-5';
  if (stakeCents <= 1000) return 'S-10';
  if (stakeCents <= 2500) return 'S-25';
  if (stakeCents <= 5000) return 'S-50';
  return 'S-100+';
}

export function laneKeyParts(p: { gameId: string; mode: ModeStr; region: string; stakeCents: number; eloBand: string }) {
  return {
    game: p.gameId,
    mode: p.mode,
    region: p.region,
    stakeB: stakeBucket(p.stakeCents),
    elo: p.eloBand,
  };
}

export function laneZsetKey(parts: { game: string; mode: ModeStr; region: string; stakeB: string; elo: string }) {
  return `q:${parts.game}:${parts.mode}:${parts.region}:${parts.stakeB}:${parts.elo}`;
}

