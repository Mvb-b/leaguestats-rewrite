/**
 * Database queries usando Prisma
 * Todas las operaciones de base de datos para GameStats API
 */

import { Prisma } from "@prisma/client";
import type {
  RiotAccount,
  RiotSummoner,
  RiotMatchInfo,
  RiotMatchParticipant,
  Region,
} from "./riot-api";
import { prisma } from "./prisma";

export { prisma };

// ==================== SUMMONER QUERIES ====================

export async function findSummonerByName(
  gameName: string,
  tagLine: string,
  region: string
) {
  return prisma.summoner.findFirst({
    where: {
      gameName: { equals: gameName, mode: "insensitive" },
      tagLine: { equals: tagLine, mode: "insensitive" },
      region,
    },
  });
}

export async function findSummonerByPuuid(puuid: string) {
  return prisma.summoner.findUnique({
    where: { puuid },
  });
}

export async function createOrUpdateSummoner(
  account: RiotAccount,
  summoner: RiotSummoner,
  region: string
) {
  const now = new Date();
  return prisma.summoner.upsert({
    where: { puuid: account.puuid },
    update: {
      gameName: account.gameName,
      tagLine: account.tagLine,
      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      revisionDate: new Date(summoner.revisionDate),
      lastUpdatedAt: now,
    },
    create: {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      revisionDate: new Date(summoner.revisionDate),
      region,
      lastUpdatedAt: now,
    },
  });
}

// ==================== MATCH QUERIES ====================

export async function findMatchById(matchId: string) {
  return prisma.match.findUnique({
    where: { matchId },
    include: {
      teams: true,
      players: {
        include: {
          summoner: {
            select: {
              gameName: true,
              tagLine: true,
              profileIconId: true,
            },
          },
        },
      },
    },
  });
}

export async function getOrCreateMatch(
  matchId: string,
  matchData: RiotMatchInfo,
  region: string
) {
  const existing = await findMatchById(matchId);
  if (existing) return existing;
  return createMatch(matchId, matchData, region);
}

export async function createMatch(
  matchId: string,
  matchData: RiotMatchInfo,
  region: string
) {
  const { info, metadata } = matchData;
  const patch = "14.5.1"; // TODO: extract from game version

  return prisma.$transaction(async (tx) => {
    // Create match
    const match = await tx.match.create({
      data: {
        matchId,
        dataVersion: metadata.dataVersion || "1",
        metadata: metadata as Prisma.JsonObject,
        gameCreation: new Date(info.gameCreation),
        gameDuration: info.gameDuration,
        gameMode: info.gameMode,
        gameType: info.gameType,
        queueId: info.queueId,
        mapId: info.mapId,
        patch,
        season: 0,
        region,
      },
    });

    // Create teams
    if (info.teams?.length) {
      await tx.matchTeam.createMany({
        data: info.teams.map((team) => ({
          matchId,
          teamId: team.teamId,
          win: team.win,
          towerKills: team.objectives?.tower?.kills || 0,
          inhibitorKills: team.objectives?.inhibitor?.kills || 0,
          baronKills: team.objectives?.baron?.kills || 0,
          dragonKills: team.objectives?.dragon?.kills || 0,
          riftHeraldKills: team.objectives?.riftHerald?.kills || 0,
          elderDragonKills: team.objectives?.elderDragon?.kills || 0,
          bans: [],
        })),
      });
    }

    // Create players
    for (const participant of info.participants) {
      const cs = (participant.neutralMinionsKilled || 0) + (participant.totalMinionsKilled || 0);
      const csPerMin = info.gameDuration > 0 ? (cs / info.gameDuration) * 60 : 0;
      const minutes = info.gameDuration / 60;
      const goldPerMin = minutes > 0 ? participant.goldEarned / minutes : 0;
      const teamKills = info.participants
        .filter((p) => p.teamId === participant.teamId)
        .reduce((sum, p) => sum + p.kills, 0);
      const kp = teamKills > 0 ? (participant.kills + participant.assists) / teamKills : 0;
      const kda = participant.deaths > 0
        ? (participant.kills + participant.assists) / participant.deaths
        : participant.kills + participant.assists;

      const primaryStyle = participant.perks?.styles?.[0];
      const secondaryStyle = participant.perks?.styles?.[1];

      await tx.matchPlayer.create({
        data: {
          matchId,
          summonerPuuid: participant.puuid,
          puuid: participant.puuid,
          summonerName: participant.summonerName,
          teamId: participant.teamId,
          championId: participant.championId,
          championName: participant.championName,
          championLevel: participant.championLevel,
          win: participant.win,
          gameEndedInSurrender: participant.gameEndedInSurrender,
          gameEndedInEarlySurrender: participant.gameEndedInEarlySurrender,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          kda,
          kp: Math.round(kp * 100) / 100,
          cs,
          csPerMinute: Math.round(csPerMin * 10) / 10,
          goldEarned: participant.goldEarned,
          goldPerMinute: Math.round(goldPerMin * 10) / 10,
          goldSpent: participant.goldSpent,
          totalDamageDealt: participant.totalDamageDealt,
          totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
          totalDamageTaken: participant.totalDamageTaken,
          physicalDamageDealtToChampions: participant.physicalDamageDealtToChampions,
          magicDamageDealtToChampions: participant.magicDamageDealtToChampions,
          trueDamageDealtToChampions: participant.trueDamageDealtToChampions,
          damageSelfMitigated: participant.damageSelfMitigated,
          totalHeal: participant.totalHeal,
          totalHealsOnTeammates: participant.totalHealsOnTeammates,
          totalDamageShieldedOnTeammates: participant.totalDamageShieldedOnTeammates,
          turretKills: participant.turretKills,
          inhibitorKills: participant.inhibitorKills,
          nexusKilled: participant.nexusKilled,
          baronKills: participant.baronKills,
          dragonKills: participant.dragonKills,
          riftHeraldKills: participant.riftHeraldKills,
          elderDragonKills: participant.elderDragonKills || 0,
          visionScore: participant.visionScore,
          wardsPlaced: participant.wardsPlaced,
          wardsKilled: participant.wardsKilled,
          visionWardsBoughtInGame: participant.visionWardsBoughtInGame,
          sightWardsBoughtInGame: participant.sightWardsBoughtInGame,
          timeCCingOthers: participant.timeCCingOthers,
          totalTimeCCDealt: participant.totalTimeCCDealt,
          totalTimeSpentDead: participant.totalTimeSpentDead,
          doubleKills: participant.doubleKills,
          tripleKills: participant.tripleKills,
          quadraKills: participant.quadraKills,
          pentaKills: participant.pentaKills,
          unrealKills: participant.unrealKills,
          item0: participant.item0,
          item1: participant.item1,
          item2: participant.item2,
          item3: participant.item3,
          item4: participant.item4,
          item5: participant.item5,
          item6: participant.item6,
          primaryRunePath: primaryStyle?.style || 0,
          primaryRune: primaryStyle?.selections?.[0]?.perk || 0,
          secondaryRunePath: secondaryStyle?.style || 0,
          perk0: primaryStyle?.selections?.[0]?.perk || 0,
          perk1: primaryStyle?.selections?.[1]?.perk || 0,
          perk2: primaryStyle?.selections?.[2]?.perk || 0,
          perk3: primaryStyle?.selections?.[3]?.perk || 0,
          perk4: secondaryStyle?.selections?.[0]?.perk || 0,
          perk5: secondaryStyle?.selections?.[1]?.perk || 0,
          statPerk0: 0,
          statPerk1: 0,
          statPerk2: 0,
        },
      });
    }

    return match;
  });
}

