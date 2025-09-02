export const rewardsConfig = {
  balances: { xp: 1250, fnc: 340, boosts: 2, fc: 3.4 },
  fcBudget: { percentRemaining: 62, devForceLow: false },
  daily: [
    {
      id: "d1",
      title: "Win 2 Verified Console Matches",
      description: "Opponents within your MMR. Private server + stream VOD recommended.",
      requirements: ["2 verified wins", "MMR within threshold"],
      rewards: { xp: 50, fnc: 30, boosts: 1 },
      verificationBadges: ["Private Server", "Stream VOD", "Verified Opponent"] as const,
      multipliers: { mmr: true, verification: true, diversity: true },
      repeatGroup: "win" as const,
      timeLimit: "Daily" as const,
      state: "available" as const,
      progress: { current: 0, target: 2 },
      cta: "Activate" as const
    },
    {
      id: "d2",
      title: "Unity Session + Challenge",
      description: "Play 20 min Unity and complete 1 in-game challenge.",
      requirements: ["20 min session", "1 challenge completed"],
      rewards: { xp: 60, fnc: 40 },
      verificationBadges: [] as const,
      multipliers: { mmr: false, verification: true, diversity: false },
      repeatGroup: "play" as const,
      timeLimit: "Daily" as const,
      state: "available" as const,
      progress: { current: 0, target: 2 },
      cta: "Activate" as const
    },
    {
      id: "d3",
      title: "Sportsmanship & Stream",
      description: "Watch a teammate 15 min and endorse your opponent.",
      requirements: ["Watch 15 min", "Submit endorsement"],
      rewards: { xp: 40, fnc: 20 },
      verificationBadges: ["Stream VOD"] as const,
      multipliers: { mmr: false, verification: true, diversity: false },
      repeatGroup: "watch" as const,
      timeLimit: "Daily" as const,
      state: "available" as const,
      progress: { current: 0, target: 2 },
      cta: "Activate" as const
    }
  ],
  weekly: [
    {
      id: "w1",
      title: "Skill Diversity",
      description: "1 verified win in 3 different game titles.",
      requirements: ["3 titles", "1 verified win each"],
      rewards: { xp: 200, fnc: 100, boosts: 1 },
      verificationBadges: ["Verified Opponent"] as const,
      multipliers: { mmr: true, verification: true, diversity: true },
      repeatGroup: "diversity" as const,
      timeLimit: "Weekly" as const,
      state: "available" as const,
      progress: { current: 0, target: 3 },
      cta: "Activate" as const
    },
    {
      id: "w2",
      title: "Private Server Grinder",
      description: "Complete 3 matches on private servers.",
      requirements: ["3 private server matches"],
      rewards: { xp: 180, fnc: 120, boosts: 1 },
      verificationBadges: ["Private Server"] as const,
      multipliers: { mmr: false, verification: true, diversity: false },
      repeatGroup: "play" as const,
      timeLimit: "Weekly" as const,
      state: "available" as const,
      progress: { current: 0, target: 3 },
      cta: "Activate" as const
    },
    {
      id: "w3",
      title: "Tournament Pair",
      description: "Join and complete 2 scheduled events.",
      requirements: ["2 events completed"],
      rewards: { xp: 220, fnc: 120 },
      verificationBadges: [] as const,
      multipliers: { mmr: true, verification: true, diversity: false },
      repeatGroup: "play" as const,
      timeLimit: "Weekly" as const,
      state: "available" as const,
      progress: { current: 0, target: 2 },
      cta: "Activate" as const
    }
  ],
  seasonal: {
    potFC: 300,
    topSample: [
      { rank: 1, name: "PlayerOne", skill: 1840, verified: "98%" },
      { rank: 2, name: "Xeno", skill: 1795, verified: "97%" },
      { rank: 3, name: "Lauri", skill: 1760, verified: "96%" },
      { rank: 4, name: "GamerPro", skill: 1720, verified: "95%" },
      { rank: 5, name: "SkillMaster", skill: 1680, verified: "94%" },
      { rank: 6, name: "Competitor", skill: 1640, verified: "93%" },
      { rank: 7, name: "Champion", skill: 1600, verified: "92%" },
      { rank: 8, name: "ElitePlayer", skill: 1560, verified: "91%" },
      { rank: 9, name: "TopGamer", skill: 1520, verified: "90%" },
      { rank: 10, name: "ProPlayer", skill: 1480, verified: "89%" }
    ],
    streaks: [
      { days: 3, rewards: { boosts: 1 } },
      { days: 7, rewards: { fnc: 80 } },
      { days: 28, rewards: { fc: 1.0 } }
    ]
  }
};