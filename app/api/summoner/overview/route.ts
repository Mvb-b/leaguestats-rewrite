/**
 * POST /api/summoner/overview
 * Calcula estadísticas agregadas de últimas partidas
 * Input: { puuid: string, region: string }
 * Retorna: winrate, kda promedio, campeones más jugados, etc.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isValidRegion } from "@/lib/riot-api";
import { getSummonerMatchStats, getSummonerChampionStats } from "@/lib/db";

const requestSchema = z.object({
  puuid: z.string().uuid(),
  region: z.string().min(2).max(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { puuid, region } = requestSchema.parse(body);

    if (!isValidRegion(region)) {
      return NextResponse.json(
        { error: "Invalid region" },
        { status: 400 }
      );
    }

    // Fetch stats from database
    const [matchStats, championStats] = await Promise.all([
      getSummonerMatchStats(puuid, 20),
      getSummonerChampionStats(puuid),
    ]);

    if (matchStats.length === 0) {
      return NextResponse.json({
        matches: 0,
        wins: 0,
        losses: 0,
        winrate: 0,
        kda: { kills: 0, deaths: 0, assists: 0, ratio: 0 },
        averages: {},
        topChampions: [],
      });
    }

    // Calculate winrate
    const wins = matchStats.filter((m) => m.win).length;
    const losses = matchStats.length - wins;
    const winrate = Math.round((wins / matchStats.length) * 100);

    // Calculate KDA averages
    const totalKills = matchStats.reduce((sum, m) => sum + m.kills, 0);
    const totalDeaths = matchStats.reduce((sum, m) => sum + m.deaths, 0);
    const totalAssists = matchStats.reduce((sum, m) => sum + m.assists, 0);
    const kdaRatio =
      totalDeaths > 0
        ? (totalKills + totalAssists) / totalDeaths
        : totalKills + totalAssists;

    // Calculate averages
    const matches = matchStats.length;
    const averages = {
      kills: Math.round((totalKills / matches) * 10) / 10,
      deaths: Math.round((totalDeaths / matches) * 10) / 10,
      assists: Math.round((totalAssists / matches) * 10) / 10,
      cs: Math.round(matchStats.reduce((sum, m) => sum + m.cs, 0) / matches),
      csPerMinute:
        Math.round(
          (matchStats.reduce((sum, m) => sum + (m.csPerMinute || 0), 0) /
            matches) *
            10
        ) / 10,
      goldEarned: Math.round(
        matchStats.reduce((sum, m) => sum + m.goldEarned, 0) / matches
      ),
      damageDealt: Math.round(
        matchStats.reduce(
          (sum, m) => sum + (m.totalDamageDealtToChampions || 0),
          0
        ) / matches
      ),
      visionScore: Math.round(
        matchStats.reduce((sum, m) => sum + (m.visionScore || 0), 0) / matches
      ),
    };

    // Top champions
    const topChampions = championStats.slice(0, 5).map((c) => ({
      championId: c.championId,
      championName: c.championName,
      games: c._count.matchId,
      wins: c._sum.win || 0,
      winrate:
        c._count.matchId > 0
          ? Math.round(((c._sum.win || 0) / c._count.matchId) * 100)
          : 0,
      kda: {
        kills: c._sum.kills || 0,
        deaths: c._sum.deaths || 0,
        assists: c._sum.assists || 0,
      },
    }));

    return NextResponse.json({
      matches: matchStats.length,
      wins,
      losses,
      winrate,
      kda: {
        kills: Math.round(totalKills * 10) / 10,
        deaths: Math.round(totalDeaths * 10) / 10,
        assists: Math.round(totalAssists * 10) / 10,
        ratio: Math.round(kdaRatio * 100) / 100,
      },
      averages,
      topChampions,
      recentMatches: matchStats.slice(0, 5).map((m) => ({
        matchId: m.matchId,
        championId: m.championId,
        championName: m.championName,
        win: m.win,
        kills: m.kills,
        deaths: m.deaths,
        assists: m.assists,
        kda: m.kda,
        gameCreation: m.match.gameCreation,
        gameDuration: m.match.gameDuration,
        gameMode: m.match.gameMode,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching overview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