// ==================== STATS QUERIES ====================

export async function getSummonerMatchStats(puuid: string, limit = 20) {
  return prisma.matchPlayer.findMany({
    where: { summonerPuuid: puuid },
    orderBy: { match: { gameCreation: "desc" } },
    take: limit,
    include: {
      match: {
        select: {
          matchId: true,
          gameCreation: true,
          gameDuration: true,
          gameMode: true,
          queueId: true,
          patch: true,
        },
      },
    },
  });
}

export async function getSummonerChampionStats(puuid: string) {
  return prisma.matchPlayer.groupBy({
    by: ["championId", "championName"],
    where: { summonerPuuid: puuid },
    _count: {
      matchId: true,
    },
    _sum: {
      kills: true,
      deaths: true,
      assists: true,
      win: true,
    },
    orderBy: {
      _count: {
        matchId: "desc",
      },
    },
  });
}

export async function getSummonerRecords(puuid: string) {
  const matches = await prisma.matchPlayer.findMany({
    where: { summonerPuuid: puuid },
    orderBy: { match: { gameCreation: "desc" } },
    select: {
      kills: true,
      deaths: true,
      assists: true,
      kda: true,
      totalDamageDealtToChampions: true,
      cs: true,
      csPerMinute: true,
      goldEarned: true,
      visionScore: true,
      win: true,
      match: {
        select: {
          matchId: true,
          gameCreation: true,
        },
      },
    },
  });

  if (matches.length === 0) return null;

  const records = {
    mostKills: matches.reduce((max, m) => m.kills > max.kills ? m : max, matches[0]),
    bestKda: matches.reduce((max, m) => m.kda > max.kda ? m : max, matches[0]),
    mostDamage: matches.reduce((max, m) => (m.totalDamageDealtToChampions || 0) > (max.totalDamageDealtToChampions || 0) ? m : max, matches[0]),
    mostCs: matches.reduce((max, m) => (m.cs || 0) > (max.cs || 0) ? m : max, matches[0]),
    highestCsPerMin: matches.reduce((max, m) => (m.csPerMinute || 0) > (max.csPerMinute || 0) ? m : max, matches[0]),
    mostGold: matches.reduce((max, m) => (m.goldEarned || 0) > (max.goldEarned || 0) ? m : max, matches[0]),
    mostVisionScore: matches.reduce((max, m) => (m.visionScore || 0) > (max.visionScore || 0) ? m : max, matches[0]),
    longestWinStreak: calculateLongestWinStreak(matches),
  };

  return records;
}

function calculateLongestWinStreak(matches: Array<{ win: boolean }>): number {
  let currentStreak = 0;
  let maxStreak = 0;
  for (const match of matches) {
    if (match.win) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  return maxStreak;
}

// ==================== MATCH LIST QUERIES ====================

export async function getSummonerMatches(
  puuid: string,
  skip = 0,
  take = 20
) {
  const [matches, total] = await Promise.all([
    prisma.matchPlayer.findMany({
      where: { summonerPuuid: puuid },
      orderBy: { match: { gameCreation: "desc" } },
      skip,
      take,
      include: {
        match: {
          include: {
            teams: true,
          },
        },
      },
    }),
    prisma.matchPlayer.count({
      where: { summonerPuuid: puuid },
    }),
  ]);

  return { matches, total };
}

export async function getMatchesByIds(matchIds: string[]) {
  return prisma.match.findMany({
    where: {
      matchId: { in: matchIds },
    },
    include: {
      teams: true,
      players: {
        include: {
          summoner: {
            select: {
              gameName: true,
              tagLine: true,
              profileIconId: true,
            },
          },
        },
      },
    },
  });
}
