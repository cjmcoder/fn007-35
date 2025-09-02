/*
  propsApi mock - intercepts fetch requests to provide API stubs:
  - GET /api/props/live?channel=Madden&limit=100 -> { items: LiveProp[] }
  - GET /api/props/:id -> LiveProp
  - GET /api/props/subscribe -> 204 (SSE not implemented; use polling)
  Replace by removing this import in main.tsx when backend is ready.
*/

import type { LiveProp, TickerChannel, GameTitle, Platform } from '@/lib/types';

(function setupMock() {
  if (typeof window === 'undefined') return;
  // ensure single install
  if ((window as any).__propsApiMockInstalled) return;
  (window as any).__propsApiMockInstalled = true;

  const now = Date.now();
  const mk = (p: Partial<LiveProp> & Pick<LiveProp, 'id' | 'channel' | 'title' | 'propType' | 'entryFC' | 'payoutFC' | 'line' | 'statType'>): LiveProp => ({
    id: p.id,
    channel: p.channel,
    player: p.player || { id: 'p1', name: 'PlayerOne', rating: 8.1 },
    opponent: p.opponent,
    game: (p.game as GameTitle) || 'Madden',
    platform: (p.platform as Platform) || 'PS5',
    propType: p.propType,
    title: p.title,
    line: p.line,
    statType: p.statType,
    entryFC: p.entryFC,
    payoutFC: p.payoutFC,
    matchId: p.matchId,
    streamRequired: p.streamRequired,
    createdAt: p.createdAt || new Date(now - Math.floor(Math.random() * 600000)).toISOString(),
    startsInSec: p.startsInSec ?? Math.floor(Math.random() * 900),
  });

  const seed: LiveProp[] = [
    // Madden NFL - 3 prop types
    mk({ id: 'madden-1', channel: 'Madden', game: 'Madden', platform: 'PS5', propType: 'Over/Under', title: 'Over/Under: Total Points (45.5)', line: 45.5, statType: 'Total Points', entryFC: 25, payoutFC: 47.5, player: { id: 'u1', name: 'antsolightskin', rating: 8.1 } }),
    mk({ id: 'madden-2', channel: 'Madden', game: 'Madden', platform: 'Xbox', propType: 'Over/Under', title: 'Over/Under: Combined Rushing Yards (150.5)', line: 150.5, statType: 'Combined Rushing Yards', entryFC: 30, payoutFC: 57, player: { id: 'u2', name: 'RushKing', rating: 9.2 } }),
    mk({ id: 'madden-3', channel: 'Madden', game: 'Madden', platform: 'PS5', propType: 'Over/Under', title: 'Over/Under: Total Turnovers (3.5)', line: 3.5, statType: 'Total Turnovers', entryFC: 20, payoutFC: 38, streamRequired: true, matchId: 'M25-PS5-8841' }),
    
    // FIFA - 3 prop types
    mk({ id: 'fifa-1', channel: 'FIFA', game: 'FIFA', platform: 'PC', propType: 'Over/Under', title: 'Over/Under: Total Goals (3.5)', line: 3.5, statType: 'Total Goals', entryFC: 20, payoutFC: 38, player: { id: 'u3', name: 'GoalHunter', rating: 7.8 } }),
    mk({ id: 'fifa-2', channel: 'FIFA', game: 'FIFA', platform: 'PS5', propType: 'Over/Under', title: 'Over/Under: Total Shots on Target (12.5)', line: 12.5, statType: 'Total Shots on Target', entryFC: 18, payoutFC: 34.2 }),
    mk({ id: 'fifa-3', channel: 'FIFA', game: 'FIFA', platform: 'Xbox', propType: 'Over/Under', title: 'Over/Under: Yellow Cards (2.5)', line: 2.5, statType: 'Yellow Cards', entryFC: 15, payoutFC: 28.5 }),
    
    // NBA 2K - 3 prop types
    mk({ id: 'nba-1', channel: 'NBA', game: 'NBA', platform: 'PS5', propType: 'Over/Under', title: 'Over/Under: Total Points (210.5)', line: 210.5, statType: 'Total Points', entryFC: 25, payoutFC: 47.5 }),
    mk({ id: 'nba-2', channel: 'NBA', game: 'NBA', platform: 'Xbox', propType: 'Over/Under', title: 'Over/Under: Team 3-Pointers Made (15.5)', line: 15.5, statType: 'Team 3-Pointers Made', entryFC: 22, payoutFC: 41.8 }),
    mk({ id: 'nba-3', channel: 'NBA', game: 'NBA', platform: 'PC', propType: 'Over/Under', title: 'Over/Under: Combined Turnovers (24.5)', line: 24.5, statType: 'Combined Turnovers', entryFC: 18, payoutFC: 34.2, streamRequired: true, matchId: 'NBA-PC-7721' }),
    
    // UFC/UNDISPUTED - 3 prop types
    mk({ id: 'ufc-1', channel: 'UFC', game: 'UFC', platform: 'Xbox', propType: 'Over/Under', title: 'Over/Under: Fight Duration (2.5 rounds)', line: 2.5, statType: 'Fight Duration', entryFC: 20, payoutFC: 38, player: { id: 'u4', name: 'TeeTimeAt9', rating: 10 } }),
    mk({ id: 'ufc-2', channel: 'UFC', game: 'UFC', platform: 'PS5', propType: 'Over/Under', title: 'Over/Under: Total Significant Strikes (65.5)', line: 65.5, statType: 'Total Significant Strikes', entryFC: 16, payoutFC: 30.4 }),
    mk({ id: 'ufc-3', channel: 'UFC', game: 'UFC', platform: 'PC', propType: 'Over/Under', title: 'Over/Under: Knockdowns (1.5)', line: 1.5, statType: 'Knockdowns', entryFC: 25, payoutFC: 47.5, streamRequired: true, matchId: 'UFC-PC-1122' }),
    
    mk({ id: 'undisputed-1', channel: 'UNDISPUTED', game: 'UNDISPUTED', platform: 'PS5', propType: 'Over/Under', title: 'Over/Under: Fight Duration (2.5 rounds)', line: 2.5, statType: 'Fight Duration', entryFC: 18, payoutFC: 34.2 }),
    mk({ id: 'undisputed-2', channel: 'UNDISPUTED', game: 'UNDISPUTED', platform: 'Xbox', propType: 'Over/Under', title: 'Over/Under: Total Significant Strikes (70.5)', line: 70.5, statType: 'Total Significant Strikes', entryFC: 20, payoutFC: 38 }),
    mk({ id: 'undisputed-3', channel: 'UNDISPUTED', game: 'UNDISPUTED', platform: 'PC', propType: 'Over/Under', title: 'Over/Under: Knockdowns (1.5)', line: 1.5, statType: 'Knockdowns', entryFC: 22, payoutFC: 41.8 }),
    
    // NHL - 3 prop types
    mk({ id: 'nhl-1', channel: 'NHL', game: 'NHL', platform: 'PS5', propType: 'Over/Under', title: 'Over/Under: Total Goals (5.5)', line: 5.5, statType: 'Total Goals', entryFC: 20, payoutFC: 38 }),
    mk({ id: 'nhl-2', channel: 'NHL', game: 'NHL', platform: 'Xbox', propType: 'Over/Under', title: 'Over/Under: Total Penalty Minutes (10.5)', line: 10.5, statType: 'Total Penalty Minutes', entryFC: 16, payoutFC: 30.4 }),
    mk({ id: 'nhl-3', channel: 'NHL', game: 'NHL', platform: 'PC', propType: 'Over/Under', title: 'Over/Under: Shots on Goal (55.5)', line: 55.5, statType: 'Shots on Goal', entryFC: 18, payoutFC: 34.2, streamRequired: true, matchId: 'NHL-PC-3399' }),
    
    // Tennis - 3 prop types
    mk({ id: 'tennis-1', channel: 'TENNIS', game: 'TENNIS', platform: 'PS5', propType: 'Over/Under', title: 'Over/Under: Total Games (22.5)', line: 22.5, statType: 'Total Games', entryFC: 20, payoutFC: 38 }),
    mk({ id: 'tennis-2', channel: 'TENNIS', game: 'TENNIS', platform: 'Xbox', propType: 'Over/Under', title: 'Over/Under: Aces by Both Players (14.5)', line: 14.5, statType: 'Aces by Both Players', entryFC: 18, payoutFC: 34.2 }),
    mk({ id: 'tennis-3', channel: 'TENNIS', game: 'TENNIS', platform: 'PC', propType: 'Over/Under', title: 'Over/Under: Double Faults (7.5)', line: 7.5, statType: 'Double Faults', entryFC: 15, payoutFC: 28.5, streamRequired: true, matchId: 'TEN-PC-2210' }),
    
    // MLB - 3 prop types
    mk({ id: 'mlb-1', channel: 'MLB', game: 'MLB', platform: 'PS5', propType: 'Over/Under', title: 'Over/Under: Total Runs (8.5)', line: 8.5, statType: 'Total Runs', entryFC: 22, payoutFC: 41.8 }),
    mk({ id: 'mlb-2', channel: 'MLB', game: 'MLB', platform: 'Xbox', propType: 'Over/Under', title: 'Over/Under: Total Strikeouts (15.5)', line: 15.5, statType: 'Total Strikeouts', entryFC: 20, payoutFC: 38 }),
    mk({ id: 'mlb-3', channel: 'MLB', game: 'MLB', platform: 'PC', propType: 'Over/Under', title: 'Over/Under: Errors (2.5)', line: 2.5, statType: 'Errors', entryFC: 16, payoutFC: 30.4 }),
    
    // F1 - 3 prop types
    mk({ id: 'f1-1', channel: 'F1', game: 'F1', platform: 'PC', propType: 'Over/Under', title: 'Over/Under: Total Race Retirements (3.5)', line: 3.5, statType: 'Total Race Retirements', entryFC: 20, payoutFC: 38 }),
    mk({ id: 'f1-2', channel: 'F1', game: 'F1', platform: 'PS5', propType: 'Over/Under', title: 'Over/Under: Safety Car Deployments (1.5)', line: 1.5, statType: 'Safety Car Deployments', entryFC: 18, payoutFC: 34.2 }),
    mk({ id: 'f1-3', channel: 'F1', game: 'F1', platform: 'Xbox', propType: 'Over/Under', title: 'Over/Under: Fastest Lap Time (1:32.500)', line: 92.5, statType: 'Fastest Lap Time', entryFC: 25, payoutFC: 47.5 }),
    
    // Unity Arcade - 3 prop types
    mk({ id: 'unity-1', channel: 'Unity', game: 'CustomUnity', platform: 'PC', propType: 'Over/Under', title: 'Over/Under: Game Length (30.5 moves)', line: 30.5, statType: 'Game Length', entryFC: 15, payoutFC: 28.5, player: { id: 'u5', name: 'ChessMaster', rating: 8.7 } }),
    mk({ id: 'unity-2', channel: 'Unity', game: 'Arena Warriors', platform: 'PC', propType: 'Over/Under', title: 'Over/Under: Correct Answers (18.5)', line: 18.5, statType: 'Correct Answers', entryFC: 12, payoutFC: 22.8 }),
    mk({ id: 'unity-3', channel: 'Unity', game: 'Speed Trials', platform: 'PC', propType: 'Over/Under', title: 'Over/Under: Time to Victory (240.5 sec)', line: 240.5, statType: 'Time to Victory', entryFC: 20, payoutFC: 38 }),
  ];

  const origFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : (input as Request).url);
      const u = new URL(url, window.location.origin);
      if (u.pathname === '/api/props/live') {
        const ch = (u.searchParams.get('channel') as TickerChannel | null);
        const limit = Number(u.searchParams.get('limit') || '100');
        const items = seed
          .filter((p) => !ch || p.channel === ch)
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
          .slice(0, Math.max(1, Math.min(limit, 200)));
        return new Response(JSON.stringify({ items }), { headers: { 'Content-Type': 'application/json' } });
      }
      if (u.pathname.startsWith('/api/props/subscribe')) {
        return new Response(null, { status: 204 });
      }
      if (u.pathname.startsWith('/api/props/')) {
        const id = u.pathname.split('/').pop() as string;
        const found = seed.find((p) => p.id === id);
        if (!found) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        return new Response(JSON.stringify(found), { headers: { 'Content-Type': 'application/json' } });
      }
      return origFetch(input as any, init);
    } catch (e) {
      return origFetch(input as any, init);
    }
  };
})();