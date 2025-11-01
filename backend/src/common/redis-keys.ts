export const laneKey = (g: string, m: string, r: string, s: string, e: string) =>
  `q:${g}:${m}:${r}:${s}:${e}`; // ZSET score=enqueuedAt

export const seekKey = (ticketId: string) => `seek:${ticketId}`;
export const matchLockKey = (matchId: string) => `lock:match:${matchId}`;

export const EVT = {
  FLOCKTUBE_OVERLAY: 'evt.flocktube.overlay',
  MATCH_LIFECYCLE: 'evt.match.lifecycle',
};

