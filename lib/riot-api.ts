/**
 * Riot API Client con rate limiting
 * Maneja todas las interacciones con Riot Games API
 */

// Rate limit configuration
const RATE_LIMITS = {
  SHORT: { max: 20, windowMs: 1000 },
  LONG: { max: 100, windowMs: 120000 },
};

// Request queue para rate limiting
class RateLimiter {
  private requests: number[] = [];
  private lastRequestTime = 0;
  private minDelayMs = 50;

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    const cutoff = now - RATE_LIMITS.LONG.windowMs;
    this.requests = this.requests.filter((time) => time > cutoff);

    const requestsInShortWindow = this.requests.filter(
      (time) => time > now - RATE_LIMITS.SHORT.windowMs
    ).length;

    if (requestsInShortWindow >= RATE_LIMITS.SHORT.max) {
      const oldestInShortWindow = Math.min(
        ...this.requests.filter((t) => t > now - RATE_LIMITS.SHORT.windowMs)
      );
      const waitTime = oldestInShortWindow + RATE_LIMITS.SHORT.windowMs - now + 100;
      await this.delay(waitTime);
      return this.waitForSlot();
    }

    if (this.requests.length >= RATE_LIMITS.LONG.max) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = oldestRequest + RATE_LIMITS.LONG.windowMs - now + 100;
      await this.delay(waitTime);
      return this.waitForSlot();
    }

    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minDelayMs) {
      await this.delay(this.minDelayMs - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
    this.requests.push(this.lastRequestTime);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const globalRateLimiter = new RateLimiter();

export type Region =
  | "br" | "eune" | "euw" | "jp" | "kr" | "lan" | "las" | "na"
  | "oce" | "tr" | "ru" | "ph" | "sg" | "th" | "tw" | "vn";

const REGION_ROUTES: Record<Region, string> = {
  br: "br1", eune: "eun1", euw: "euw1", jp: "jp1", kr: "kr",
  lan: "la1", las: "la2", na: "na1", oce: "oc1", tr: "tr1",
  ru: "ru", ph: "ph2", sg: "sg2", th: "th2", tw: "tw2", vn: "vn2",
};

const REGIONAL_ROUTES: Record<Region, string> = {
  br: "americas", eune: "europe", euw: "europe", jp: "asia", kr: "asia",
  lan: "americas", las: "americas", na: "americas", oce: "sea",
  tr: "europe", ru: "europe", ph: "sea", sg: "sea", th: "sea",
  tw: "sea", vn: "sea",
};

export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface RiotSummoner {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface RiotMatchParticipant {
  puuid: string;
  summonerName: string;
  teamId: number;
  championId: number;
  championName: string;
  championLevel: number;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  gameEndedInSurrender: boolean;
  gameEndedInEarlySurrender: boolean;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  physicalDamageDealtToChampions: number;
  magicDamageDealtToChampions: number;
  trueDamageDealtToChampions: number;
  damageSelfMitigated: number;
  totalHeal: number;
  totalHealsOnTeammates: number;
  totalDamageShieldedOnTeammates: number;
  goldEarned: number;
  goldSpent: number;
  turretKills: number;
  inhibitorKills: number;
  nexusKilled: boolean;
  baronKills: number;
  dragonKills: number;
  riftHeraldKills: number;
  elderDragonKills: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  visionWardsBoughtInGame: number;
  sightWardsBoughtInGame: number;
  timeCCingOthers: number;
  totalTimeCCDealt: number;
  totalTimeSpentDead: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
  unrealKills: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  neutralMinionsKilled: number;
  totalMinionsKilled: number;
  perks: {
    styles: Array<{
      style: number;
      selections: Array<{ perk: number }>;
    }>;
  };
}

export interface RiotMatchTeam {
  teamId: number;
  win: boolean;
  objectives: {
    tower?: { kills: number };
    inhibitor?: { kills: number };
    baron?: { kills: number };
    dragon?: { kills: number };
    riftHerald?: { kills: number };
    elderDragon?: { kills: number };
  };
}

export interface RiotMatchInfo {
  metadata: {
    matchId: string;
    dataVersion: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameMode: string;
    gameType: string;
    queueId: number;
    mapId: number;
    teams: RiotMatchTeam[];
    participants: RiotMatchParticipant[];
  };
}

export interface RiotActiveGame {
  gameId: number;
  mapId: number;
  gameMode: string;
  gameType: string;
  gameQueueConfigId: number;
  participants: Array<{
    teamId: number;
    spell1Id: number;
    spell2Id: number;
    championId: number;
    profileIconId: number;
    summonerName: string;
    puuid: string;
    summonerId: string;
  }>;
}

export interface RiotRune {
  id: number;
  key: string;
  icon: string;
  name: string;
  shortDesc: string;
  longDesc: string;
}

export interface RiotRunePath {
  id: number;
  key: string;
  icon: string;
  name: string;
  slots: Array<{
    runes: RiotRune[];
  }>;
}

class RiotAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = "RiotAPIError";
  }
}

export class RiotAPIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("API key is required");
    this.apiKey = apiKey;
  }

  private async request<T>(
    url: string,
    retries = 3,
    backoffMs = 1000
  ): Promise<T> {
    await globalRateLimiter.waitForSlot();

    const headers: HeadersInit = {
      "X-Riot-Token": this.apiKey,
      Accept: "application/json",
    };

    try {
      const response = await fetch(url, { headers, cache: "no-store" });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("Retry-After") || "1", 10);
        if (retries > 0) {
          await this.delay(retryAfter * 1000);
          return this.request(url, retries - 1, backoffMs * 2);
        }
        throw new RiotAPIError("Rate limit exceeded", 429, retryAfter);
      }

      if (response.status === 404) {
        throw new RiotAPIError("Resource not found", 404);
      }

      if (response.status === 403) {
        throw new RiotAPIError("Invalid API key", 403);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new RiotAPIError(
          `API error: ${response.status} - ${errorText}`,
          response.status
        );
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof RiotAPIError) throw error;
      if (retries > 0 && error instanceof TypeError) {
        await this.delay(backoffMs);
        return this.request(url, retries - 1, backoffMs * 2);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ACCOUNT API (Riot ID)
  async getAccountByRiotId(
    gameName: string,
    tagLine: string,
    region: Region
  ): Promise<RiotAccount> {
    const routing = REGIONAL_ROUTES[region] || "americas";
    const encodedName = encodeURIComponent(gameName);
    const encodedTag = encodeURIComponent(tagLine);
    const url = `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedName}/${encodedTag}`;
    return this.request<RiotAccount>(url);
  }

  // SUMMONER API
  async getSummonerByPuuid(puuid: string, region: Region): Promise<RiotSummoner> {
    const routing = REGION_ROUTES[region] || region;
    const url = `https://${routing}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;
    return this.request<RiotSummoner>(url);
  }

  // MATCH API
  async getMatchIdsByPuuid(
    puuid: string,
    region: Region,
    count = 20,
    start = 0,
    queue?: number,
    type?: string
  ): Promise<string[]> {
    const routing = REGIONAL_ROUTES[region] || "americas";
    let url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=${start}&count=${count}`;
    if (queue) url += `&queue=${queue}`;
    if (type) url += `&type=${type}`;
    return this.request<string[]>(url);
  }

  async getMatch(matchId: string, region: Region): Promise<RiotMatchInfo> {
    const routing = REGIONAL_ROUTES[region] || "americas";
    const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
    return this.request<RiotMatchInfo>(url);
  }

  // SPECTATOR API (LIVE GAME)
  async getActiveGame(puuid: string, region: Region): Promise<RiotActiveGame | null> {
    const routing = REGION_ROUTES[region] || region;
    const url = `https://${routing}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${encodeURIComponent(puuid)}`;
    try {
      return await this.request<RiotActiveGame>(url);
    } catch (error) {
      if (error instanceof RiotAPIError && error.statusCode === 404) {
        return null; // Not in game
      }
      throw error;
    }
  }
}

// Singleton instance
let riotClient: RiotAPIClient | null = null;

export function getRiotClient(): RiotAPIClient {
  if (!riotClient) {
    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) {
      throw new Error("RIOT_API_KEY environment variable is not set");
    }
    riotClient = new RiotAPIClient(apiKey);
  }
  return riotClient;
}

export function isValidRegion(region: string): region is Region {
  const validRegions: Region[] = [
    "br", "eune", "euw", "jp", "kr", "lan", "las", "na",
    "oce", "tr", "ru", "ph", "sg", "th", "tw", "vn",
  ];
  return validRegions.includes(region as Region);
}