// Types
export interface Summoner {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
  level: number;
  profileIconId: number;
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
  winrate: number;
}

export interface MatchPlayer {
  puuid: string;
  name: string;
  championId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  kp: number;
  cs: number;
  csPerMin: number;
  gold: number;
  damage: number;
  visionScore: number;
  role: string;
  win: boolean;
}

export interface Match {
  id: string;
  gameId: number;
  gameMode: string;
  gameDuration: number;
  date: string;
  result: "win" | "loss";
  season: number;
  queueId: number;
  summonerPerformance: MatchPlayer;
}

export interface ChampionStatsData {
  championId: number;
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winrate: number;
  kda: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgCs: number;
}

export interface RecordData {
  id: string;
  type: "kills" | "deaths" | "assists" | "cs" | "gold" | "damage" | "vision" | "kda";
  value: number | string;
  match: Match;
  championId: number;
  championName: string;
  date: string;
}

// Mock Data
export const mockSummoner: Summoner = {
  puuid: "mock-puuid-123456789",
  gameName: "Faker",
  tagLine: "KR1",
  region: "kr",
  level: 1234,
  profileIconId: 518,
  tier: "CHALLENGER",
  rank: "I",
  lp: 1256,
  wins: 342,
  losses: 278,
  winrate: 55.2,
};

export const mockMatches: Match[] = [
  {
    id: "KR_1234567890",
    gameId: 1234567890,
    gameMode: "CLASSIC",
    gameDuration: 1865,
    date: "2026-03-21T18:30:00Z",
    result: "win",
    season: 14,
    queueId: 420,
    summonerPerformance: {
      puuid: "mock-puuid-123456789",
      name: "Faker",
      championId: 61,
      championName: "Orianna",
      kills: 8,
      deaths: 2,
      assists: 12,
      kda: 10.0,
      kp: 68.5,
      cs: 298,
      csPerMin: 9.6,
      gold: 15234,
      damage: 32456,
      visionScore: 42,
      role: "MIDDLE",
      win: true,
    },
  },
  {
    id: "KR_1234567891",
    gameId: 1234567891,
    gameMode: "CLASSIC",
    gameDuration: 2124,
    date: "2026-03-21T17:15:00Z",
    result: "loss",
    season: 14,
    queueId: 420,
    summonerPerformance: {
      puuid: "mock-puuid-123456789",
      name: "Faker",
      championId: 268,
      championName: "Azir",
      kills: 5,
      deaths: 4,
      assists: 7,
      kda: 3.0,
      kp: 54.2,
      cs: 312,
      csPerMin: 8.8,
      gold: 14120,
      damage: 28934,
      visionScore: 38,
      role: "MIDDLE",
      win: false,
    },
  },
  {
    id: "KR_1234567892",
    gameId: 1234567892,
    gameMode: "CLASSIC",
    gameDuration: 1643,
    date: "2026-03-20T20:45:00Z",
    result: "win",
    season: 14,
    queueId: 420,
    summonerPerformance: {
      puuid: "mock-puuid-123456789",
      name: "Faker",
      championId: 112,
      championName: "Viktor",
      kills: 12,
      deaths: 1,
      assists: 9,
      kda: 21.0,
      kp: 72.1,
      cs: 245,
      csPerMin: 8.9,
      gold: 16890,
      damage: 41234,
      visionScore: 45,
      role: "MIDDLE",
      win: true,
    },
  },
  {
    id: "KR_1234567893",
    gameId: 1234567893,
    gameMode: "CLASSIC",
    gameDuration: 1956,
    date: "2026-03-20T19:20:00Z",
    result: "win",
    season: 14,
    queueId: 420,
    summonerPerformance: {
      puuid: "mock-puuid-123456789",
      name: "Faker",
      championId: 84,
      championName: "Akali",
      kills: 15,
      deaths: 3,
      assists: 6,
      kda: 7.0,
      kp: 58.9,
      cs: 285,
      csPerMin: 8.7,
      gold: 18345,
      damage: 38567,
      visionScore: 41,
      role: "MIDDLE",
      win: true,
    },
  },
  {
    id: "KR_1234567894",
    gameId: 1234567894,
    gameMode: "CLASSIC",
    gameDuration: 2234,
    date: "2026-03-19T21:10:00Z",
    result: "loss",
    season: 14,
    queueId: 420,
    summonerPerformance: {
      puuid: "mock-puuid-123456789",
      name: "Faker",
      championId: 7,
      championName: "LeBlanc",
      kills: 4,
      deaths: 6,
      assists: 8,
      kda: 2.0,
      kp: 48.3,
      cs: 278,
      csPerMin: 7.5,
      gold: 12345,
      damage: 23456,
      visionScore: 35,
      role: "MIDDLE",
      win: false,
    },
  },
  {
    id: "KR_1234567895",
    gameId: 1234567895,
    gameMode: "CLASSIC",
    gameDuration: 2012,
    date: "2026-03-18T22:30:00Z",
    result: "win",
    season: 14,
    queueId: 420,
    summonerPerformance: {
      puuid: "mock-puuid-123456789",
      name: "Faker",
      championId: 157,
      championName: "Yasuo",
      kills: 16,
      deaths: 5,
      assists: 11,
      kda: 5.4,
      kp: 65.2,
      cs: 340,
      csPerMin: 10.1,
      gold: 19234,
      damage: 42345,
      visionScore: 48,
      role: "MIDDLE",
      win: true,
    },
  },
];

