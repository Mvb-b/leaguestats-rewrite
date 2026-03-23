/**
 * POST /api/summoner/rewind
 * Estadísticas agregadas de match history (inspirado en rewind.lol)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isValidRegion } from "@/lib/riot-api";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  puuid: z.string().uuid(),
  region: z.string().min(2).max(10),
  filters: z.object({
    queueId: z.number().optional(),
    championId: z.number().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }).optional(),
});

function getQueueName(queueId: number): string {
  const queues: Record<number, string> = {
    420: "Ranked Solo",
    440: "Ranked Flex",
    400: "Draft Pick",
    430: "Blind Pick",
    450: "ARAM",
    700: "Clash",
    1400: "Ultimate Spellbook",
    1700: "Arena",
    1900: "URF",
  };
  return queues[queueId] || `Queue ${queueId}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { puuid, region, filters } = requestSchema.parse(body);

    if (!isValidRegion(region)) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 });
    }

    const whereClause: any = { summonerPuuid: puuid };

    if (filters) {
      if (filters.championId) whereClause.championId = filters.championId;
      const matchFilters: any = {};
      if (filters.queueId) matchFilters.queueId = filters.queueId;
      if (filters.startDate || filters.endDate) {
        matchFilters.gameCreation = {};
        if (filters.startDate) matchFilters.gameCreation.gte = new Date(filters.startDate);
        if (filters.endDate) matchFilters.gameCreation.lte = new Date(filters.endDate);
      }
      if (Object.keys(matchFilters).length > 0) whereClause.match = matchFilters;
    }

    const matches = await prisma.matchPlayer.findMany({
      where: whereClause,
      orderBy: { match: { gameCreation: "desc" } },
      include: {
        match: {
          select: {
            matchId: true,
            gameCreation: true,
            gameDuration: true,
            gameMode: true,
            queueId: true,
            region: true,
          },
        },
      },
    });

    if (matches.length === 0) {
      return NextResponse.json({
        totalGames: 0, wins: 0, losses: 0, winrate: 0, timeSpent: 0,
        kda: { kills: 0, deaths: 0, assists: 0, ratio: 0 },
        averages: {}, champions: [], gameModes: [], queues: [], monthlyStats: [],
      });
    }

    const wins = matches.filter((m) => m.win).length;
    const losses = matches.length - wins;
    const winrate = Math.round((wins / matches.length) * 1000) / 10;
    const timeSpentSeconds = matches.reduce((sum, m) => sum + m.match.gameDuration, 0);
    const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);

    const totalKills = matches.reduce((sum, m) => sum + m.kills, 0);
    const totalDeaths = matches.reduce((sum, m) => sum + m.deaths, 0);
    const totalAssists = matches.reduce((sum, m) => sum + m.assists, 0);
    const kdaRatio = totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : totalKills + totalAssists;

    const averages = {
      kills: Math.round((totalKills / matches.length) * 10) / 10,
      deaths: Math.round((totalDeaths / matches.length) * 10) / 10,
      assists: Math.round((totalAssists / matches.length) * 10) / 10,
      damageDealt: Math.round(matches.reduce((sum, m) => sum + m.totalDamageDealtToChampions, 0) / matches.length),
      damageTaken: Math.round(matches.reduce((sum, m) => sum + m.totalDamageTaken, 0) / matches.length),
      cs: Math.round(matches.reduce((sum, m) => sum + m.cs, 0) / matches.length),
      csPerMin: Math.round((matches.reduce((sum, m) => sum + (m.csPerMinute || 0), 0) / matches.length) * 10) / 10,
      goldEarned: Math.round(matches.reduce((sum, m) => sum + m.goldEarned, 0) / matches.length),
      visionScore: Math.round((matches.reduce((sum, m) => sum + (m.visionScore || 0), 0) / matches.length) * 10) / 10,
    };

    // Champion stats
    const championStats = new Map();
    for (const match of matches) {
      const existing = championStats.get(match.championId);
      if (existing) {
        existing.games++;
        if (match.win) existing.wins++;
        existing.kills += match.kills;
        existing.deaths += match.deaths;
        existing.assists += match.assists;
      } else {
        championStats.set(match.championId, {
          championId: match.championId, championName: match.championName,
          games: 1, wins: match.win ? 1 : 0,
          kills: match.kills, deaths: match.deaths, assists: match.assists,
        });
      }
    }
    const champions = Array.from(championStats.values())
      .map((c: any) => ({
        ...c,
        winrate: Math.round((c.wins / c.games) * 1000) / 10,
        kda: c.deaths > 0 ? Math.round(((c.kills + c.assists) / c.deaths) * 100) / 100 : c.kills + c.assists,
      }))
      .sort((a: any, b: any) => b.games - a.games);

    // Game mode stats
    const gameModeStats = new Map();
    for (const match of matches) {
      const existing = gameModeStats.get(match.match.gameMode);
      if (existing) {
        existing.games++; if (match.win) existing.wins++;
        existing.duration += match.match.gameDuration;
      } else {
        gameModeStats.set(match.match.gameMode, {
          gameMode: match.match.gameMode, games: 1,
          wins: match.win ? 1 : 0, duration: match.match.gameDuration,
        });
      }
    }
    const gameModes = Array.from(gameModeStats.values())
      .map((m: any) => ({ ...m, winrate: Math.round((m.wins / m.games) * 1000) / 10, avgDuration: Math.round(m.duration / m.games) }))
      .sort((a: any, b: any) => b.games - a.games);

    // Queue stats
    const queueStats = new Map();
    for (const match of matches) {
      const existing = queueStats.get(match.match.queueId);
      if (existing) { existing.games++; if (match.win) existing.wins++; }
      else { queueStats.set(match.match.queueId, { queueId: match.match.queueId, games: 1, wins: match.win ? 1 : 0 }); }
    }
    const queues = Array.from(queueStats.values())
      .map((q: any) => ({ ...q, winrate: Math.round((q.wins / q.games) * 1000) / 10, name: getQueueName(q.queueId) }))
      .sort((a: any, b: any) => b.games - a.games);

    // Monthly stats
    const monthlyStatsMap = new Map();
    for (const match of matches) {
      const date = new Date(match.match.gameCreation);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyStatsMap.get(monthKey);
      if (existing) { existing.games++; if (match.win) existing.wins++; existing.duration += match.match.gameDuration; }
      else { monthlyStatsMap.set(monthKey, { month: monthKey, games: 1, wins: match.win ? 1 : 0, duration: match.match.gameDuration }); }
    }
    const monthlyStats = Array.from(monthlyStatsMap.values())
      .map((m: any) => ({ ...m, winrate: Math.round((m.wins / m.games) * 1000) / 10, hoursPlayed: Math.round((m.duration / 3600) * 10) / 10 }))
      .sort((a: any, b: any) => a.month.localeCompare(b.month));

    return NextResponse.json({
      totalGames: matches.length, wins, losses, winrate,
      timeSpent: { minutes: timeSpentMinutes, hours: Math.floor(timeSpentMinutes / 60), days: Math.floor(timeSpentMinutes / 1440) },
      kda: { kills: totalKills, deaths: totalDeaths, assists: totalAssists, ratio: Math.round(kdaRatio * 100) / 100 },
      averages, champions: champions.slice(0, 10), gameModes, queues, monthlyStats,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });    }
    console.error("Error fetching rewind stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
