/**
 * POST /api/summoner/side-stats
 * Estadísticas de Blue Side vs Red Side
 * Input: { puuid: string, region: string, filters?: {...} }
 * Retorna: stats separadas por teamId (100 = Blue, 200 = Red)
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
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { puuid, region, filters } = requestSchema.parse(body);

    if (!isValidRegion(region)) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 });
    }

    const whereClause: any = { summonerPuuid: puuid };

    if (filters) {
      const matchFilters: any = {};
      if (filters.queueId) matchFilters.queueId = filters.queueId;
      if (filters.startDate || filters.endDate) {
        matchFilters.gameCreation = {};
        if (filters.startDate) matchFilters.gameCreation.gte = new Date(filters.startDate);
        if (filters.endDate) matchFilters.gameCreation.lte = new Date(filters.endDate);
      }
      if (Object.keys(matchFilters).length > 0) whereClause.match = matchFilters;
    }

    // Fetch all matches with team info
    const matches = await prisma.matchPlayer.findMany({
      where: whereClause,
      orderBy: { match: { gameCreation: "desc" } },
      select: {
        teamId: true,
        win: true,
        kills: true,
        deaths: true,
        assists: true,
        cs: true,
        goldEarned: true,
        totalDamageDealtToChampions: true,
        match: {
          select: {
            gameCreation: true,
            gameDuration: true,
            queueId: true,
          },
        },
      },
    });

    if (matches.length === 0) {
      return NextResponse.json({
        blueSide: { games: 0, wins: 0, losses: 0, winrate: 0 },
        redSide: { games: 0, wins: 0, losses: 0, winrate: 0 },
        comparison: null,
      });
    }

    // Team 100 = Blue Side, Team 200 = Red Side
    const blueSideMatches = matches.filter((m) => m.teamId === 100);
    const redSideMatches = matches.filter((m) => m.teamId === 200);

    const calculateStats = (sideMatches: typeof matches) => {
      if (sideMatches.length === 0) return null;
      
      const wins = sideMatches.filter((m) => m.win).length;
      const totalKills = sideMatches.reduce((sum, m) => sum + m.kills, 0);
      const totalDeaths = sideMatches.reduce((sum, m) => sum + m.deaths, 0);
      const totalAssists = sideMatches.reduce((sum, m) => sum + m.assists, 0);
      const totalCS = sideMatches.reduce((sum, m) => sum + m.cs, 0);
      const totalGold = sideMatches.reduce((sum, m) => sum + m.goldEarned, 0);
      const totalDamage = sideMatches.reduce((sum, m) => sum + m.totalDamageDealtToChampions, 0);
      const totalDuration = sideMatches.reduce((sum, m) => sum + m.match.gameDuration, 0);

      return {
        games: sideMatches.length,
        wins,
        losses: sideMatches.length - wins,
        winrate: Math.round((wins / sideMatches.length) * 1000) / 10,
        averages: {
          kills: Math.round((totalKills / sideMatches.length) * 10) / 10,
          deaths: Math.round((totalDeaths / sideMatches.length) * 10) / 10,
          assists: Math.round((totalAssists / sideMatches.length) * 10) / 10,
          kda: totalDeaths > 0 ? Math.round(((totalKills + totalAssists) / totalDeaths) * 100) / 100 : totalKills + totalAssists,
          cs: Math.round(totalCS / sideMatches.length),
          goldEarned: Math.round(totalGold / sideMatches.length),
          damage: Math.round(totalDamage / sideMatches.length),
        },
        timeSpentMinutes: Math.floor(totalDuration / 60),
      };
    };

    const blueSide = calculateStats(blueSideMatches);
    const redSide = calculateStats(redSideMatches);

    // Calculate comparison
    let comparison = null;
    if (blueSide && redSide) {
      const winrateDiff = blueSide.winrate - redSide.winrate;
      const gamesDiff = blueSide.games - redSide.games;
      comparison = {
        winrateDiff: Math.round(winrateDiff * 10) / 10,
        gamesDiff,
        preferredSide: blueSide.winrate > redSide.winrate ? "blue" : "red",
        winrateDifferenceText: winrateDiff > 0 
          ? `${winrateDiff.toFixed(1)}% higher on Blue` 
          : winrateDiff < 0 
            ? `${Math.abs(winrateDiff).toFixed(1)}% higher on Red`
            : "Equal winrate",
      };
    }

    return NextResponse.json({
      blueSide,
      redSide,
      comparison,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("Error fetching side stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