// Helper Functions
export function calculateChampionStats(matches: Match[]): ChampionStatsData[] {
  const stats = new Map<number, ChampionStatsData>();
  
  for (const match of matches) {
    const perf = match.summonerPerformance;
    const existing = stats.get(perf.championId);
    
    if (existing) {
      existing.games++;
      if (match.result === "win") existing.wins++;
      else existing.losses++;
      existing.winrate = (existing.wins / existing.games) * 100;
      existing.avgKills = (existing.avgKills * (existing.games - 1) + perf.kills) / existing.games;
      existing.avgDeaths = (existing.avgDeaths * (existing.games - 1) + perf.deaths) / existing.games;
      existing.avgAssists = (existing.avgAssists * (existing.games - 1) + perf.assists) / existing.games;
      existing.kda = (existing.avgKills + existing.avgAssists) / (existing.avgDeaths || 1);
      existing.avgCs = (existing.avgCs * (existing.games - 1) + perf.csPerMin) / existing.games;
    } else {
      stats.set(perf.championId, {
        championId: perf.championId,
        championName: perf.championName,
        games: 1,
        wins: match.result === "win" ? 1 : 0,
        losses: match.result === "loss" ? 1 : 0,
        winrate: match.result === "win" ? 100 : 0,
        kda: (perf.kills + perf.assists) / (perf.deaths || 1),
        avgKills: perf.kills,
        avgDeaths: perf.deaths,
        avgAssists: perf.assists,
        avgCs: perf.csPerMin,
      });
    }
  }
  
  return Array.from(stats.values()).sort((a, b) => b.games - a.games);
}

export function getProfileIconUrl(profileIconId: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/14.5.1/img/profileicon/${profileIconId}.png`;
}

export function getChampionIconUrl(championId: number): string {
  const championKeyMap: Record<number, string> = {
    61: "Orianna",
    268: "Azir",
    112: "Viktor",
    84: "Akali",
    7: "LeBlanc",
    157: "Yasuo",
    64: "LeeSin",
    202: "Jhin",
    236: "Lucian",
    81: "Ezreal",
  };
  const key = championKeyMap[championId] || "Unknown";
  return `https://ddragon.leagueoflegends.com/cdn/14.5.1/img/champion/${key}.png`;
}

export const tierColors: Record<string, string> = {
  IRON: "text-slate-400",
  BRONZE: "text-amber-600",
  SILVER: "text-slate-300",
  GOLD: "text-yellow-400",
  PLATINUM: "text-cyan-400",
  EMERALD: "text-emerald-400",
  DIAMOND: "text-blue-400",
  MASTER: "text-purple-400",
  GRANDMASTER: "text-red-400",
  CHALLENGER: "text-yellow-300",
};
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getQueueName(queueId: number): string {
  const queues: Record<number, string> = {
    420: "Ranked Solo",
    440: "Ranked Flex",
    400: "Draft Pick",
    430: "Blind Pick",
    450: "ARAM",
    700: "Clash",
  };
  return queues[queueId] || "Unknown";
}
