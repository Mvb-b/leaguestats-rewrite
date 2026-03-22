/**
 * POST /api/summoner/champions
 * Stats por campeón
 * Input: { puuid: string, region: string }
 * Retorna: array con stats de cada campeón
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isValidRegion } from "@/lib/riot-api";
import { getSummonerChampionStats } from "@/lib/db";

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

    const championStats = await getSummonerChampionStats(puuid);

    const formattedStats = championStats.map((c) => {
      const games = c._count.matchId;
      const wins = c._sum.win || 0;
      const winrate = games > 0 ? Math.round((wins / games) * 100) : 0;
      const kills = c._sum.kills || 0;
      const deaths = c._sum.deaths || 0;
      const assists = c._sum.assists || 0;
      const kda = deaths > 0 ? (kills + assists) / deaths : kills + assists;

      return {
        championId: c.championId,
        championName: c.championName,
        games,
        wins,
        losses: games - wins,
        winrate,
        kills,
        deaths,
        assists,
        kda: Math.round(kda * 100) / 100,
      };
    });

    return NextResponse.json({
      champions: formattedStats,
      totalChampions: formattedStats.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching champion stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
